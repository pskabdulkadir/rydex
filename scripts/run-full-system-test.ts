/**
 * Full System Test Script
 * 
 * Tüm API endpoint'lerini, servisleri ve modülleri test eder.
 * 
 * Kullanım:
 * 1. npm run test:full-system
 * 2. Rapor: test-results.json veya TEST_RESULTS.md
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Test sonuçları
const testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [] as Array<{
    name: string;
    category: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message?: string;
    error?: string;
  }>,
  errors: [] as string[]
};

function logTest(name: string, category: string, status: 'PASS' | 'FAIL' | 'SKIP', message?: string, error?: string) {
  testResults.totalTests++;
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;

  testResults.tests.push({ name, category, status, message, error });

  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} [${category}] ${name}${message ? ` - ${message}` : ''}${error ? ` [ERROR: ${error}]` : ''}`);
}

async function runFullSystemTest() {
  console.log('🚀 Full System Test Başlatılıyor...\n');
  console.log('📊 Proje Bilgileri:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Ortam: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port: ${process.env.PORT || '5173'}`);
  console.log('');

  // ==================== IMPORT TESTS ====================
  console.log('📋 IMPORT TESTS\n');

  // Test 1: Currency Service Import
  try {
    const { getCurrencyInfo, getSupportedCurrencies, getExchangeRates } = await import('../server/lib/currency-service');
    if (getCurrencyInfo && getSupportedCurrencies && getExchangeRates) {
      logTest('Currency Service Import', 'IMPORT', 'PASS', 'Tüm fonksiyonlar mevcut');
    } else {
      logTest('Currency Service Import', 'IMPORT', 'FAIL', 'Bazı fonksiyonlar eksik');
    }
  } catch (error) {
    logTest('Currency Service Import', 'IMPORT', 'FAIL', '', (error as Error).message);
    testResults.errors.push(`Currency Service import failed: ${(error as Error).message}`);
  }

  // Test 2: Invoice Service Import
  try {
    const invoiceService = await import('../server/lib/invoice-service');
    if (invoiceService.createInvoice && invoiceService.getInvoice && invoiceService.getUserInvoices) {
      logTest('Invoice Service Import', 'IMPORT', 'PASS', 'Tüm fonksiyonlar mevcut');
    } else {
      logTest('Invoice Service Import', 'IMPORT', 'FAIL', 'Bazı fonksiyonlar eksik');
    }
  } catch (error) {
    logTest('Invoice Service Import', 'IMPORT', 'FAIL', '', (error as Error).message);
    testResults.errors.push(`Invoice Service import failed: ${(error as Error).message}`);
  }

  // Test 3: Firebase Admin Import
  try {
    const { initializeFirebaseAdmin } = await import('../server/lib/firebase-admin');
    if (initializeFirebaseAdmin) {
      logTest('Firebase Admin Import', 'IMPORT', 'PASS', 'Firebase Admin SDK mevcut');
    } else {
      logTest('Firebase Admin Import', 'IMPORT', 'FAIL', 'Firebase Admin SDK eksik');
    }
  } catch (error) {
    logTest('Firebase Admin Import', 'IMPORT', 'SKIP', 'Firebase Admin SDK opsiyonel', (error as Error).message);
  }

  // Test 4: Database Import
  try {
    const { initializeDatabase, getDatabase } = await import('../server/database');
    if (initializeDatabase && getDatabase) {
      logTest('Database Import', 'IMPORT', 'PASS', 'Database modülü mevcut');
    } else {
      logTest('Database Import', 'IMPORT', 'FAIL', 'Database modülü eksik');
    }
  } catch (error) {
    logTest('Database Import', 'IMPORT', 'FAIL', '', (error as Error).message);
    testResults.errors.push(`Database import failed: ${(error as Error).message}`);
  }

  // ==================== CURRENCY SERVICE TESTS ====================
  console.log('\n📋 CURRENCY SERVICE TESTS\n');

  try {
    const currency = await import('../server/lib/currency-service');

    // Test 5: getCurrencyInfo
    try {
      const info = currency.getCurrencyInfo('TRY');
      if (info && info.code === 'TRY' && info.symbol === '₺') {
        logTest('getCurrencyInfo(TRY)', 'CURRENCY', 'PASS', `Sembol: ${info.symbol}`);
      } else {
        logTest('getCurrencyInfo(TRY)', 'CURRENCY', 'FAIL', 'Geçersiz TRY bilgisi');
      }
    } catch (error) {
      logTest('getCurrencyInfo(TRY)', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }

    // Test 6: getSupportedCurrencies
    try {
      const currencies = currency.getSupportedCurrencies();
      if (currencies && currencies.length === 4) {
        logTest('getSupportedCurrencies', 'CURRENCY', 'PASS', `${currencies.length} para birimi`);
      } else {
        logTest('getSupportedCurrencies', 'CURRENCY', 'FAIL', `Beklenen: 4, Alınan: ${currencies?.length || 0}`);
      }
    } catch (error) {
      logTest('getSupportedCurrencies', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }

    // Test 7: getExchangeRates
    try {
      const rates = currency.getExchangeRates();
      if (rates && rates.baseCurrency === 'TRY' && rates.rates) {
        logTest('getExchangeRates', 'CURRENCY', 'PASS', `Temel: ${rates.baseCurrency}`);
      } else {
        logTest('getExchangeRates', 'CURRENCY', 'FAIL', 'Geçersiz döviz kurları');
      }
    } catch (error) {
      logTest('getExchangeRates', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }

    // Test 8: convertToTRY
    try {
      const result = currency.convertToTRY(1, 'USD');
      if (result && result > 0) {
        logTest('convertToTRY(1 USD)', 'CURRENCY', 'PASS', `${result.toFixed(2)} TRY`);
      } else {
        logTest('convertToTRY(1 USD)', 'CURRENCY', 'FAIL', 'Geçersiz dönüşüm');
      }
    } catch (error) {
      logTest('convertToTRY(1 USD)', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }

    // Test 9: formatCurrency
    try {
      const formatted = currency.formatCurrency(1000, 'TRY');
      if (formatted && formatted.includes('₺')) {
        logTest('formatCurrency(1000, TRY)', 'CURRENCY', 'PASS', formatted);
      } else {
        logTest('formatCurrency(1000, TRY)', 'CURRENCY', 'FAIL', 'Geçersiz format');
      }
    } catch (error) {
      logTest('formatCurrency(1000, TRY)', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }

    // Test 10: generateInvoiceNumber
    try {
      const invoiceNumber = currency.generateInvoiceNumber();
      if (invoiceNumber && invoiceNumber.match(/^INV-\d{4}-\d{5}$/)) {
        logTest('generateInvoiceNumber', 'CURRENCY', 'PASS', invoiceNumber);
      } else {
        logTest('generateInvoiceNumber', 'CURRENCY', 'FAIL', `Geçersiz format: ${invoiceNumber}`);
      }
    } catch (error) {
      logTest('generateInvoiceNumber', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }

    // Test 11: isValidCurrency
    try {
      const valid = currency.isValidCurrency('USD');
      const invalid = currency.isValidCurrency('XYZ');
      if (valid === true && invalid === false) {
        logTest('isValidCurrency', 'CURRENCY', 'PASS', 'USD: true, XYZ: false');
      } else {
        logTest('isValidCurrency', 'CURRENCY', 'FAIL', `Geçersiz sonuçlar: USD=${valid}, XYZ=${invalid}`);
      }
    } catch (error) {
      logTest('isValidCurrency', 'CURRENCY', 'FAIL', '', (error as Error).message);
    }
  } catch (error) {
    logTest('Currency Service Tests', 'CURRENCY', 'FAIL', 'Import edilemedi', (error as Error).message);
  }

  // ==================== INVOICE SERVICE TESTS ====================
  console.log('\n📋 INVOICE SERVICE TESTS\n');

  try {
    const invoice = await import('../server/lib/invoice-service');

    // Test 12: createInvoice
    try {
      const testInvoice = {
        userId: 'test-user-123',
        items: [{ name: 'Test Ürün', price: 100, quantity: 1 }],
        currency: 'TRY'
      };
      const result = await invoice.createInvoice(testInvoice);
      if (result && result.id) {
        logTest('createInvoice', 'INVOICE', 'PASS', `Invoice ID: ${result.id}`);
      } else {
        logTest('createInvoice', 'INVOICE', 'FAIL', 'Invoice oluşturulamadı');
      }
    } catch (error) {
      logTest('createInvoice', 'INVOICE', 'FAIL', '', (error as Error).message);
    }

    // Test 13: getInvoiceById
    try {
      // Önce bir invoice oluştur
      const testInvoice = {
        userId: 'test-user-456',
        items: [{ name: 'Test', price: 50, quantity: 2 }],
        currency: 'TRY'
      };
      const created = await invoice.createInvoice(testInvoice);
      if (created && created.id) {
        // getInvoiceById fonksiyonunu kullan (artık mevcut)
        const retrieved = invoice.getInvoiceById ? invoice.getInvoiceById(created.id) : null;
        if (retrieved && retrieved.id === created.id) {
          logTest('getInvoiceById', 'INVOICE', 'PASS', `Invoice bulundu: ${retrieved.id}`);
        } else {
          logTest('getInvoiceById', 'INVOICE', 'FAIL', 'Invoice bulunamadı');
        }
      } else {
        logTest('getInvoiceById', 'INVOICE', 'SKIP', 'Önceki test başarısız');
      }
    } catch (error) {
      logTest('getInvoiceById', 'INVOICE', 'FAIL', '', (error as Error).message);
    }

    // Test 14: getUserInvoices
    try {
      const invoices = await invoice.getUserInvoices('test-user-123');
      if (Array.isArray(invoices)) {
        logTest('getUserInvoices', 'INVOICE', 'PASS', `${invoices.length} invoice bulundu`);
      } else {
        logTest('getUserInvoices', 'INVOICE', 'FAIL', 'Dizi döndürülmedi');
      }
    } catch (error) {
      logTest('getUserInvoices', 'INVOICE', 'FAIL', '', (error as Error).message);
    }
  } catch (error) {
    logTest('Invoice Service Tests', 'INVOICE', 'FAIL', 'Import edilemedi', (error as Error).message);
  }

  // ==================== DATABASE TESTS ====================
  console.log('\n📋 DATABASE TESTS\n');

  try {
    const { initializeDatabase } = await import('../server/database');

    // Tüm database testlerini aynı scope'ta çalıştır
    const db = initializeDatabase({ useInMemory: true });

    // Test 15: Initialize Database
    if (db) {
      logTest('Initialize Database', 'DATABASE', 'PASS', 'Veritabanı başlatıldı');
    } else {
      logTest('Initialize Database', 'DATABASE', 'FAIL', 'Veritabanı başlatılamadı');
    }

    // Test 16: Save and Retrieve Scan
    try {
      const testScan = {
        id: `scan_${Date.now()}`,
        userId: 'test-user',
        title: 'Test Tarama',
        description: 'Test tarama açıklaması',
        location: {
          latitude: 41.0082,
          longitude: 28.9784,
          address: 'İstanbul, Türkiye'
        },
        satelliteImageUrl: 'https://example.com/satellite.jpg',
        depth: 5,
        area: 100,
        features: {
          magnetometer: { x: 1, y: 2, z: 3 },
          geologyAnalysis: 'Test jeoloji',
          archaeologyDatabase: 'Test arkeoloji',
          topography: 'Test topografya',
          climateData: 'Test iklim',
          artifactDetection: 'Test eser'
        },
        timestamp: Date.now()
      };
      const result = await db.saveScan(testScan);
      if (result.success) {
        logTest('Save Scan', 'DATABASE', 'PASS', `Scan kaydedildi: ${testScan.id}`);
      } else {
        logTest('Save Scan', 'DATABASE', 'FAIL', `Hata: ${result.error || 'Bilinmeyen'}`);
      }
    } catch (error) {
      logTest('Save Scan', 'DATABASE', 'FAIL', '', (error as Error).message);
    }

    // Test 17: Save and Retrieve User - aynı db instance'ı kullan
    try {
      // saveUser fonksiyonu varsa test et
      if (typeof (db as any).saveUser === 'function') {
        const testUser = {
          id: `user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          username: `testuser_${Date.now()}`,
          phone: '+905551234567',
          password_hash: 'hashed_password',
          display_name: 'Test User',
          created_at: new Date().toISOString()
        };
        const result = await (db as any).saveUser(testUser);
        if (result.success) {
          logTest('Save User', 'DATABASE', 'PASS', `User kaydedildi: ${testUser.id}`);
        } else {
          logTest('Save User', 'DATABASE', 'FAIL', 'User kaydedilemedi');
        }
      } else {
        logTest('Save User', 'DATABASE', 'SKIP', 'saveUser fonksiyonu mevcut değil');
      }
    } catch (error) {
      logTest('Save User', 'DATABASE', 'FAIL', '', (error as Error).message);
    }

    // Test 18: Save Payment - aynı db instance'ı kullan
    try {
      // savePayment fonksiyonu varsa test et
      if (typeof (db as any).savePayment === 'function') {
        const testPayment = {
          id: `payment_${Date.now()}`,
          user_id: 'test-user',
          amount: 100,
          currency: 'TRY',
          status: 'completed',
          created_at: new Date().toISOString()
        };
        const result = await (db as any).savePayment(testPayment);
        if (result.success) {
          logTest('Save Payment', 'DATABASE', 'PASS', `Payment kaydedildi: ${testPayment.id}`);
        } else {
          logTest('Save Payment', 'DATABASE', 'FAIL', 'Payment kaydedilemedi');
        }
      } else {
        logTest('Save Payment', 'DATABASE', 'SKIP', 'savePayment fonksiyonu mevcut değil');
      }
    } catch (error) {
      logTest('Save Payment', 'DATABASE', 'FAIL', '', (error as Error).message);
    }
  } catch (error) {
    logTest('Database Tests', 'DATABASE', 'FAIL', 'Import edilemedi', (error as Error).message);
  }

  // ==================== API ENDPOINT TESTS ====================
  console.log('\n📋 API ENDPOINT TESTS\n');

  const API_BASE_URL = process.env.API_URL || 'http://localhost:5173/api';

  // Test 19: Health Check
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    if (response.ok && data.status === 'ok') {
      logTest('GET /api/health', 'API', 'PASS', 'Server çalışıyor');
    } else {
      logTest('GET /api/health', 'API', 'FAIL', `Durum: ${response.status}`);
    }
  } catch (error) {
    logTest('GET /api/health', 'API', 'SKIP', 'Server çalışmıyor olabilir', (error as Error).message);
  }

  // Test 20: Ping
  try {
    const response = await fetch(`${API_BASE_URL}/ping`);
    const data = await response.json();
    if (response.ok && data.status === 'ok') {
      logTest('GET /api/ping', 'API', 'PASS', 'Ping başarılı');
    } else {
      logTest('GET /api/ping', 'API', 'FAIL', `Durum: ${response.status}`);
    }
  } catch (error) {
    logTest('GET /api/ping', 'API', 'SKIP', 'Server çalışmıyor olabilir', (error as Error).message);
  }

  // Test 21: Currency Supported
  try {
    const response = await fetch(`${API_BASE_URL}/currency/supported`);
    const data = await response.json();
    if (response.ok && data.success) {
      logTest('GET /api/currency/supported', 'API', 'PASS', `${data.data?.length || 0} para birimi`);
    } else {
      logTest('GET /api/currency/supported', 'API', 'FAIL', `Durum: ${response.status}`);
    }
  } catch (error) {
    logTest('GET /api/currency/supported', 'API', 'SKIP', 'Server çalışmıyor olabilir', (error as Error).message);
  }

  // Test 22: Currency Rates
  try {
    const response = await fetch(`${API_BASE_URL}/currency/rates`);
    const data = await response.json();
    if (response.ok && data.success) {
      logTest('GET /api/currency/rates', 'API', 'PASS', `Temel: ${data.data?.baseCurrency || 'bilinmiyor'}`);
    } else {
      logTest('GET /api/currency/rates', 'API', 'FAIL', `Durum: ${response.status}`);
    }
  } catch (error) {
    logTest('GET /api/currency/rates', 'API', 'SKIP', 'Server çalışmıyor olabilir', (error as Error).message);
  }

  // Test 23: Search Endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=test`);
    const data = await response.json();
    if (response.ok && data.success) {
      logTest('GET /api/search?q=test', 'API', 'PASS', `${data.results?.length || 0} sonuç`);
    } else {
      logTest('GET /api/search?q=test', 'API', 'FAIL', `Durum: ${response.status}`);
    }
  } catch (error) {
    logTest('GET /api/search?q=test', 'API', 'SKIP', 'Server çalışmıyor olabilir', (error as Error).message);
  }

  // ==================== ROUTE HANDLER TESTS ====================
  console.log('\n📋 ROUTE HANDLER TESTS\n');

  // Test 24: Auth Handlers Import
  try {
    const auth = await import('../server/routes/auth');
    const requiredHandlers = ['handleRegister', 'handleLogin', 'handleGetProfile', 'handleLogout'];
    const missing = requiredHandlers.filter(h => !(h in auth));
    if (missing.length === 0) {
      logTest('Auth Handlers', 'ROUTES', 'PASS', 'Tüm handler\'lar mevcut');
    } else {
      logTest('Auth Handlers', 'ROUTES', 'FAIL', `Eksik: ${missing.join(', ')}`);
    }
  } catch (error) {
    logTest('Auth Handlers', 'ROUTES', 'FAIL', '', (error as Error).message);
  }

  // Test 25: Payment Handlers Import
  try {
    const payment = await import('../server/routes/payment');
    const requiredHandlers = ['initiatePayment', 'getPaymentStatus'];
    const missing = requiredHandlers.filter(h => !(h in payment));
    if (missing.length === 0) {
      logTest('Payment Handlers', 'ROUTES', 'PASS', 'Tüm handler\'lar mevcut');
    } else {
      logTest('Payment Handlers', 'ROUTES', 'FAIL', `Eksik: ${missing.join(', ')}`);
    }
  } catch (error) {
    logTest('Payment Handlers', 'ROUTES', 'FAIL', '', (error as Error).message);
  }

  // Test 26: Subscription Handlers Import
  try {
    const subscription = await import('../server/routes/subscription');
    const requiredHandlers = ['handleGetPlans', 'handleCreateSubscription', 'handleCancelSubscription'];
    const missing = requiredHandlers.filter(h => !(h in subscription));
    if (missing.length === 0) {
      logTest('Subscription Handlers', 'ROUTES', 'PASS', 'Tüm handler\'lar mevcut');
    } else {
      logTest('Subscription Handlers', 'ROUTES', 'FAIL', `Eksik: ${missing.join(', ')}`);
    }
  } catch (error) {
    logTest('Subscription Handlers', 'ROUTES', 'FAIL', '', (error as Error).message);
  }

  // Test 27: Middleware Import
  try {
    const middleware = await import('../server/routes/middleware');
    const requiredHandlers = ['verifyToken', 'requireAdmin', 'requireActiveSubscription'];
    const missing = requiredHandlers.filter(h => !(h in middleware));
    if (missing.length === 0) {
      logTest('Middleware Handlers', 'ROUTES', 'PASS', 'Tüm handler\'lar mevcut');
    } else {
      logTest('Middleware Handlers', 'ROUTES', 'FAIL', `Eksik: ${missing.join(', ')}`);
    }
  } catch (error) {
    logTest('Middleware Handlers', 'ROUTES', 'FAIL', '', (error as Error).message);
  }

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.totalTests}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️ Skipped: ${testResults.skipped}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.totalTests) * 100).toFixed(2)}%`);
  console.log('');

  if (testResults.errors.length > 0) {
    console.log('❌ ERRORS:');
    testResults.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    console.log('');
  }

  // Save results to JSON
  const fs = await import('fs');
  const pathMod = await import('path');
  const resultsPath = pathMod.default.join(process.cwd(), 'test-results.json');
  fs.default.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Test results saved to: ${resultsPath}`);

  // Save results to Markdown
  const mdContent = `# Full System Test Results

**Timestamp**: ${testResults.timestamp}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${testResults.totalTests} |
| ✅ Passed | ${testResults.passed} |
| ❌ Failed | ${testResults.failed} |
| ⏭️ Skipped | ${testResults.skipped} |
| Success Rate | ${((testResults.passed / testResults.totalTests) * 100).toFixed(2)}% |

## Test Results

| # | Category | Test Name | Status | Message |
|---|----------|-----------|--------|---------|
${testResults.tests.map((t, i) => `| ${i + 1} | ${t.category} | ${t.name} | ${t.status === 'PASS' ? '✅' : t.status === 'FAIL' ? '❌' : '⏭️'} | ${t.message || t.error || '-'} |`).join('\n')}

## Errors

${testResults.errors.length > 0 ? testResults.errors.map(e => `- ${e}`).join('\n') : 'No errors found!'}
`;

  const mdPath = pathMod.default.join(process.cwd(), 'TEST_RESULTS.md');
  fs.default.writeFileSync(mdPath, mdContent);
  console.log(`📄 Test results saved to: ${mdPath}`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the test
runFullSystemTest();