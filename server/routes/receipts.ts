import { RequestHandler } from 'express';
import { getDatabase, ReceiptRecord } from '../database';
import { getAdminDb } from '../lib/firebase-admin';
import { Receipt, ReceiptApprovalRequest } from '@shared/api';
import { PACKAGES, calculateExpiryTimestamp, PackageType } from '@shared/packages';

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
    console.log('📄 Dekont yükleme başlandı...');

    const { subscriptionId, plan, amount, currency, fileName, fileUrl, fileSize, mimeType } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı ID gerekli'
      });
    }

    // subscriptionId opsiyonel (yeni ödeme için henüz subscription yok)
    if (!plan || !amount || !fileUrl || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik: plan, amount, fileUrl, fileName gerekli'
      });
    }

    const db = getDatabase();
    let firestoreDb = null;

    try {
      firestoreDb = getAdminDb();
    } catch (fbError) {
      console.warn('⚠️ Firebase Firestore yüklenemedi:', fbError instanceof Error ? fbError.message : String(fbError));
    }

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
      try {
        // Firestore undefined değerleri kabul etmez, temizle
        const firestoreReceipt: any = { ...receipt };
        if (firestoreReceipt.subscription_id === undefined) {
          delete firestoreReceipt.subscription_id;
        }
        await firestoreDb.collection('receipts').doc(receiptId).set(firestoreReceipt, { merge: true });
        console.log(`📦 Firestore'a kaydedildi: ${receiptId}`);
      } catch (fbError) {
        console.warn('⚠️ Firestore kaydetme hatası (bellek içinde kayıtlı):', fbError instanceof Error ? fbError.message : String(fbError));
        // Hata olsa da devam et, zaten bellek içinde kayıtlı
      }
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
    console.error('❌ Dekont yükleme hatası:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : String(error));
    res.status(500).json({
      success: false,
      message: 'Dekont yükleme sırasında hata oluştu',
      error: error instanceof Error ? error.message : String(error)
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
    console.log('📄 Bekleyen dekonlar sorgulanıyor...');

    let firestoreDb = null;
    try {
      firestoreDb = getAdminDb();
    } catch (fbError) {
      console.warn('⚠️ Firebase Firestore yüklenemedi:', fbError instanceof Error ? fbError.message : String(fbError));
    }

    if (firestoreDb) {
      try {
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
      } catch (fbQueryError) {
        console.warn('⚠️ Firestore sorgusu başarısız, bellek içine fallback:', fbQueryError instanceof Error ? fbQueryError.message : String(fbQueryError));
      }
    }

    const db = getDatabase();
    const receipts = await db.getPendingReceipts();

    res.json({
      success: true,
      receipts,
      count: receipts.length
    });
  } catch (error) {
    console.error('❌ Bekleyen dekont sorgulaması hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dekontlar alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Dekont onayı veya reddi
 * Onay yapıldığında otomatik olarak user'a subscription set edilir
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

    // Önce dekont bilgisini al
    const db = getDatabase();
    let receipt = await db.getReceipt(receiptId);

    const firestoreDb = getAdminDb();
    if (firestoreDb && !receipt) {
      const receiptSnap = await firestoreDb.collection('receipts').doc(receiptId).get();
      if (receiptSnap.exists) {
        receipt = mapFirestoreReceipt(receiptSnap);
      }
    }

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Dekont bulunamadı'
      });
    }

    // Firestore'a güncelle
    if (firestoreDb) {
      try {
        const receiptRef = firestoreDb.collection('receipts').doc(receiptId);

        const updateData: any = {
          status,
          approved_by: adminId,
          approval_notes: notes,
          approved_at: new Date().toISOString()
        };

        // Onay yapıldıysa user'a subscription set et
        if (status === 'approved' && receipt.user_id) {
          const packageId = (receipt.plan as PackageType) || 'starter';
          const pkg = PACKAGES[packageId];

          if (pkg) {
            const startTime = Date.now();
            const expiryTime = calculateExpiryTimestamp(packageId, startTime);

            // 1. Önce database'e kaydet (bellek içi)
            await db.updateUserSubscription(receipt.user_id, packageId, new Date(expiryTime).toISOString());
            console.log(`📦 User ${receipt.user_id}'e paket açıldı (Database): ${packageId} (Süresi: ${pkg.duration})`);

            // 2. Firestore'a da kaydet (varsa)
            if (firestoreDb) {
              try {
                const userRef = firestoreDb.collection('users').doc(receipt.user_id);
                const userSnap = await userRef.get();

                if (userSnap.exists) {
                  await userRef.set({
                    current_package: packageId,
                    subscription_start: new Date(startTime).toISOString(),
                    subscription_end: new Date(expiryTime).toISOString(),
                    package_activated_at: new Date().toISOString(),
                    package_activated_by: adminId,
                    last_receipt_approved: receiptId,
                    is_active: true,
                  }, { merge: true });
                  console.log(`✅ Firestore user güncellendi: ${receipt.user_id}`);
                }
              } catch (userError) {
                console.warn('⚠️ Firestore user güncelleme hatası (database güncellendi):', userError instanceof Error ? userError.message : String(userError));
              }
            }
          }
        }

        await receiptRef.set(updateData, { merge: true });
        console.log(`✅ Firestore dekont güncellendi: ${receiptId}`);
      } catch (fbError) {
        console.warn('⚠️ Firestore güncelleme hatası (database güncellenecek):', fbError instanceof Error ? fbError.message : String(fbError));
        // Hata olsa da devam et, database güncellenecek
      }
    }

    // Database'e de güncelle
    const result = await db.updateReceiptStatus(receiptId, status, adminId, notes);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Dekont güncellenemedi'
      });
    }

    res.json({
      success: true,
      message: status === 'approved'
        ? `Dekont onaylandı ve kullanıcıya paket otomatik açıldı`
        : 'Dekont reddedildi',
      receiptId,
      userId: receipt.user_id,
      plan: receipt.plan,
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
