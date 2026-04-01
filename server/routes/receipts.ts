import { RequestHandler } from 'express';
import { getDatabase, ReceiptRecord } from '../database';
import { getAdminDb } from '../lib/firebase-admin';
import { Receipt, ReceiptApprovalRequest } from '@shared/api';

const toISOTime = (value: any): string => {
  if (!value) return new Date().toISOString();
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return String(value);
};

const mapFirestoreReceipt = (doc: any) => {
  const data = doc.data() || {};

  return {
    id: doc.id,
    user_id: data.user_id || data.userId || '',
    subscription_id: data.subscription_id || data.subscriptionId || '',
    plan: data.plan || '',
    amount: data.amount || 0,
    currency: data.currency || 'TRY',
    file_name: data.file_name || data.fileName || '',
    file_url: data.file_url || data.fileUrl || '',
    file_size: data.file_size || data.fileSize || 0,
    mime_type: data.mime_type || data.mimeType || 'application/octet-stream',
    status: data.status || 'pending',
    approved_by: data.approved_by || data.approvedBy,
    approval_notes: data.approval_notes || data.approvalNotes,
    uploaded_at: toISOTime(data.uploaded_at || data.uploadedAt),
    approved_at: toISOTime(data.approved_at || data.approvedAt),
  } as ReceiptRecord;
};

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
    const firestoreDb = getAdminDb();
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

    if (firestoreDb) {
      await firestoreDb.collection('receipts').doc(receiptId).set(receipt, { merge: true });
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
    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const snapshot = await firestoreDb
        .collection('receipts')
        .where('status', '==', 'pending')
        .get();

      const firestoreReceipts = snapshot.docs.map(mapFirestoreReceipt);

      return res.json({
        success: true,
        receipts: firestoreReceipts,
        count: firestoreReceipts.length
      });
    }

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

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const receiptRef = firestoreDb.collection('receipts').doc(receiptId);
      const receiptSnap = await receiptRef.get();

      if (receiptSnap.exists) {
        await receiptRef.set({
          status,
          approved_by: adminId,
          approval_notes: notes,
          approved_at: new Date().toISOString()
        }, { merge: true });
      }
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
    let receipt = null;
    if (status === 'approved') {
      receipt = await db.getReceipt(receiptId);
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
      receipt
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
    let receiptId = req.params.receiptId;
    if (Array.isArray(receiptId)) {
      receiptId = receiptId[0];
    }

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'Dekont ID gerekli'
      });
    }

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const receiptSnap = await firestoreDb.collection('receipts').doc(receiptId).get();
      if (receiptSnap.exists) {
        return res.json({
          success: true,
          receipt: mapFirestoreReceipt(receiptSnap)
        });
      }
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
