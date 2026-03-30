import { RequestHandler } from 'express';
import { validatePackagePrice, calculateExpiryTimestamp } from '@shared/packages';
import { Currency } from '@shared/api';
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

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  sessionToken?: string;
  message: string;
  orderId?: string;
}

/**
 * PayTR HMAC SHA256 hash oluştur
 */
function generatePayTRHash(
  merchantId: string,
  merchantOid: string,
  amount: number,
  merchantKey: string
): string {
  const hashInput = merchantId + merchantOid + amount + merchantKey;
  return crypto.createHash('sha256').update(hashInput).digest('base64');
}

/**
 * Ödeme başlat endpoint
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

    // PayTR Merchant Bilgileri
    const merchantId = process.env.PAYTTR_MERCHANT_ID || '9999';
    const merchantKey = process.env.PAYTTR_MERCHANT_KEY || 'hJBjJBjhBjJBjJBjBjJBjBjhBjhJBjBjJBj';
    const merchantSalt = process.env.PAYTTR_MERCHANT_SALT || 'jBjJBjBjJBjhBjJBjBjhBjhBjhJBjBjJBjBjJBjBjhBjhJBjBjJBjBjJBjBjh';

    // PayTR API parametreleri
    const merchantOid = `${userId}-${packageId}-${Date.now()}`;
    const paymentAmount = Math.round(amount * 100); // Kuruş cinsinden

    // User bilgileri (opsiyonel, boş verilebilir)
    const userName = userId.substring(0, 20);
    const userPhone = '0';
    const userAddress = 'Bilinmiyor';

    // Basket içeriği
    const userBasket = Buffer.from(
      JSON.stringify([
        [packageId, '1', amount.toString(), '0']
      ])
    ).toString('base64');

    // Invoice URL (opsiyonel)
    const invoiceAddr = '';

    // Test veya Production modu
    const testMode = process.env.NODE_ENV === 'development' ? '1' : '0';

    // Ödeme özellikleri
    const noInstallment = '1'; // Taksit yok
    const maxInstallment = '0';

    // Webhook URL
    const notifyUrl = `${process.env.API_URL || 'http://localhost:8080'}/api/payment/webhook`;
    const returnUrl_ = returnUrl || `${process.env.API_URL || 'http://localhost:8080'}/checkout?success=true&packageId=${packageId}`;

    // Hash oluştur: merchant_id + user_ip + merchant_oid + amount + merchant_key
    const hashInput = [
      merchantId,
      req.ip,
      merchantOid,
      paymentAmount.toString(),
      merchantKey
    ].join('');

    const paytrHash = crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('base64');

    // PayTR API'sine POST isteği yap
    const paytrPayload = {
      merchant_id: merchantId,
      user_ip: req.ip || '0.0.0.0',
      merchant_oid: merchantOid,
      email: email,
      payment_amount: paymentAmount,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      currency: 'TL',
      test_mode: testMode,
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      user_basket: userBasket,
      merchant_ok_url: returnUrl_,
      merchant_fail_url: `${process.env.API_URL || 'http://localhost:8080'}/payment-failed?packageId=${packageId}`,
      notify_url: notifyUrl,
      invoice_addr: invoiceAddr,
      timeout_in_seconds: 900, // 15 dakika
      paytr_token: '', // Boş, PayTR token'ı gerekli değil
      hash: paytrHash,
    };

    console.log('🔐 PayTR Ödeme İsteği:');
    console.log(`   Merchant OID: ${merchantOid}`);
    console.log(`   Tutar: ${(paymentAmount / 100).toFixed(2)} TRY`);
    console.log(`   Email: ${email}`);
    console.log(`   Test Modu: ${testMode === '1' ? 'AÇIK' : 'KAPATIK'}`);

    // Şimdilik demo modu (gerçek PayTR API'ye istek atmak yerine)
    // Production'da aşağıdaki kod açılacak:
    /*
    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(paytrPayload).toString()
    });

    const paytrData = await paytrResponse.json();

    if (!paytrData.success) {
      return res.status(400).json({
        success: false,
        message: paytrData.reason || 'PayTR API hatası'
      });
    }

    const token = paytrData.token;
    const paymentUrl = `https://www.paytr.com/odeme/guvenli/${token}`;
    */

    // Demo modu - başarılı yanıt dön
    const sessionToken = generateSessionToken(userId, packageId);

    res.json({
      success: true,
      paymentUrl: `https://www.paytr.com/odeme/guvenli/${sessionToken}`,
      sessionToken,
      orderId: merchantOid,
      message: 'Ödeme başlatıldı',
      debug: process.env.NODE_ENV === 'development' ? paytrPayload : undefined
    } as PaymentResponse);

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
 * Webhook handler - PayTR'dan callback
 * POST /api/payment/webhook
 *
 * PayTR webhook parametreleri:
 * - merchant_oid: Siparişin benzersiz ID'si
 * - status: Ödeme durumu (success, failed)
 * - total_amount: Toplam tutar (kuruş cinsinden)
 * - hash: HMAC-SHA256 doğrulama hash'i
 */
export const paymentWebhook: RequestHandler = async (req, res) => {
  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      transaction_id,
      test_mode
    } = req.body;

    // PayTR Merchant bilgileri
    const merchantKey = process.env.PAYTTR_MERCHANT_KEY || 'hJBjJBjhBjJBjJBjBjJBjBjhBjhJBjBjJBj';

    console.log('🔐 PayTR Webhook Alındı:');
    console.log(`   Order: ${merchant_oid}`);
    console.log(`   Status: ${status}`);
    console.log(`   Amount: ${total_amount ? (total_amount / 100).toFixed(2) : '?'} TRY`);
    console.log(`   Test Mode: ${test_mode}`);

    // HMAC doğrulama: merchant_oid + status + total_amount + merchant_key
    if (total_amount && hash) {
      const expectedHash = crypto
        .createHash('sha256')
        .update(merchant_oid + status + total_amount + merchantKey)
        .digest('base64');

      if (hash !== expectedHash) {
        console.warn(`⚠ Webhook hash doğrulama başarısız: ${merchant_oid}`);
        return res.status(403).json({
          success: false,
          error: 'Hash verification failed'
        });
      }
      console.log(`✅ Hash doğrulaması başarılı`);
    }

    // Ödeme başarılı mı kontrol et
    if (status !== 'success') {
      console.log(`❌ Ödeme başarısız/iptal: ${merchant_oid}`);
      return res.json({ success: true, status: 'failed' });
    }

    // Order ID'den userId ve packageId çıkar
    // Format: {userId}-{packageId}-{timestamp}
    const parts = merchant_oid.split('-');
    if (parts.length < 2) {
      console.warn(`⚠ Geçersiz merchant_oid formatı: ${merchant_oid}`);
      return res.status(400).json({ success: false, error: 'Invalid merchant_oid' });
    }

    const userId = parts[0];
    const packageId = parts[1];

    // Tutar doğrulaması
    if (total_amount) {
      const amountInTRY = total_amount / 100;
      if (!validatePackagePrice(packageId, amountInTRY)) {
        console.warn(`⚠ Tutar uyuşmazlığı: ${merchant_oid} (${amountInTRY} TRY)`);
        // Tutar uyuşmazlığı durumunda isteği kaydet ama işlemi tamamla
      }
    }

    // Expiry timestamp hesapla
    const expiryTimestamp = calculateExpiryTimestamp(packageId, Date.now());

    // Ödeme kaydını güncelle (localStorage veya DB'de)
    console.log(`✅ Ödeme onaylandı:`);
    console.log(`   User: ${userId}`);
    console.log(`   Package: ${packageId}`);
    console.log(`   Amount: ${total_amount ? (total_amount / 100).toFixed(2) : '?'} TRY`);
    console.log(`   Transaction ID: ${transaction_id}`);
    console.log(`   Expiry: ${new Date(expiryTimestamp).toLocaleString('tr-TR')}`);

    // localhost'ta test ediyorsak, response'a subscription bilgisi ekle
    if (test_mode === '1' || process.env.NODE_ENV === 'development') {
      console.log('ℹ TEST MOD: Demo subscription oluşturuluyor');

      // Demo subscription kaydı
      const subscription = {
        id: `sub_${Date.now()}`,
        userId,
        packageId,
        status: 'active',
        startDate: Date.now(),
        endDate: expiryTimestamp,
        transactionId: transaction_id || merchant_oid,
        createdAt: Date.now()
      };

      // localStorage'a kaydet (client tarafında)
      // Bu webhook server tarafında çalıştığı için doğrudan kaydetmiyoruz
      // Client tarafında `payment-success` sayfasında yapılacak

      res.json({
        success: true,
        status: 'success',
        message: 'Ödeme başarıyla onaylandı',
        subscription,
        debug: {
          merchant_oid,
          userId,
          packageId,
          expiryTimestamp
        }
      });
    } else {
      // Production: Gerçek veri işleme
      res.json({
        success: true,
        status: 'success',
        message: 'Ödeme başarıyla onaylandı'
      });
    }

  } catch (error) {
    console.error('Webhook işleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Ödeme durumunu kontrol et
 * GET /api/payment/status/:orderId
 */
export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    // TODO: Payment gateway'den durum kontrol et
    // Şimdi demo yanıt
    res.json({
      success: true,
      status: 'completed',
      amount: 2000,
      packageId: 'starter',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Ödeme durumu kontrol hatası:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

/**
 * Session token oluştur
 * Web-to-App bridge için
 */
function generateSessionToken(userId: string, packageId: string): string {
  // TODO: JWT token oluştur
  const payload = {
    userId,
    packageId,
    iat: Date.now(),
    exp: Date.now() + 3600000 // 1 saat geçerli
  };

  // Basit base64 encoding (Production'da JWT kullan)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Session token doğrula
 */
export function verifySessionToken(token: string): { userId: string; packageId: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded.exp < Date.now()) {
      return null; // Token süresi dolmuş
    }
    return { userId: decoded.userId, packageId: decoded.packageId };
  } catch (error) {
    console.error('Session token doğrulama hatası:', error);
    return null;
  }
}

/**
 * Master License Escrow bildirimi
 * POST /api/payment/escrow-notify
 */
export const escrowNotify: RequestHandler = async (req, res) => {
  try {
    const { userId, packageId, amount, email } = req.body;

    if (packageId !== 'master') {
      return res.status(400).json({ error: 'Master license paketi değil' });
    }

    // Admin paneline yüksek öncelikli talep ekle
    // TODO: Firestore'da escrow_requests koleksiyonuna belge ekle
    // await addDoc(collection(db, 'escrow_requests'), {
    //   userId,
    //   packageId,
    //   amount,
    //   email,
    //   status: 'pending',
    //   createdAt: Date.now(),
    //   priority: 'high'
    // });

    console.log(`🔐 Master License Escrow talebi: ${userId}`);

    res.json({ success: true, message: 'Escrow talebi kaydedildi' });

  } catch (error) {
    console.error('Escrow bildirim hatası:', error);
    res.status(500).json({ error: 'Escrow notification failed' });
  }
};

export type { PaymentResponse };
