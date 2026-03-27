/**
 * Payment System Integration Tests
 * Ödeme sistemi uçtan uca entegrasyon testleri
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createPaymentRecord,
  verifyPayment,
  approvePayment,
  rejectPayment,
  getActiveSubscription,
  hasAppAccess,
  getUserPayments,
  getPendingPaymentCount,
  getPaymentStats,
  cleanupOldPaymentRecords,
  PaymentRecord,
  VerificationResult
} from '@/lib/payment-verification';
import { PACKAGES } from '@shared/packages';

// Test helper functions
const TEST_USER_ID = 'test_user_123';
const TEST_PACKAGE_ID = 'pro';
const TEST_ADMIN_ID = 'admin_123';

const setupLocalStorage = () => {
  localStorage.clear();
  localStorage.setItem('userId', TEST_USER_ID);
};

const clearLocalStorage = () => {
  localStorage.clear();
};

describe('Payment Verification System', () => {
  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  describe('createPaymentRecord', () => {
    it('Yeni bir ödeme kaydı oluşturmalı', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      expect(payment).toBeDefined();
      expect(payment.userId).toBe(TEST_USER_ID);
      expect(payment.packageId).toBe(TEST_PACKAGE_ID);
      expect(payment.status).toBe('pending');
      expect(payment.paymentMethod).toBe('credit-card');
    });

    it('Ödeme kaydını localStorage\'a kaydetmeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const saved = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe(payment.id);
    });

    it('Birden fazla ödeme kaydı oluşturabilmeli', () => {
      createPaymentRecord(TEST_USER_ID, TEST_PACKAGE_ID, 3000, 'credit-card');
      createPaymentRecord(TEST_USER_ID, 'ultimate', 5000, 'bank-transfer');

      const saved = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      expect(saved).toHaveLength(2);
    });
  });

  describe('verifyPayment', () => {
    it('Ödemeyi başarıyla doğrulamalı ve subscription oluşturmalı', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const result = verifyPayment(payment.id, TEST_USER_ID);

      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
      expect(result.subscription?.userId).toBe(TEST_USER_ID);
      expect(result.subscription?.status).toBe('active');
    });

    it('Duplicate doğrulama işlemini engellemeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const result1 = verifyPayment(payment.id, TEST_USER_ID);
      const result2 = verifyPayment(payment.id, TEST_USER_ID);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });

    it('Yanlış tutar için ödemeyi reddedilmeli', () => {
      const wrongAmount = 999;
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        wrongAmount,
        'credit-card'
      );

      const result = verifyPayment(payment.id, TEST_USER_ID);

      expect(result.success).toBe(false);
      expect(result.message).toContain('uyuşmuyor');
    });

    it('Bulunamayan ödemeyi işlemlemeli', () => {
      const result = verifyPayment('non_existent_id', TEST_USER_ID);

      expect(result.success).toBe(false);
      expect(result.message).toContain('bulunamadı');
    });

    it('Subscription\'ı localStorage\'a kaydetmeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      verifyPayment(payment.id, TEST_USER_ID);

      const saved = localStorage.getItem('subscription');
      expect(saved).toBeDefined();
      const subscription = JSON.parse(saved!);
      expect(subscription.userId).toBe(TEST_USER_ID);
    });
  });

  describe('approvePayment', () => {
    it('Ödemeyi admin tarafından onaylamalı', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const result = approvePayment(payment.id, TEST_ADMIN_ID, 'Dekont kontrol edildi');

      expect(result.success).toBe(true);
      expect(result.subscription).toBeDefined();
    });

    it('Onaylanan ödemeyi tekrar onaylamak başarısız olmalı', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      approvePayment(payment.id, TEST_ADMIN_ID);
      const result2 = approvePayment(payment.id, TEST_ADMIN_ID);

      expect(result2.success).toBe(false);
    });

    it('Admin notlarını kaydetmeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const notes = 'Dekont kontrol edildi, hesap doğrulandı';
      approvePayment(payment.id, TEST_ADMIN_ID, notes);

      const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      const approved = payments.find((p: PaymentRecord) => p.id === payment.id);

      expect(approved.adminNotes).toBe(notes);
    });
  });

  describe('rejectPayment', () => {
    it('Ödemeyi admin tarafından reddetmeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const result = rejectPayment(payment.id, TEST_ADMIN_ID, 'Dekont okunamıyor');

      expect(result.success).toBe(true);
    });

    it('Red sebebini kaydetmeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      const reason = 'Eksik bilgi';
      rejectPayment(payment.id, TEST_ADMIN_ID, reason);

      const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      const rejected = payments.find((p: PaymentRecord) => p.id === payment.id);

      expect(rejected.rejectionReason).toBe(reason);
    });

    it('Reddedilen ödemeyi tekrar reddetmek başarısız olmalı', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      rejectPayment(payment.id, TEST_ADMIN_ID, 'Reason 1');
      const result2 = rejectPayment(payment.id, TEST_ADMIN_ID, 'Reason 2');

      expect(result2.success).toBe(false);
    });
  });

  describe('getActiveSubscription', () => {
    it('Aktif subscription\'ı getirmeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      verifyPayment(payment.id, TEST_USER_ID);
      const subscription = getActiveSubscription();

      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(TEST_USER_ID);
      expect(subscription.daysRemaining).toBeGreaterThan(0);
    });

    it('Aktif subscription\'ı döndürmez, eğer yoksa', () => {
      const subscription = getActiveSubscription();
      expect(subscription).toBeNull();
    });

    it('Süresi dolmuş subscription\'ı döndürmez', () => {
      const expiredSub = {
        userId: TEST_USER_ID,
        endDate: Date.now() - 86400000 // Dün
      };

      localStorage.setItem('subscription', JSON.stringify(expiredSub));
      const subscription = getActiveSubscription();

      expect(subscription).toBeNull();
    });
  });

  describe('hasAppAccess', () => {
    it('Aktif subscription ile erişim izni vermeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      verifyPayment(payment.id, TEST_USER_ID);
      const hasAccess = hasAppAccess(TEST_USER_ID);

      expect(hasAccess).toBe(true);
    });

    it('Subscription olmadan erişim izni vermemeli', () => {
      const hasAccess = hasAppAccess(TEST_USER_ID);
      expect(hasAccess).toBe(false);
    });

    it('Farklı kullanıcı ID\'si ile erişim izni vermemeli', () => {
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      verifyPayment(payment.id, TEST_USER_ID);
      const hasAccess = hasAppAccess('different_user_id');

      expect(hasAccess).toBe(false);
    });
  });

  describe('getUserPayments', () => {
    it('Kullanıcıya ait ödeme kayıtlarını getirmeli', () => {
      const payment1 = createPaymentRecord(TEST_USER_ID, 'pro', 3000, 'credit-card');
      const payment2 = createPaymentRecord(TEST_USER_ID, 'ultimate', 5000, 'bank-transfer');
      const payment3 = createPaymentRecord('other_user', 'starter', 1000, 'credit-card');

      const userPayments = getUserPayments(TEST_USER_ID);

      expect(userPayments).toHaveLength(2);
      expect(userPayments.every(p => p.userId === TEST_USER_ID)).toBe(true);
    });

    it('Kullanıcı yoksa boş dizi döndürmeli', () => {
      const payments = getUserPayments('non_existent_user');
      expect(payments).toHaveLength(0);
    });
  });

  describe('getPendingPaymentCount', () => {
    it('Beklemede olan ödeme sayısını döndürmeli', () => {
      createPaymentRecord(TEST_USER_ID, 'pro', 3000, 'credit-card');
      createPaymentRecord(TEST_USER_ID, 'ultimate', 5000, 'bank-transfer');

      const count = getPendingPaymentCount();

      expect(count).toBe(2);
    });

    it('Onaylanan ödemeleri saymameli', () => {
      const payment1 = createPaymentRecord(TEST_USER_ID, 'pro', 3000, 'credit-card');
      const payment2 = createPaymentRecord(TEST_USER_ID, 'ultimate', 5000, 'bank-transfer');

      approvePayment(payment1.id, TEST_ADMIN_ID);

      const count = getPendingPaymentCount();

      expect(count).toBe(1);
    });
  });

  describe('getPaymentStats', () => {
    it('Son 30 gün ödeme istatistiklerini döndürmeli', () => {
      const payment1 = createPaymentRecord(TEST_USER_ID, 'pro', 3000, 'credit-card');
      approvePayment(payment1.id, TEST_ADMIN_ID);

      const payment2 = createPaymentRecord(TEST_USER_ID, 'ultimate', 5000, 'bank-transfer');

      const stats = getPaymentStats();

      expect(stats.total).toBe(2);
      expect(stats.approved).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.totalRevenue).toBe(3000);
    });

    it('Eski ödemeleri saymameli', () => {
      const oldPayment = {
        id: 'old_payment',
        userId: TEST_USER_ID,
        packageId: 'pro',
        amount: 3000,
        status: 'approved' as const,
        paymentMethod: 'credit-card' as const,
        createdAt: Date.now() - (40 * 24 * 60 * 60 * 1000), // 40 gün önce
        approvedAt: Date.now() - (40 * 24 * 60 * 60 * 1000),
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
      };

      const saved = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      saved.push(oldPayment);
      localStorage.setItem('paymentRecords', JSON.stringify(saved));

      const stats = getPaymentStats();

      expect(stats.totalRevenue).toBe(0);
    });
  });

  describe('cleanupOldPaymentRecords', () => {
    it('Eski başarısız ödemeleri temizlemeli', () => {
      const oldPayment = {
        id: 'old_failed',
        userId: TEST_USER_ID,
        packageId: 'pro',
        amount: 3000,
        status: 'failed' as const,
        paymentMethod: 'credit-card' as const,
        createdAt: Date.now() - (100 * 24 * 60 * 60 * 1000),
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
      };

      const saved = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      saved.push(oldPayment);
      localStorage.setItem('paymentRecords', JSON.stringify(saved));

      cleanupOldPaymentRecords(90);

      const remaining = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      expect(remaining.every((p: PaymentRecord) => p.status !== 'failed')).toBe(true);
    });

    it('Başarılı ödememeleri korumalı', () => {
      const payment = createPaymentRecord(TEST_USER_ID, 'pro', 3000, 'credit-card');
      verifyPayment(payment.id, TEST_USER_ID);

      cleanupOldPaymentRecords(90);

      const remaining = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
      expect(remaining).toHaveLength(1);
      expect(remaining[0].status).toBe('verified');
    });
  });

  describe('Integration Tests', () => {
    it('Tam ödeme akışını gerçekleştirmeli: Oluştur → Doğrula → Subscription', () => {
      // 1. Ödeme kaydı oluştur
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'credit-card'
      );

      // 2. Ödemeyi doğrula
      const verifyResult = verifyPayment(payment.id, TEST_USER_ID);
      expect(verifyResult.success).toBe(true);

      // 3. Subscription aktif olmalı
      const subscription = getActiveSubscription();
      expect(subscription).toBeDefined();
      expect(subscription?.userId).toBe(TEST_USER_ID);

      // 4. Uygulama erişimi aktif olmalı
      const hasAccess = hasAppAccess(TEST_USER_ID);
      expect(hasAccess).toBe(true);
    });

    it('Admin onayı akışını gerçekleştirmeli: Oluştur → Onayla → Subscription', () => {
      // 1. Ödeme kaydı oluştur
      const payment = createPaymentRecord(
        TEST_USER_ID,
        TEST_PACKAGE_ID,
        PACKAGES[TEST_PACKAGE_ID as keyof typeof PACKAGES].price,
        'bank-transfer'
      );

      // 2. Ödemeyi admin onayı beklemesi gereken durumda başlat
      expect(payment.status).toBe('pending');

      // 3. Admin tarafından onayla
      const approveResult = approvePayment(
        payment.id,
        TEST_ADMIN_ID,
        'Dekont doğrulandı'
      );
      expect(approveResult.success).toBe(true);

      // 4. Subscription aktif olmalı
      const subscription = getActiveSubscription();
      expect(subscription).toBeDefined();

      // 5. Uygulama erişimi aktif olmalı
      const hasAccess = hasAppAccess(TEST_USER_ID);
      expect(hasAccess).toBe(true);
    });

    it('Çoklu ödeme yönetimini işlemlemeli', () => {
      // Kullanıcı ilk kez başlangıç paketi satın al
      const payment1 = createPaymentRecord(TEST_USER_ID, 'starter', 1000, 'credit-card');
      verifyPayment(payment1.id, TEST_USER_ID);

      let sub1 = getActiveSubscription();
      expect(sub1?.plan).toBe('starter');

      // Daha sonra pro pakete yükselt
      const payment2 = createPaymentRecord(TEST_USER_ID, 'pro', 3000, 'credit-card');
      verifyPayment(payment2.id, TEST_USER_ID);

      let sub2 = getActiveSubscription();
      expect(sub2?.plan).toBe('pro');

      // Tüm ödeme kayıtları korunmalı
      const userPayments = getUserPayments(TEST_USER_ID);
      expect(userPayments).toHaveLength(2);
    });
  });
});
