import { Currency, CurrencyInfo, CurrencyRates } from '@shared/api';

/**
 * Para Birimi Yönetim Servisi
 * Döviz kurları, dönüşümler ve para birimi bilgilerini yönetir
 */

// Varsayılan döviz kurları (TRY temel para birimi)
// Güncellemeler gerçek kaynaklardan (API) yapılabilir
const defaultExchangeRates: Record<Currency, number> = {
  TRY: 1.0,
  USD: 0.032, // ~1 USD = 31 TRY
  EUR: 0.035, // ~1 EUR = 28.5 TRY
  GBP: 0.041, // ~1 GBP = 24.3 TRY
};

const currencyInfo: Record<Currency, CurrencyInfo> = {
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Türk Lirası',
    exchangeRate: defaultExchangeRates.TRY,
    locale: 'tr-TR',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Amerikan Doları',
    exchangeRate: defaultExchangeRates.USD,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    exchangeRate: defaultExchangeRates.EUR,
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'İngiliz Sterlini',
    exchangeRate: defaultExchangeRates.GBP,
    locale: 'en-GB',
  },
};

/**
 * Para birimi bilgilerini al
 */
export function getCurrencyInfo(currency: Currency): CurrencyInfo {
  return currencyInfo[currency];
}

/**
 * Tüm desteklenen para birimlerini al
 */
export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(currencyInfo);
}

/**
 * Mevcut döviz kurlarını al
 */
export function getExchangeRates(): CurrencyRates {
  return {
    baseCurrency: 'TRY',
    timestamp: Date.now(),
    rates: { ...defaultExchangeRates },
  };
}

/**
 * Para birimini TRY'ye dönüştür
 * @param amount Tutar
 * @param fromCurrency Kaynak para birimi
 * @returns TRY cinsinden tutar
 */
export function convertToTRY(amount: number, fromCurrency: Currency): number {
  const info = currencyInfo[fromCurrency];
  if (!info) {
    throw new Error(`Desteklenmeyen para birimi: ${fromCurrency}`);
  }
  return amount / info.exchangeRate;
}

/**
 * Bir para biriminden diğerine dönüştür
 * @param amount Tutar
 * @param fromCurrency Kaynak para birimi
 * @param toCurrency Hedef para birimi
 * @returns Dönüştürülmüş tutar
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const tryAmount = convertToTRY(amount, fromCurrency);
  const toInfo = currencyInfo[toCurrency];
  if (!toInfo) {
    throw new Error(`Desteklenmeyen para birimi: ${toCurrency}`);
  }
  
  return tryAmount * toInfo.exchangeRate;
}

/**
 * Para birimini formatla
 * @param amount Tutar
 * @param currency Para birimi
 * @returns Formatlanmış tutar (örn: $100.50, ₺3,500.00)
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const info = currencyInfo[currency];
  if (!info) {
    return amount.toString();
  }

  const formatter = new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Gerçek döviz kurlarını API'den güncelle (opsiyonel)
 * Şu anda placeholder, gerçek API entegrasyonu için kullanılabilir
 */
export async function updateExchangeRatesFromAPI(): Promise<CurrencyRates> {
  try {
    // Placeholder: Gerçek uygulamada Open Exchange Rates, XE.com vb. kullanılabilir
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
    // const data = await response.json();
    
    console.log('ℹ Döviz kurları güncellemesi henüz entegre edilmemiştir');
    
    return getExchangeRates();
  } catch (error) {
    console.warn('Döviz kurları API güncellemesi başarısız, varsayılan kurlar kullanılıyor:', error);
    return getExchangeRates();
  }
}

/**
 * Para birimi doğrulaması
 */
export function isValidCurrency(currency: any): currency is Currency {
  return ['TRY', 'USD', 'EUR', 'GBP'].includes(currency);
}

/**
 * PayTR için ödeme tutarını kuruş cinsine dönüştür
 * @param amount Tutar (TRY)
 * @returns Kuruş cinsinden tutar
 */
export function convertToPayTRFormat(amount: number): number {
  return Math.round(amount * 100); // 100 kuruş = 1 TRY
}

/**
 * PayTR tarafından gelen kuruş cinsindeki tutarı TRY'ye dönüştür
 * @param amountInKurus Tutar (kuruş)
 * @returns TRY cinsinden tutar
 */
export function convertFromPayTRFormat(amountInKurus: number): number {
  return Math.round((amountInKurus / 100) * 100) / 100; // 2 ondalık basamak
}

/**
 * Invoice numarası oluştur
 * Format: INV-YYYY-NNNNN
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `INV-${year}-${random}`;
}
