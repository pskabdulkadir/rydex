import { describe, it, expect } from 'vitest';
import {
  getCurrencyInfo,
  getSupportedCurrencies,
  getExchangeRates,
  convertToTRY,
  convertCurrency,
  formatCurrency,
  convertToPayTRFormat,
  convertFromPayTRFormat,
  generateInvoiceNumber,
  isValidCurrency,
} from '../currency-service';

describe('Currency Service', () => {
  describe('getCurrencyInfo', () => {
    it('Türk Lirası bilgisini getirmeli', () => {
      const info = getCurrencyInfo('TRY');
      expect(info.code).toBe('TRY');
      expect(info.symbol).toBe('₺');
      expect(info.exchangeRate).toBe(1.0);
    });

    it('USD bilgisini getirmeli', () => {
      const info = getCurrencyInfo('USD');
      expect(info.code).toBe('USD');
      expect(info.symbol).toBe('$');
    });

    it('EUR bilgisini getirmeli', () => {
      const info = getCurrencyInfo('EUR');
      expect(info.code).toBe('EUR');
      expect(info.symbol).toBe('€');
    });

    it('GBP bilgisini getirmeli', () => {
      const info = getCurrencyInfo('GBP');
      expect(info.code).toBe('GBP');
      expect(info.symbol).toBe('£');
    });
  });

  describe('getSupportedCurrencies', () => {
    it('Desteklenen tüm para birimlerini döndürmeli', () => {
      const currencies = getSupportedCurrencies();
      expect(currencies.length).toBe(4);
      expect(currencies.map(c => c.code)).toContain('TRY');
      expect(currencies.map(c => c.code)).toContain('USD');
      expect(currencies.map(c => c.code)).toContain('EUR');
      expect(currencies.map(c => c.code)).toContain('GBP');
    });

    it('Her para biriminin sembolü olmalı', () => {
      const currencies = getSupportedCurrencies();
      currencies.forEach(currency => {
        expect(currency.symbol).toBeDefined();
        expect(currency.symbol.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getExchangeRates', () => {
    it('TRY temel para birimi olarak döndürmeli', () => {
      const rates = getExchangeRates();
      expect(rates.baseCurrency).toBe('TRY');
      expect(rates.rates.TRY).toBe(1.0);
    });

    it('Tüm desteklenen para birimleri için oran içermeli', () => {
      const rates = getExchangeRates();
      expect(rates.rates).toHaveProperty('TRY');
      expect(rates.rates).toHaveProperty('USD');
      expect(rates.rates).toHaveProperty('EUR');
      expect(rates.rates).toHaveProperty('GBP');
    });

    it('Timestamp içermeli', () => {
      const rates = getExchangeRates();
      expect(rates.timestamp).toBeGreaterThan(0);
    });
  });

  describe('convertToTRY', () => {
    it('TRY zaten TRY ise aynı tutarı döndürmeli', () => {
      expect(convertToTRY(100, 'TRY')).toBe(100);
      expect(convertToTRY(5000, 'TRY')).toBe(5000);
    });

    it('USD\'den TRY\'ye dönüştürmeli', () => {
      const result = convertToTRY(1, 'USD');
      expect(result).toBeGreaterThan(0);
      // 1 USD ≈ 31 TRY
      expect(result).toBeGreaterThan(25);
      expect(result).toBeLessThan(35);
    });

    it('EUR\'den TRY\'ye dönüştürmeli', () => {
      const result = convertToTRY(1, 'EUR');
      expect(result).toBeGreaterThan(0);
      // 1 EUR ≈ 28.5 TRY
      expect(result).toBeGreaterThan(20);
      expect(result).toBeLessThan(35);
    });
  });

  describe('convertCurrency', () => {
    it('Aynı para birimler arasında dönüşüm aynı tutarı döndürmeli', () => {
      expect(convertCurrency(100, 'TRY', 'TRY')).toBe(100);
      expect(convertCurrency(50, 'USD', 'USD')).toBe(50);
    });

    it('USD\'den EUR\'ye dönüştürmeli', () => {
      const result = convertCurrency(100, 'USD', 'EUR');
      expect(result).toBeGreaterThan(0);
    });

    it('GBP\'den TRY\'ye dönüştürmeli', () => {
      const result = convertCurrency(100, 'GBP', 'TRY');
      expect(result).toBeGreaterThan(100);
    });
  });

  describe('formatCurrency', () => {
    it('TRY para birimini doğru formatlamalı', () => {
      const formatted = formatCurrency(1000, 'TRY');
      expect(formatted).toContain('1.000');
      expect(formatted).toContain('₺');
    });

    it('USD para birimini doğru formatlamalı', () => {
      const formatted = formatCurrency(100, 'USD');
      expect(formatted).toContain('100');
      expect(formatted).toContain('$');
    });

    it('EUR para birimini doğru formatlamalı', () => {
      const formatted = formatCurrency(50, 'EUR');
      expect(formatted).toContain('50');
      expect(formatted).toContain('€');
    });

    it('Ondalık basamakları doğru göstermeli', () => {
      const formatted = formatCurrency(99.99, 'TRY');
      expect(formatted).toContain('99');
    });
  });

  describe('convertToPayTRFormat', () => {
    it('TRY tutarını kuruş cinsine dönüştürmeli', () => {
      expect(convertToPayTRFormat(1)).toBe(100);
      expect(convertToPayTRFormat(100)).toBe(10000);
      expect(convertToPayTRFormat(1000)).toBe(100000);
    });

    it('Ondalık tutarları doğru işlemeli', () => {
      expect(convertToPayTRFormat(1.50)).toBe(150);
      expect(convertToPayTRFormat(99.99)).toBe(9999);
    });
  });

  describe('convertFromPayTRFormat', () => {
    it('Kuruş cinsini TRY\'ye dönüştürmeli', () => {
      expect(convertFromPayTRFormat(100)).toBe(1);
      expect(convertFromPayTRFormat(10000)).toBe(100);
      expect(convertFromPayTRFormat(100000)).toBe(1000);
    });

    it('Küçük tutarları doğru işlemeli', () => {
      expect(convertFromPayTRFormat(1)).toBe(0.01);
      expect(convertFromPayTRFormat(50)).toBe(0.5);
    });
  });

  describe('generateInvoiceNumber', () => {
    it('Invoice numarası oluşturmalı', () => {
      const invoiceNumber = generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
    });

    it('Her seferinde farklı numara oluşturmalı', () => {
      const num1 = generateInvoiceNumber();
      const num2 = generateInvoiceNumber();
      // İstatistiksel olarak eşit olma ihtimali çok düşük
      expect(num1).not.toBe(num2);
    });

    it('Geçerli yıl formatı içermeli', () => {
      const invoiceNumber = generateInvoiceNumber();
      const year = new Date().getFullYear();
      expect(invoiceNumber).toContain(year.toString());
    });
  });

  describe('isValidCurrency', () => {
    it('Geçerli para birimlerini tanımalı', () => {
      expect(isValidCurrency('TRY')).toBe(true);
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('EUR')).toBe(true);
      expect(isValidCurrency('GBP')).toBe(true);
    });

    it('Geçersiz para birimlerini reddetmeli', () => {
      expect(isValidCurrency('XYZ')).toBe(false);
      expect(isValidCurrency('TRY2')).toBe(false);
      expect(isValidCurrency('TRy')).toBe(false);
      expect(isValidCurrency('')).toBe(false);
      expect(isValidCurrency(null)).toBe(false);
    });
  });
});
