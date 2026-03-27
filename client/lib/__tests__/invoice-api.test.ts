import { describe, it, expect } from 'vitest';

/**
 * Invoice API Integration Tests
 * 
 * Bu testler şu endpoint'leri test eder:
 * - POST /api/invoice/generate
 * - GET /api/invoice/:invoiceId
 * - GET /api/invoice/user/:userId
 * - PUT /api/invoice/:invoiceId
 * - GET /api/invoice/:invoiceId/download
 * - GET /api/invoice/:invoiceId/view
 */

describe('Invoice API', () => {
  const API_BASE = 'http://localhost:8080/api';
  
  let createdInvoiceId: string;

  describe('POST /api/invoice/generate', () => {
    it('Fatura oluşturmalı', async () => {
      const response = await fetch(`${API_BASE}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-123',
          paymentId: 'pay_123456',
          packageId: 'starter',
          amount: 2990,
          currency: 'TRY',
          userEmail: 'test@example.com',
          userName: 'Test User'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.invoiceId).toBeDefined();
      expect(data.invoiceNumber).toBeDefined();
      expect(data.invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);

      createdInvoiceId = data.invoiceId;
    });

    it('Eksik parametrelerle 400 hatası döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user',
          paymentId: 'pay_123',
          // packageId eksik
          amount: 1000,
          currency: 'TRY'
        })
      });

      expect(response.status).toBe(400);
    });

    it('Farklı para birimleri ile fatura oluşturmalı', async () => {
      const currencies = ['TRY', 'USD', 'EUR', 'GBP'];

      for (const currency of currencies) {
        const response = await fetch(`${API_BASE}/invoice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: `user-${currency}`,
            paymentId: `pay-${currency}`,
            packageId: 'starter',
            amount: 1000,
            currency: currency as any,
            userEmail: 'test@example.com'
          })
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });

  describe('GET /api/invoice/:invoiceId', () => {
    it('Faturayı ID ile alabilmeli', async () => {
      if (!createdInvoiceId) {
        // Önce fatura oluştur
        const createRes = await fetch(`${API_BASE}/invoice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'test-user-123',
            paymentId: 'pay_test_123',
            packageId: 'starter',
            amount: 2990,
            currency: 'TRY',
            userEmail: 'test@example.com'
          })
        });
        const createData = await createRes.json();
        createdInvoiceId = createData.invoiceId;
      }

      const response = await fetch(`${API_BASE}/invoice/${createdInvoiceId}`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(createdInvoiceId);
    });

    it('Varolmayan fatura 404 döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/invoice/non-existent-id`);
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/invoice/user/:userId', () => {
    it('Kullanıcı faturalarını listelemeli', async () => {
      const userId = 'list-test-user';

      // Önce test faturası oluştur
      await fetch(`${API_BASE}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          paymentId: 'pay_list_1',
          packageId: 'starter',
          amount: 1000,
          currency: 'TRY',
          userEmail: 'test@example.com'
        })
      });

      const response = await fetch(`${API_BASE}/invoice/user/${userId}`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it('Faturası olmayan kullanıcı boş dizi döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/invoice/user/non-existent-user`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
    });
  });

  describe('PUT /api/invoice/:invoiceId', () => {
    it('Faturayı güncelleyebilmeli', async () => {
      if (!createdInvoiceId) {
        // Önce fatura oluştur
        const createRes = await fetch(`${API_BASE}/invoice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'update-test-user',
            paymentId: 'pay_update_123',
            packageId: 'starter',
            amount: 2990,
            currency: 'TRY',
            userEmail: 'test@example.com'
          })
        });
        const createData = await createRes.json();
        createdInvoiceId = createData.invoiceId;
      }

      const response = await fetch(`${API_BASE}/invoice/${createdInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          notes: 'Test güncellemesi'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('paid');
      expect(data.data.notes).toBe('Test güncellemesi');
    });

    it('Varolmayan fatura 404 döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/invoice/non-existent-id`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/invoice/:invoiceId/view', () => {
    it('Faturayı HTML olarak döndürmeli', async () => {
      if (!createdInvoiceId) {
        // Önce fatura oluştur
        const createRes = await fetch(`${API_BASE}/invoice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'html-test-user',
            paymentId: 'pay_html_123',
            packageId: 'starter',
            amount: 2990,
            currency: 'TRY',
            userEmail: 'test@example.com'
          })
        });
        const createData = await createRes.json();
        createdInvoiceId = createData.invoiceId;
      }

      const response = await fetch(`${API_BASE}/invoice/${createdInvoiceId}/view`);
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('HTML fatura müşteri bilgisini içermeli', async () => {
      const userId = 'html-info-test';
      const userEmail = 'info@example.com';

      const createRes = await fetch(`${API_BASE}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          paymentId: 'pay_info_123',
          packageId: 'starter',
          amount: 2990,
          currency: 'TRY',
          userEmail: userEmail,
          userName: 'Test Adı'
        })
      });

      const createData = await createRes.json();
      const invoiceId = createData.invoiceId;

      const viewRes = await fetch(`${API_BASE}/invoice/${invoiceId}/view`);
      const html = await viewRes.text();

      expect(html).toContain(userEmail);
      expect(html).toContain('Test Adı');
    });
  });

  describe('GET /api/invoice/:invoiceId/download', () => {
    it('Faturayı indirme başlığıyla döndürmeli', async () => {
      if (!createdInvoiceId) {
        // Önce fatura oluştur
        const createRes = await fetch(`${API_BASE}/invoice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'download-test-user',
            paymentId: 'pay_download_123',
            packageId: 'starter',
            amount: 2990,
            currency: 'TRY',
            userEmail: 'test@example.com'
          })
        });
        const createData = await createRes.json();
        createdInvoiceId = createData.invoiceId;
      }

      const response = await fetch(`${API_BASE}/invoice/${createdInvoiceId}/download`);
      expect(response.ok).toBe(true);
      
      const contentDisposition = response.headers.get('content-disposition');
      expect(contentDisposition).toContain('attachment');
      expect(contentDisposition).toContain('fatura');
    });
  });

  describe('Invoice İş Akışı', () => {
    it('Tam fatura oluşturma ve sorgu akışı', async () => {
      const userId = 'workflow-test-user';
      const paymentId = 'pay_workflow_123';

      // 1. Fatura oluştur
      const createRes = await fetch(`${API_BASE}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentId,
          packageId: 'starter',
          amount: 2990,
          currency: 'TRY',
          userEmail: 'workflow@example.com',
          userName: 'Workflow Test'
        })
      });

      expect(createRes.status).toBe(201);
      const createData = await createRes.json();
      const invoiceId = createData.invoiceId;

      // 2. Faturayı al
      const getRes = await fetch(`${API_BASE}/invoice/${invoiceId}`);
      expect(getRes.ok).toBe(true);
      const getData = await getRes.json();
      expect(getData.data.id).toBe(invoiceId);

      // 3. Kullanıcı faturalarını listele
      const listRes = await fetch(`${API_BASE}/invoice/user/${userId}`);
      expect(listRes.ok).toBe(true);
      const listData = await listRes.json();
      expect(listData.count).toBeGreaterThan(0);

      // 4. Faturayı güncelle
      const updateRes = await fetch(`${API_BASE}/invoice/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });
      expect(updateRes.ok).toBe(true);

      // 5. HTML görüntüle
      const viewRes = await fetch(`${API_BASE}/invoice/${invoiceId}/view`);
      expect(viewRes.ok).toBe(true);
      const html = await viewRes.text();
      expect(html).toContain('Workflow Test');
    });
  });
});
