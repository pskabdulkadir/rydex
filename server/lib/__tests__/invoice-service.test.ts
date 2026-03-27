import { describe, it, expect } from 'vitest';
import { GenerateInvoiceRequest } from '@shared/api';
import {
  createInvoice,
  getInvoice,
  getUserInvoices,
  updateInvoice,
  generateInvoiceHTML,
  getInvoiceResponse,
} from '../invoice-service';

describe('Invoice Service', () => {
  const mockInvoiceRequest: GenerateInvoiceRequest = {
    userId: 'test-user-123',
    paymentId: 'pay_123456',
    packageId: 'starter',
    amount: 2990,
    currency: 'TRY',
    userEmail: 'test@example.com',
    userName: 'Test User'
  };

  describe('createInvoice', () => {
    it('Yeni fatura oluşturmalı', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      
      expect(invoice).toBeDefined();
      expect(invoice.id).toBeDefined();
      expect(invoice.invoiceNumber).toBeDefined();
      expect(invoice.userId).toBe(mockInvoiceRequest.userId);
      expect(invoice.paymentId).toBe(mockInvoiceRequest.paymentId);
      expect(invoice.packageId).toBe(mockInvoiceRequest.packageId);
      expect(invoice.amount).toBe(mockInvoiceRequest.amount);
      expect(invoice.currency).toBe(mockInvoiceRequest.currency);
      expect(invoice.userEmail).toBe(mockInvoiceRequest.userEmail);
      expect(invoice.userName).toBe(mockInvoiceRequest.userName);
    });

    it('Faturanın durumu "issued" olmalı', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      expect(invoice.status).toBe('issued');
    });

    it('Faturada satır öğeleri bulunmalı', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      expect(invoice.items.length).toBeGreaterThan(0);
      expect(invoice.items[0].description).toContain('Paketi');
      expect(invoice.items[0].quantity).toBe(1);
      expect(invoice.items[0].total).toBe(mockInvoiceRequest.amount);
    });

    it('Faturada geçerli tarihler olmalı', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      expect(invoice.issueDate).toBeLessThanOrEqual(Date.now());
      expect(invoice.dueDate).toBeGreaterThan(invoice.issueDate);
    });

    it('İnvoice numarası geçerli formatta olmalı', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      expect(invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
    });
  });

  describe('getInvoice', () => {
    it('Oluşturulan faturayı ID ile alabilmeli', () => {
      const created = createInvoice(mockInvoiceRequest);
      const retrieved = getInvoice(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.invoiceNumber).toBe(created.invoiceNumber);
    });

    it('Varolmayan fatura null döndürmeli', () => {
      const invoice = getInvoice('non-existent-id');
      expect(invoice).toBeNull();
    });
  });

  describe('getUserInvoices', () => {
    it('Kullanıcının tüm faturalarını listelemeli', () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';
      
      const invoice1 = createInvoice({
        ...mockInvoiceRequest,
        userId: user1Id,
        paymentId: 'pay_1'
      });

      const invoice2 = createInvoice({
        ...mockInvoiceRequest,
        userId: user1Id,
        paymentId: 'pay_2'
      });

      const invoice3 = createInvoice({
        ...mockInvoiceRequest,
        userId: user2Id,
        paymentId: 'pay_3'
      });

      const user1Invoices = getUserInvoices(user1Id);
      const user2Invoices = getUserInvoices(user2Id);

      expect(user1Invoices.length).toBe(2);
      expect(user2Invoices.length).toBe(1);
    });

    it('Kullanıcısı olmayan ID boş dizi döndürmeli', () => {
      const invoices = getUserInvoices('non-existent-user');
      expect(invoices).toEqual([]);
    });
  });

  describe('updateInvoice', () => {
    it('Faturayı güncelleyebilmeli', () => {
      const created = createInvoice(mockInvoiceRequest);
      const updated = updateInvoice(created.id, {
        status: 'paid',
        notes: 'Test notu'
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('paid');
      expect(updated?.notes).toBe('Test notu');
    });

    it('Varolmayan fatura null döndürmeli', () => {
      const updated = updateInvoice('non-existent-id', { status: 'paid' });
      expect(updated).toBeNull();
    });

    it('Güncellemeler orijinal faturayı değiştirmeli', () => {
      const created = createInvoice(mockInvoiceRequest);
      const originalStatus = created.status;
      
      updateInvoice(created.id, { status: 'paid' });
      const retrieved = getInvoice(created.id);
      
      expect(retrieved?.status).not.toBe(originalStatus);
      expect(retrieved?.status).toBe('paid');
    });
  });

  describe('generateInvoiceHTML', () => {
    it('Geçerli HTML oluşturmalı', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const html = generateInvoiceHTML(invoice);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('Fatura numarasını HTML\'de içermeli', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const html = generateInvoiceHTML(invoice);

      expect(html).toContain(invoice.invoiceNumber);
    });

    it('Müşteri adını HTML\'de içermeli', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const html = generateInvoiceHTML(invoice);

      expect(html).toContain(invoice.userName);
    });

    it('E-posta adresini HTML\'de içermeli', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const html = generateInvoiceHTML(invoice);

      expect(html).toContain(invoice.userEmail);
    });

    it('Tutarı HTML\'de içermeli', () => {
      const invoice = createInvoice({
        ...mockInvoiceRequest,
        amount: 1000
      });
      const html = generateInvoiceHTML(invoice);

      // HTML içinde 1000 sayısı bulunmalı
      expect(html).toMatch(/1000|1\.000/);
    });

    it('Para birimi sembolünü HTML\'de içermeli', () => {
      const invoice = createInvoice({
        ...mockInvoiceRequest,
        currency: 'TRY'
      });
      const html = generateInvoiceHTML(invoice);

      expect(html).toContain('₺');
    });

    it('Satır öğelerini HTML tablosunda göstermeli', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const html = generateInvoiceHTML(invoice);

      expect(html).toContain('<table');
      invoice.items.forEach(item => {
        expect(html).toContain(item.description);
      });
    });
  });

  describe('getInvoiceResponse', () => {
    it('Fatura response nesnesi döndürmeli', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const response = getInvoiceResponse(invoice);

      expect(response.success).toBe(true);
      expect(response.invoiceId).toBe(invoice.id);
      expect(response.invoiceNumber).toBe(invoice.invoiceNumber);
    });

    it('Başarılı durum mesajı içermeli', () => {
      const invoice = createInvoice(mockInvoiceRequest);
      const response = getInvoiceResponse(invoice);

      expect(response.message).toContain('başarıyla oluşturuldu');
    });
  });

  describe('Fatura İş Akışı', () => {
    it('Tam fatura oluşturma ve güncelleme akışı', () => {
      // 1. Fatura oluştur
      const created = createInvoice(mockInvoiceRequest);
      expect(created.status).toBe('issued');

      // 2. Faturayı al
      const retrieved = getInvoice(created.id);
      expect(retrieved).toBeDefined();

      // 3. Faturayı güncelle (ödendi olarak işaretle)
      const updated = updateInvoice(created.id, { status: 'paid' });
      expect(updated?.status).toBe('paid');

      // 4. HTML oluştur
      const html = generateInvoiceHTML(updated!);
      expect(html).toContain('ÖDENDI');

      // 5. Response oluştur
      const response = getInvoiceResponse(updated!);
      expect(response.success).toBe(true);
    });

    it('Farklı para birimleri desteklemeli', () => {
      const currencies = ['TRY', 'USD', 'EUR', 'GBP'] as const;

      currencies.forEach(currency => {
        const invoice = createInvoice({
          ...mockInvoiceRequest,
          currency,
          paymentId: `pay_${currency}`
        });

        expect(invoice.currency).toBe(currency);
        const html = generateInvoiceHTML(invoice);
        expect(html).toContain(currency);
      });
    });
  });
});
