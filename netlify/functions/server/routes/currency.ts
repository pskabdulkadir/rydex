import { RequestHandler } from 'express';
import {
  getSupportedCurrencies,
  getExchangeRates,
  formatCurrency,
  convertCurrency,
  isValidCurrency,
} from '../lib/currency-service';

/**
 * Desteklenen para birimlerini getir
 * GET /api/currency/supported
 */
export const getSupportedCurrenciesHandler: RequestHandler = (_req, res) => {
  try {
    const currencies = getSupportedCurrencies();
    res.json({
      success: true,
      data: currencies,
      count: currencies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Para birimleri alınamadı',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Döviz kurlarını getir
 * GET /api/currency/rates
 */
export const getExchangeRatesHandler: RequestHandler = (_req, res) => {
  try {
    const rates = getExchangeRates();
    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Döviz kurları alınamadı',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Para birimini dönüştür
 * POST /api/currency/convert
 * Body: { amount: number, fromCurrency: Currency, toCurrency: Currency }
 */
export const convertCurrencyHandler: RequestHandler = (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar: amount, fromCurrency, toCurrency',
      });
    }

    if (!isValidCurrency(fromCurrency) || !isValidCurrency(toCurrency)) {
      return res.status(400).json({
        success: false,
        error: 'Desteklenmeyen para birimi',
      });
    }

    const converted = convertCurrency(amount, fromCurrency, toCurrency);
    const formatted = formatCurrency(converted, toCurrency);

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: parseFloat(converted.toFixed(2)),
        convertedCurrency: toCurrency,
        formatted: formatted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Para birimi dönüştürülürken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Para birimini formatla
 * POST /api/currency/format
 * Body: { amount: number, currency: Currency }
 */
export const formatCurrencyHandler: RequestHandler = (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (amount === undefined || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar: amount, currency',
      });
    }

    if (!isValidCurrency(currency)) {
      return res.status(400).json({
        success: false,
        error: 'Desteklenmeyen para birimi',
      });
    }

    const formatted = formatCurrency(amount, currency);

    res.json({
      success: true,
      data: {
        amount,
        currency,
        formatted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Para birimi formatlanırken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
