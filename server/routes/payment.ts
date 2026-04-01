import { RequestHandler } from 'express';
import { validatePackagePrice, calculateExpiryTimestamp } from '@shared/packages';
import { Currency } from '@shared/api';
import { getAdminDb } from '../lib/firebase-admin';
import crypto from 'crypto';

/**
 * Ödeme bilgileri interfaces
 */
interface PaymentRequest {
  userId: string;
  packageId: string;
  amount: number;
  email: string;
  currency?: Currency;
  returnUrl: string;
}

interface BankAccount {
  id: string;
  accountHolder: string;
  iban: string;
  bankName: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface BankTransferResponse {
  success: boolean;
  message: string;
  referenceCode?: string;
  bankAccount?: BankAccount;
  amount?: number;
  packageId?: string;
}

interface EscrowRecord {
  id: string;
  status: string;
  amount?: number;
  licenseeId?: string;
  receivedAt: number;
  acknowledged: boolean;
}

const escrowRecords: EscrowRecord[] = [];

/**
 * Ödeme başlat endpoint (IBAN/Havale)
 * POST /api/payment/initiate
 */
export const initiatePayment: RequestHandler = async (req, res) => {
  try {
    const { userId, packageId, amount, email, returnUrl, currency = 'TRY' } = req.body as PaymentRequest;

    // Validasyon
    if (!userId || !packageId || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'Eksik parametreler: userId, packageId, amount, email gerekli'
      });
    }

    // Paket fiyatını doğrula
    if (!validatePackagePrice(packageId as any, amount)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz paket veya tutar'
      });
    }

    // Banka hesaplarını localStorage'dan al (demo sistem)
    // Gerçek sistemde Firestore veya DB'den çekiliyor
    const bankAccounts: BankAccount[] = [
      {
        id: 'bank_001',
        accountHolder: 'Abdulkadir Kan',
        iban: 'TR32 0015 7000 0000 0091 7751 22',
        bankName: 'QNB Finans Bank',
        isActive: true,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now()
      }
    ];

    // Aktif banka hesabını bul
    const activeBank = bankAccounts.find(b => b.isActive);
    if (!activeBank) {
      return res.status(400).json({
        success: false,
        message: 'Şu anda aktif bir banka hesabı bulunmamaktadır'
      });
    }

    // Ödeme referans kodu oluştur
    // Format: RYDEX-{TIMESTAMP}-{USERID}-{PACKAGEID}
    const referenceCode = `RYDEX-${Date.now()}-${userId.substring(0, 6)}-${packageId.substring(0, 3)}`.toUpperCase();

    console.log('💳 IBAN/Havale Ödeme Başlatıldı:');
    console.log(`   Referans Kodu: ${referenceCode}`);
    console.log(`   Tutar: ${amount} TRY`);
    console.log(`   Email: ${email}`);
    console.log(`   Banka: ${activeBank.bankName}`);
    console.log(`   IBAN: ${activeBank.iban}`);

    // Ödeme talebini localStorage'a kaydet (demo sistem)
    const paymentRequest = {
      id: referenceCode,
      userId,
      packageId,
      amount,
      email,
      currency,
      status: 'pending', // pending → user_uploaded_receipt → admin_approved → activated
      createdAt: Date.now(),
      expiryDate: Date.now() + (24 * 60 * 60 * 1000) // 24 saat içinde dekont yüklemesi gerekir
    };

    // localStorage'a kaydet
    try {
      const existingPayments = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      existingPayments.push(paymentRequest);
      localStorage.setItem('payment_requests', JSON.stringify(existingPayments));
    } catch (e) {
      console.warn('Payment request localStorage kayıt hatası:', e);
    }

    return res.json({
      success: true,
      message: 'Ödeme bilgileri hazırlandı',
      referenceCode,
      bankAccount: activeBank,
      amount,
      packageId,
      currency,
      instructions: {
        step1: 'Belirtilen IBAN\'a belirtilen tutar kadar havale/transfer yapınız',
        step2: `Gönderenin ismine referans kodu yazınız: ${referenceCode}`,
        step3: 'Dekont (fatura, banka ekstres) yükleyiniz',
        step4: 'Admin onayını bekleyiniz'
      }
    } as BankTransferResponse);

  } catch (error) {
    console.error('Ödeme başlatma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme başlatılırken hata oluştu',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Ödeme durumunu kontrol et
 * GET /api/payment/status/:referenceCode
 */
export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { referenceCode } = req.params;

    if (!referenceCode) {
      return res.status(400).json({
        success: false,
        message: 'Referans kodu gereklidir'
      });
    }

    // localStorage'dan ödeme talebini ara
    try {
      const paymentRequests = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      const payment = paymentRequests.find((p: any) => p.id === referenceCode);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Ödeme talebi bulunamadı'
        });
      }

      return res.json({
        success: true,
        referenceCode,
        status: payment.status,
        packageId: payment.packageId,
        amount: payment.amount,
        createdAt: payment.createdAt,
        message: {
          pending: 'Dekont yüklemesi bekleniyor',
          user_uploaded_receipt: 'Dekont alındı, admin onayı bekleniyor',
          admin_approved: 'Ödemeniz onaylandı, subscription aktif edildi',
          admin_rejected: 'Dekont reddedildi'
        }[payment.status] || 'Bilinmeyen durum'
      });
    } catch (e) {
      console.error('Payment status kontrol hatası:', e);
      return res.status(500).json({
        success: false,
        message: 'Ödeme durumu kontrol edilemedi'
      });
    }

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme durumu kontrol edilemedi'
    });
  }
};

/**
 * Dekont yükleme onaylandığında subscription aktive et
 * POST /api/payment/activate-subscription
 * Sadece admin tarafından çağrılabilir
 */
export const activateSubscriptionAfterApproval: RequestHandler = async (req, res) => {
  try {
    const { referenceCode, userId, packageId, adminToken } = req.body;

    // Admin doğrulaması (basit örnek)
    if (adminToken !== process.env.ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Yetkisiz erişim'
      });
    }

    if (!referenceCode || !userId || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli parametreler eksik'
      });
    }

    // Ödeme talebini güncelle
    try {
      const paymentRequests = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      const paymentIndex = paymentRequests.findIndex((p: any) => p.id === referenceCode);

      if (paymentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ödeme talebi bulunamadı'
        });
      }

      const payment = paymentRequests[paymentIndex];

      // Subscription verilerini hazırla
      const expiryTimestamp = calculateExpiryTimestamp(packageId, Date.now());
      const startDate = Date.now();
      const daysRemaining = Math.ceil((expiryTimestamp - startDate) / (1000 * 60 * 60 * 24));

      const subscription = {
        id: `sub_${Date.now()}`,
        userId,
        packageId,
        status: 'active',
        startDate,
        endDate: expiryTimestamp,
        daysRemaining,
        amount: payment.amount,
        currency: payment.currency,
        paymentReference: referenceCode,
        activatedAt: Date.now(),
        activatedBy: 'admin'
      };

      // Ödeme talebini güncelle
      paymentRequests[paymentIndex].status = 'admin_approved';
      paymentRequests[paymentIndex].approvedAt = Date.now();
      localStorage.setItem('payment_requests', JSON.stringify(paymentRequests));

      // Subscription'ı kaydet (client tarafında kullanılmak üzere)
      // Gerçek sistemde Firestore/DB'ye yazılabilir
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      subscriptions.push(subscription);
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

      console.log(`✅ Subscription Aktive Edildi:`);
      console.log(`   User: ${userId}`);
      console.log(`   Package: ${packageId}`);
      console.log(`   Duration: ${daysRemaining} days`);
      console.log(`   Expiry: ${new Date(expiryTimestamp).toLocaleString('tr-TR')}`);

      return res.json({
        success: true,
        message: 'Subscription başarıyla aktive edildi',
        subscription,
        paymentReference: referenceCode
      });

    } catch (e) {
      console.error('Subscription aktivasyon hatası:', e);
      return res.status(500).json({
        success: false,
        message: 'Subscription aktive edilemedi'
      });
    }

  } catch (error) {
    console.error('Aktivasyon hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription aktive edilirken hata oluştu'
    });
  }
};

/**
 * Dekont reddetme
 * POST /api/payment/reject-receipt
 * Sadece admin tarafından çağrılabilir
 */
export const rejectReceipt: RequestHandler = async (req, res) => {
  try {
    const { referenceCode, reason, adminToken } = req.body;

    // Admin doğrulaması
    if (adminToken !== process.env.ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Yetkisiz erişim'
      });
    }

    if (!referenceCode) {
      return res.status(400).json({
        success: false,
        message: 'Referans kodu gereklidir'
      });
    }

    // Ödeme talebini güncelle
    try {
      const paymentRequests = JSON.parse(localStorage.getItem('payment_requests') || '[]');
      const paymentIndex = paymentRequests.findIndex((p: any) => p.id === referenceCode);

      if (paymentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Ödeme talebi bulunamadı'
        });
      }

      paymentRequests[paymentIndex].status = 'admin_rejected';
      paymentRequests[paymentIndex].rejectionReason = reason || 'Admin tarafından reddedildi';
      paymentRequests[paymentIndex].rejectedAt = Date.now();
      localStorage.setItem('payment_requests', JSON.stringify(paymentRequests));

      console.log(`❌ Dekont Reddedildi: ${referenceCode}`);
      console.log(`   Sebep: ${reason}`);

      return res.json({
        success: true,
        message: 'Dekont reddedildi',
        referenceCode
      });

    } catch (e) {
      console.error('Dekont reddetme hatası:', e);
      return res.status(500).json({
        success: false,
        message: 'Dekont reddetilemedi'
      });
    }

  } catch (error) {
    console.error('Reddetme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekont reddetilirken hata oluştu'
    });
  }
};

/**
 * Master License Escrow Bildirimi
 * POST /api/payment/escrow-notify
 * Escrow sistem tarafından çağrılır
 */
export const escrowNotify: RequestHandler = async (req, res) => {
  try {
    const { transactionId, status, amount, licenseeId } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'transactionId ve status gereklidir'
      });
    }

    console.log(`🔐 Escrow Bildirimi Alındı:`);
    console.log(`   Transaction: ${transactionId}`);
    console.log(`   Status: ${status}`);
    console.log(`   Amount: ${amount}`);
    console.log(`   Licensee: ${licenseeId}`);

    // Escrow durumunu kaydet
    const escrowRecord: EscrowRecord = {
      id: transactionId,
      status,
      amount,
      licenseeId,
      receivedAt: Date.now(),
      acknowledged: true
    };

    escrowRecords.push(escrowRecord);

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      await firestoreDb.collection('escrow_requests').doc(transactionId).set(escrowRecord, { merge: true });
    }

    res.json({
      success: true,
      message: 'Escrow bildirimi başarıyla alındı',
      acknowledged: true,
      recordId: transactionId
    });
  } catch (error) {
    console.error('Escrow notification hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Escrow bildirimi işlenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Sistem health check
 * GET /api/payment/health
 */
export const handleGetEscrowRecords: RequestHandler = (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const filtered = status ? escrowRecords.filter(record => record.status === status) : escrowRecords;

    res.json({
      success: true,
      count: filtered.length,
      records: filtered.slice().reverse()
    });
  } catch (error) {
    console.error('Escrow kayıtları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Escrow kayıtları alınamadı'
    });
  }
};

export const healthCheck: RequestHandler = (req, res) => {
  res.json({
    success: true,
    message: 'Payment service healthy',
    system: 'IBAN/Havale Tabanlı Ödeme Sistemi',
    features: [
      'IBAN transferi',
      'Dekont yükleme',
      'Admin onayı',
      'Subscription aktivasyonu',
      'Escrow Bildirimi'
    ]
  });
};

export type { BankTransferResponse };
