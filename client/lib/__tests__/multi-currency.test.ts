import { describe, it, expect } from 'vitest';

/**
 * Multi-Currency API Integration Tests
 * 
 * Bu testler şu endpoint'leri test eder:
 * - GET /api/currency/supported
 * - GET /api/currency/rates
 * - POST /api/currency/convert
 * - POST /api/currency/format
 */

describe('Multi-Currency API', () => {
  const API_BASE = 'http://localhost:8080/api';

  describe('GET /api/currency/supported', () => {
    it('Desteklenen para birimlerini döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/supported`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.count).toBeGreaterThan(0);

      // En az TRY, USD, EUR, GBP olmalı
      const codes = data.data.map((c: any) => c.code);
      expect(codes).toContain('TRY');
      expect(codes).toContain('USD');
      expect(codes).toContain('EUR');
      expect(codes).toContain('GBP');
    });

    it('Her para biriminin doğru alanları olmalı', async () => {
      const response = await fetch(`${API_BASE}/currency/supported`);
      const data = await response.json();

      data.data.forEach((currency: any) => {
        expect(currency).toHaveProperty('code');
        expect(currency).toHaveProperty('symbol');
        expect(currency).toHaveProperty('name');
        expect(currency).toHaveProperty('exchangeRate');
        expect(currency).toHaveProperty('locale');
      });
    });
  });

  describe('GET /api/currency/rates', () => {
    it('Döviz kurlarını döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/rates`);
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.baseCurrency).toBe('TRY');
    });

    it('Tüm para birimleri için oran içermeli', async () => {
      const response = await fetch(`${API_BASE}/currency/rates`);
      const data = await response.json();

      expect(data.data.rates).toHaveProperty('TRY');
      expect(data.data.rates).toHaveProperty('USD');
      expect(data.data.rates).toHaveProperty('EUR');
      expect(data.data.rates).toHaveProperty('GBP');
    });

    it('TRY tabanında 1.0 oranı olmalı', async () => {
      const response = await fetch(`${API_BASE}/currency/rates`);
      const data = await response.json();

      expect(data.data.rates.TRY).toBe(1.0);
    });
  });

  describe('POST /api/currency/convert', () => {
    it('Para birimini dönüştürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          fromCurrency: 'TRY',
          toCurrency: 'USD'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.convertedAmount).toBeGreaterThan(0);
      expect(data.data.convertedCurrency).toBe('USD');
    });

    it('TRY\'den USD\'ye dönüştürmek daha küçük tutar döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000,
          fromCurrency: 'TRY',
          toCurrency: 'USD'
        })
      });

      const data = await response.json();
      expect(data.data.convertedAmount).toBeLessThan(1000);
    });

    it('USD\'den TRY\'ye dönüştürmek daha büyük tutar döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'TRY'
        })
      });

      const data = await response.json();
      expect(data.data.convertedAmount).toBeGreaterThan(100);
    });

    it('Eksik parametrelerle 400 hatası döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100
          // toCurrency eksik
        })
      });

      expect(response.status).toBe(400);
    });

    it('Geçersiz para birimle 400 hatası döndürmeli', async () => {
      const response = await fetch(`${API_BASE}/currency/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          fromCurrency: 'INVALID',
          toCurrency: 'TRY'
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/currency/format', () => {
    it('Para birimini formatlamalı', async () => {
      const response = await fetch(`${API_BASE}/currency/format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000,
          currency: 'TRY'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.formatted).toBeDefined();
      expect(data.data.formatted).toContain('₺');
    });

    it('USD formatında $ sembolü içermeli', async () => {
      const response = await fetch(`${API_BASE}/currency/format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          currency: 'USD'
        })
      });

      const data = await response.json();
      expect(data.data.formatted).toContain('$');
    });

    it('EUR formatında € sembolü içermeli', async () => {
      const response = await fetch(`${API_BASE}/currency/format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          currency: 'EUR'
        })
      });

      const data = await response.json();
      expect(data.data.formatted).toContain('€');
    });
  });

  describe('Para Birimi Entegrasyonu', () => {
    it('Desteklenen para birimlerini almak ve dönüştürmek mümkün olmalı', async () => {
      // 1. Desteklenen para birimlerini al
      const currenciesRes = await fetch(`${API_BASE}/currency/supported`);
      const currenciesData = await currenciesRes.json();
      const currencies = currenciesData.data;

      expect(currencies.length).toBeGreaterThan(0);

      // 2. İlk para biriminden sonuncusuna dönüştür
      const fromCurrency = currencies[0].code;
      const toCurrency = currencies[currencies.length - 1].code;

      const convertRes = await fetch(`${API_BASE}/currency/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          fromCurrency,
          toCurrency
        })
      });

      expect(convertRes.ok).toBe(true);
      const convertData = await convertRes.json();
      expect(convertData.success).toBe(true);
    });
  });
});
