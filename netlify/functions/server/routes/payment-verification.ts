/**
 * Payment Verification Routes
 * Ödeme doğrulama ve kontrol endpoint'leri
 */

import { RequestHandler } from 'express';

/**
 * POST /api/payment/verify
 * Ödeme durumunu doğrula
 */
export const verifyPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { paymentId, userId } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'paymentId ve userId gereklidir'
      });
    }

    // localStorage'dan ödeme kaydını kontrol et (demo sistem)
    // Gerçek sistemde database sorgusu yapılmalı
    
    console.log(`🔍 Ödeme doğrulanıyor: ${paymentId} (${userId})`);

    // Demo: Ödemeyi başarılı olarak işaretle
    const verified = true;

    res.json({
      success: true,
      verified,
      message: verified ? 'Ödeme başarıyla doğrulandı' : 'Ödeme bekleme aşamasında',
      paymentId,
      userId
    });
  } catch (error) {
    console.error('Ödeme doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Ödeme doğrulama sırasında hata oluştu'
    });
  }
};

/**
 * POST /api/payment/initiate (DEPRECATED)
 * Bu endpoint artık kullanılmamaktadır.
 * IBAN/Havale sistemi için /api/payment/initiate'ı (payment.ts) kullanınız.
 */
export const initiatePaymentDeprecated: RequestHandler = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Bu endpoint artık kullanılmamaktadır. IBAN/Havale sistemini kullanınız.',
    newEndpoint: '/api/payment/initiate (payment.ts)',
    system: 'IBAN/Havale Tabanlı Ödeme'
  });
};

/**
 * GET /api/payment/status/:orderId
 * Sipariş ödeme durumunu kontrol et
 */
export const checkPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID gereklidir'
      });
    }

    console.log(`📊 Ödeme durumu kontrol ediliyor: ${orderId}`);

    // Demo sistem: Başarılı dön
    // Gerçek sistemde: Payment gateway'den durumu kontrol et

    res.json({
      success: true,
      status: 'completed',
      orderId,
      message: 'Ödeme tamamlandı'
    });
  } catch (error) {
    console.error('Ödeme durumu kontrol hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme durumu kontrol edilemedi'
    });
  }
};

/**
 * POST /api/payment/webhook (DEPRECATED)
 * Payment gateway webhook (IBAN/Havale sistemi kullanıyor)
 * Not: Havale/Transfer için webhook gerekmez, dekont yükleme sistemi kullanılır
 */
export const paymentWebhook: RequestHandler = async (req, res) => {
  // IBAN/Havale sistemi webhooks kullanmaz
  // Dekont yükleme → Admin onayı → Subscription aktivasyonu akışı kullanılır
  res.json({
    success: true,
    message: 'IBAN/Havale sistemi webhooks kullanmaz'
  });
};

/**
 * POST /api/payment/refund
 * Ödeme iadesi işlemi (IBAN/Havale sistemi için)
 */
export const refundPayment: RequestHandler = async (req, res) => {
  try {
    const { paymentId, userId, amount, reason } = req.body;

    if (!paymentId || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik'
      });
    }

    console.log(`💰 İade işlemi başlatılıyor: ${paymentId} - ${amount}₺`);
    console.log(`   Sebep: ${reason}`);

    // IBAN/Havale sisteminde iade, admin panel'den manuel olarak yönetilir
    // Subscription'ı iptal et ve ödeme talebini güncelle

    const refundId = `refund_${Date.now()}`;

    res.json({
      success: true,
      message: 'İade başarıyla işlendi',
      refundId,
      paymentId,
      amount,
      status: 'completed',
      note: 'Admin tarafından manuel ödeme iadesi yapılacaktır'
    });
  } catch (error) {
    console.error('İade işlemi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İade işlemi başarısız'
    });
  }
};
