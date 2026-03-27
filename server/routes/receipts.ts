import { RequestHandler } from 'express';
import { getDatabase, ReceiptRecord } from '../database';
import { Receipt, ReceiptApprovalRequest } from '@shared/api';

/**
 * Dekont yükle
 */
export const handleUploadReceipt: RequestHandler = async (req, res) => {
  try {
    const { subscriptionId, plan, amount, currency, fileName, fileUrl, fileSize, mimeType } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı ID gerekli'
      });
    }

    if (!subscriptionId || !plan || !amount || !fileUrl || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik'
      });
    }

    const db = getDatabase();
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const receipt: ReceiptRecord = {
      id: receiptId,
      user_id: userId,
      subscription_id: subscriptionId,
      plan,
      amount,
      currency: currency || 'TRY',
      file_name: fileName,
      file_url: fileUrl,
      file_size: fileSize || 0,
      mime_type: mimeType || 'application/octet-stream',
      status: 'pending',
      uploaded_at: new Date().toISOString(),
    };

    const result = await db.saveReceipt(receipt);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Dekont kaydedilemedi'
      });
    }

    console.log(`✅ Dekont yüklendi: ${fileName} (${userId})`);

    res.status(201).json({
      success: true,
      receipt: {
        id: receipt.id,
        status: receipt.status,
        uploadedAt: receipt.uploaded_at
      },
      message: 'Dekont başarıyla yüklendi. Onay için bekleniyor.'
    });
  } catch (error) {
    console.error('Dekont yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekont yükleme sırasında hata oluştu'
    });
  }
};

/**
 * Kullanıcının dekonklarını getir
 */
export const handleGetUserReceipts: RequestHandler = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı ID gerekli'
      });
    }

    const db = getDatabase();
    const receipts = await db.getUserReceipts(userId);

    res.json({
      success: true,
      receipts,
      count: receipts.length
    });
  } catch (error) {
    console.error('Dekont sorgulaması hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekontlar alınamadı'
    });
  }
};

/**
 * Onay bekleyen tüm dekonları getir (Admin)
 */
export const handleGetPendingReceipts: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const receipts = await db.getPendingReceipts();

    res.json({
      success: true,
      receipts,
      count: receipts.length
    });
  } catch (error) {
    console.error('Bekleyen dekont sorgulaması hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekontlar alınamadı'
    });
  }
};

/**
 * Dekont onayı veya reddi
 */
export const handleApproveReceipt: RequestHandler = async (req, res) => {
  try {
    const { receiptId, status, notes } = req.body as ReceiptApprovalRequest & { notes?: string };
    const adminId = req.headers['x-admin-id'] as string;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID gerekli'
      });
    }

    if (!receiptId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Dekont ID ve durum gerekli'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum. "approved" veya "rejected" olmalı.'
      });
    }

    const db = getDatabase();
    const result = await db.updateReceiptStatus(receiptId, status, adminId, notes);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Dekont güncellenemedi'
      });
    }

    // Eğer onaylandıysa ve subscription varsa, subscription'ı aktif et
    if (status === 'approved') {
      const receipt = await db.getReceipt(receiptId);
      if (receipt) {
        console.log(`✅ Dekont onaylandı: ${receiptId} - Subscription aktif ediliyor...`);

        // Subscription'ı aktif et
        // Bu işlem client tarafından da yapılacak, ama server tarafında da yapılabilir
        // Şimdilik client tarafında yapıldığını varsayıyorum
      }
    }

    res.json({
      success: true,
      message: `Dekont ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      receiptId,
      receipt: receipt
    });
  } catch (error) {
    console.error('Dekont onaylama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekont onaylanırken hata oluştu'
    });
  }
};

/**
 * Spesifik dekont bilgisini getir
 */
export const handleGetReceipt: RequestHandler = async (req, res) => {
  try {
    const { receiptId } = req.params;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'Dekont ID gerekli'
      });
    }

    const db = getDatabase();
    const receipt = await db.getReceipt(receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Dekont bulunamadı'
      });
    }

    res.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error('Dekont getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekont alınamadı'
    });
  }
};
