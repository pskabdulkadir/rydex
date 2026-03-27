/**
 * Payment Verification Service
 * Üye ödeme yaptığı anda otomatik doğrulama ve subscription işlemleri
 * Admin onayı sistemi ile dekont kontrolü
 */

import { PACKAGES, calculateExpiryTimestamp } from '@shared/packages';
import { toast } from 'sonner';

export interface PaymentRecord {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  status: 'pending' | 'verified' | 'failed' | 'approved' | 'rejected';
  paymentMethod: 'credit-card' | 'bank-transfer';
  createdAt: number;
  verifiedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  expiresAt: number;
  approvedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  subscription?: {
    plan: string;
    amount: number;
    startDate: number;
    endDate: number;
    daysRemaining: number;
  };
}

/**
 * Ödeme kaydını oluştur
 */
export function createPaymentRecord(
  userId: string,
  packageId: string,
  amount: number,
  paymentMethod: 'credit-card' | 'bank-transfer'
): PaymentRecord {
  const expiresAt = calculateExpiryTimestamp(packageId);
  
  const record: PaymentRecord = {
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    packageId,
    amount,
    status: 'pending',
    paymentMethod,
    createdAt: Date.now(),
    expiresAt
  };

  // localStorage'a kaydet
  const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
  payments.push(record);
  localStorage.setItem('paymentRecords', JSON.stringify(payments));

  return record;
}

/**
 * Ödemeyi doğrula ve subscription oluştur
 */
export function verifyPayment(paymentId: string, userId: string): VerificationResult {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    const payment = payments.find(p => p.id === paymentId && p.userId === userId);

    if (!payment) {
      return {
        success: false,
        message: 'Ödeme kaydı bulunamadı'
      };
    }

    if (payment.status === 'verified') {
      return {
        success: false,
        message: 'Bu ödeme zaten doğrulanmıştır'
      };
    }

    // Paket bilgisini al
    const pkg = PACKAGES[payment.packageId as keyof typeof PACKAGES];
    if (!pkg) {
      return {
        success: false,
        message: 'Paket bilgisi bulunamadı'
      };
    }

    // Ödemeyi doğrula (tutar kontrolü)
    if (payment.amount !== pkg.price) {
      return {
        success: false,
        message: 'Ödeme miktarı paket fiyatı ile uyuşmuyor'
      };
    }

    // Ödeme durumunu güncelle
    payment.status = 'verified';
    payment.verifiedAt = Date.now();

    const updatedPayments = payments.map(p => p.id === paymentId ? payment : p);
    localStorage.setItem('paymentRecords', JSON.stringify(updatedPayments));

    // Subscription oluştur
    const subscription = {
      id: `sub_${Date.now()}`,
      userId,
      packageId: payment.packageId,
      plan: payment.packageId,
      amount: payment.amount,
      startDate: Date.now(),
      endDate: payment.expiresAt,
      daysRemaining: Math.ceil((payment.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)),
      paymentId: paymentId,
      status: 'active'
    };

    localStorage.setItem('subscription', JSON.stringify(subscription));

    // Mevcut subscription varsa güncelle
    const existingSub = localStorage.getItem('subscription');
    if (existingSub) {
      try {
        const existing = JSON.parse(existingSub);
        // Yeni subscription daha uzun mu kontrol et
        if (subscription.endDate > existing.endDate) {
          localStorage.setItem('subscription', JSON.stringify(subscription));
        } else {
          // Varolan subscription'a ekle
          subscription.endDate = existing.endDate;
          localStorage.setItem('subscription', JSON.stringify(subscription));
        }
      } catch (e) {
        localStorage.setItem('subscription', JSON.stringify(subscription));
      }
    } else {
      localStorage.setItem('subscription', JSON.stringify(subscription));
    }

    return {
      success: true,
      message: 'Ödeme başarıyla doğrulandı ve subscription aktifleştirildi',
      subscription
    };
  } catch (error) {
    console.error('Ödeme doğrulama hatası:', error);
    return {
      success: false,
      message: 'Ödeme doğrulama sırasında hata oluştu'
    };
  }
}

/**
 * Belirli aralıklarla ödeme durumunu kontrol et (Real-time verification)
 */
export function startPaymentVerificationPolling(userId: string, onVerified?: (sub: any) => void) {
  const interval = setInterval(() => {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    const pendingPayments = payments.filter(p => p.userId === userId && p.status === 'pending');

    pendingPayments.forEach(payment => {
      // API'den ödeme durumunu kontrol et
      checkPaymentStatus(payment.id, userId).then(isVerified => {
        if (isVerified) {
          const result = verifyPayment(payment.id, userId);
          if (result.success && onVerified) {
            onVerified(result.subscription);
            toast.success('✅ Ödemeniz başarıyla doğrulanmıştır! Uygulama anında açılacak.');
          }
        }
      });
    });
  }, 5000); // Her 5 saniyede kontrol et

  return () => clearInterval(interval);
}

/**
 * API'den ödeme durumunu kontrol et
 */
async function checkPaymentStatus(paymentId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, userId })
    });

    const data = await response.json();
    return data.verified || false;
  } catch (error) {
    console.error('Ödeme durumu kontrol hatası:', error);
    return false;
  }
}

/**
 * Aktif subscription'ı getir
 */
export function getActiveSubscription(): any {
  try {
    const sub = localStorage.getItem('subscription');
    if (!sub) return null;

    const subscription = JSON.parse(sub);
    const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24)));

    // Süresi bitmiş mi kontrol et
    if (daysRemaining <= 0) {
      localStorage.removeItem('subscription');
      return null;
    }

    return {
      ...subscription,
      daysRemaining
    };
  } catch (error) {
    console.error('Subscription okuma hatası:', error);
    return null;
  }
}

/**
 * Kullanıcının uygulama erişimine izni var mı kontrol et
 */
export function hasAppAccess(userId: string): boolean {
  const subscription = getActiveSubscription();
  
  if (!subscription) {
    return false;
  }

  // Subscription'ın kullanıcıya ait olup olmadığını kontrol et
  if (subscription.userId !== userId) {
    return false;
  }

  // Subscription süresi geçmiş mi kontrol et
  const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
  return daysRemaining > 0;
}

/**
 * Ödeme kayıtlarını temizle (eski kayıtları sil)
 */
export function cleanupOldPaymentRecords(daysOld: number = 90) {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const filtered = payments.filter(p => {
      // Sadece başarısız ve eski ödemeleri sil
      return p.status === 'verified' || p.status === 'approved' || p.createdAt > cutoffTime;
    });

    localStorage.setItem('paymentRecords', JSON.stringify(filtered));
  } catch (error) {
    console.error('Ödeme temizleme hatası:', error);
  }
}

/**
 * Admin ödemeyi onayla ve subscription'ı aktifleştir
 */
export function approvePayment(paymentId: string, adminId: string, adminNotes?: string): VerificationResult {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    const payment = payments.find(p => p.id === paymentId);

    if (!payment) {
      return {
        success: false,
        message: 'Ödeme kaydı bulunamadı'
      };
    }

    if (payment.status === 'approved') {
      return {
        success: false,
        message: 'Bu ödeme zaten onaylanmıştır'
      };
    }

    // Paket bilgisini al
    const pkg = PACKAGES[payment.packageId as keyof typeof PACKAGES];
    if (!pkg) {
      return {
        success: false,
        message: 'Paket bilgisi bulunamadı'
      };
    }

    // Ödemeyi onayla
    payment.status = 'approved';
    payment.approvedAt = Date.now();
    payment.approvedBy = adminId;
    if (adminNotes) {
      payment.adminNotes = adminNotes;
    }

    const updatedPayments = payments.map(p => p.id === paymentId ? payment : p);
    localStorage.setItem('paymentRecords', JSON.stringify(updatedPayments));

    // Subscription oluştur
    const subscription = {
      id: `sub_${Date.now()}`,
      userId: payment.userId,
      packageId: payment.packageId,
      plan: payment.packageId,
      amount: payment.amount,
      startDate: Date.now(),
      endDate: payment.expiresAt,
      daysRemaining: Math.ceil((payment.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)),
      paymentId: paymentId,
      status: 'active',
      approvedAt: Date.now()
    };

    // Mevcut subscription'ı güncelle veya yeni oluştur
    const existingSub = localStorage.getItem('subscription');
    if (existingSub) {
      try {
        const existing = JSON.parse(existingSub);
        if (existing.userId === payment.userId) {
          // Aynı kullanıcı ise süresi uzat
          if (subscription.endDate > existing.endDate) {
            subscription.endDate = subscription.endDate;
          } else {
            subscription.endDate = existing.endDate;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    localStorage.setItem('subscription', JSON.stringify(subscription));

    return {
      success: true,
      message: 'Ödeme başarıyla onaylandı ve subscription aktifleştirildi',
      subscription
    };
  } catch (error) {
    console.error('Ödeme onayı hatası:', error);
    return {
      success: false,
      message: 'Ödeme onaylanırken hata oluştu'
    };
  }
}

/**
 * Admin ödemeyi reddet
 */
export function rejectPayment(paymentId: string, adminId: string, reason: string): VerificationResult {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    const payment = payments.find(p => p.id === paymentId);

    if (!payment) {
      return {
        success: false,
        message: 'Ödeme kaydı bulunamadı'
      };
    }

    if (payment.status === 'rejected') {
      return {
        success: false,
        message: 'Bu ödeme zaten reddedilmiştir'
      };
    }

    // Ödemeyi reddet
    payment.status = 'rejected';
    payment.rejectedAt = Date.now();
    payment.approvedBy = adminId;
    payment.rejectionReason = reason;

    const updatedPayments = payments.map(p => p.id === paymentId ? payment : p);
    localStorage.setItem('paymentRecords', JSON.stringify(updatedPayments));

    return {
      success: true,
      message: 'Ödeme başarıyla reddedildi'
    };
  } catch (error) {
    console.error('Ödeme reddetme hatası:', error);
    return {
      success: false,
      message: 'Ödeme reddedilirken hata oluştu'
    };
  }
}

/**
 * Kullanıcıya ait ödeme kayıtlarını getir
 */
export function getUserPayments(userId: string): PaymentRecord[] {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    return payments.filter(p => p.userId === userId);
  } catch (error) {
    console.error('Ödeme kayıtları okuma hatası:', error);
    return [];
  }
}

/**
 * Tüm ödeme kayıtlarını getir (Admin için)
 */
export function getAllPayments(): PaymentRecord[] {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    return payments;
  } catch (error) {
    console.error('Ödeme kayıtları okuma hatası:', error);
    return [];
  }
}

/**
 * Beklemede olan ödeme sayısını getir
 */
export function getPendingPaymentCount(): number {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    return payments.filter(p => p.status === 'pending').length;
  } catch (error) {
    return 0;
  }
}

/**
 * Son 30 gün ödeme istatistikleri
 */
export function getPaymentStats() {
  try {
    const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]') as PaymentRecord[];
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    const recentPayments = payments.filter(p => p.createdAt > thirtyDaysAgo);

    return {
      total: recentPayments.length,
      approved: recentPayments.filter(p => p.status === 'approved').length,
      pending: recentPayments.filter(p => p.status === 'pending').length,
      rejected: recentPayments.filter(p => p.status === 'rejected').length,
      totalRevenue: recentPayments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0)
    };
  } catch (error) {
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      totalRevenue: 0
    };
  }
}
