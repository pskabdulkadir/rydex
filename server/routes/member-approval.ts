import { RequestHandler } from "express";
import { getDatabase } from "../database";
import { getAdminDb } from "../lib/firebase-admin";

const toISOTime = (value: any): string => {
  if (!value) return new Date().toISOString();
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return String(value);
};

const mapFirestoreMember = (doc: any) => {
  const data = doc.data() || {};

  return {
    id: doc.id,
    username: data.username || data.displayName || data.email || doc.id,
    phone: data.phone || data.phoneNumber || '',
    created_at: toISOTime(data.createdAt || data.created_at),
    approval_status: data.approval_status || data.approvalStatus || 'pending'
  };
};

/**
 * Onay bekleyen kullanıcıları getir (Admin için)
 */
export const handleGetPendingMembers: RequestHandler = async (req, res) => {
  try {
    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const snapshot = await firestoreDb
        .collection('users')
        .where('approval_status', '==', 'pending')
        .get();

      const firestoreMembers = snapshot.docs
        .map(mapFirestoreMember)
        .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));

      return res.json({
        success: true,
        count: firestoreMembers.length,
        members: firestoreMembers,
      });
    }

    const db = getDatabase();
    const pendingMembers = await db.getPendingUsers();

    // Şifre hash'lerini çıkar response'dan
    const sanitizedMembers = pendingMembers.map(user => ({
      id: user.id,
      username: user.username,
      phone: user.phone,
      created_at: user.created_at,
      approval_status: user.approval_status
    }));

    res.json({
      success: true,
      count: sanitizedMembers.length,
      members: sanitizedMembers
    });
  } catch (error) {
    console.error('Bekleyen üyeler getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Bekleyen üyeler alınamadı',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Kullanıcı onayını güncelle (Admin işlemi)
 */
export const handleApproveUser: RequestHandler = async (req, res) => {
  try {
    const { userId, status, reason } = req.body;
    const adminId = (req as any).adminId || 'admin';

    if (!userId || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz istek: userId ve status (approved/rejected) gereklidir'
      });
    }

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const userRef = firestoreDb.collection('users').doc(userId);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        await userRef.set({
          approval_status: status,
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? (reason || null) : null,
          is_active: status === 'approved',
        }, { merge: true });

        console.log(`✅ Üye ${status}: ${userId} (Firestore, Admin: ${adminId})`);

        return res.json({
          success: true,
          message: status === 'approved'
            ? 'Üye başarıyla onaylandı'
            : 'Üye başarıyla reddedildi',
          userId,
          status
        });
      }
    }

    const db = getDatabase();
    const result = await db.updateUserApprovalStatus(
      userId,
      status as 'approved' | 'rejected',
      adminId,
      reason
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Onay güncellenemedi'
      });
    }

    // Onay başarılı ise log tutuş
    console.log(`✅ Üye ${status}: ${userId} (Admin: ${adminId})`);

    res.json({
      success: true,
      message: status === 'approved' 
        ? 'Üye başarıyla onaylandı'
        : 'Üye başarıyla reddedildi',
      userId,
      status
    });
  } catch (error) {
    console.error('Üye onay hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Onay işlemi başarısız',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Kullanıcı sil (Sahte üyeler için)
 */
export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId gereklidir'
      });
    }

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const userRef = firestoreDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.delete();
        console.log(`🗑️ Kullanıcı silindi (Firestore): ${userId}`);
        return res.json({
          success: true,
          message: 'Kullanıcı başarıyla silindi',
          userId
        });
      }
    }

    const db = getDatabase();
    const result = await db.deleteUser(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Kullanıcı silinemedi'
      });
    }

    console.log(`🗑️ Kullanıcı silindi: ${userId}`);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
      userId
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Silme işlemi başarısız',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Kullanıcı abonelik bilgisini güncelle (Admin onay sonrası)
 */
export const handleUpdateUserSubscription: RequestHandler = async (req, res) => {
  try {
    const { userId, packageId, subscriptionEnd } = req.body;

    if (!userId || !packageId || !subscriptionEnd) {
      return res.status(400).json({
        success: false,
        error: 'userId, packageId ve subscriptionEnd gereklidir'
      });
    }

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const userRef = firestoreDb.collection('users').doc(userId);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        await userRef.set({
          current_package: packageId,
          subscription_start: new Date().toISOString(),
          subscription_end: subscriptionEnd,
          is_active: true,
        }, { merge: true });

        console.log(`✅ Abonelik güncellendi (Firestore): ${userId} -> ${packageId}`);

        return res.json({
          success: true,
          message: 'Abonelik başarıyla güncellendi',
          userId,
          packageId
        });
      }
    }

    const db = getDatabase();
    const result = await db.updateUserSubscription(
      userId,
      packageId,
      subscriptionEnd
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Abonelik güncellenemedi'
      });
    }

    console.log(`✅ Abonelik güncellendi: ${userId} -> ${packageId}`);

    res.json({
      success: true,
      message: 'Abonelik başarıyla güncellendi',
      userId,
      packageId
    });
  } catch (error) {
    console.error('Abonelik güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Abonelik güncellenemedi',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
