import { RequestHandler } from "express";
import { getDatabase } from "../database";
import { getAdminDb } from "../lib/firebase-admin";
import { PACKAGES, calculateExpiryTimestamp, PackageType } from "@shared/packages";

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
      // Önce tüm kullanıcıları al
      const allSnapshot = await firestoreDb
        .collection('users')
        .get();

      // Pending ve approved olanları ayrıştır
      const allMembers = allSnapshot.docs
        .map(mapFirestoreMember)
        .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));

      // Pending olanları döndür (ama tüm kullanıcılar da döndür)
      const pendingMembers = allMembers.filter((m: any) => m.approval_status === 'pending');

      return res.json({
        success: true,
        count: pendingMembers.length,
        members: pendingMembers,
        allMembers: allMembers, // Admin panelinde göstermek için tüm üyeleri de döndür
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
 * Eski kullanıcıları getir (Reddedilen, Suspended, vb.) - Admin için
 */
export const handleGetOldUsers: RequestHandler = async (req, res) => {
  try {
    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      // Tüm kullanıcıları al
      const allSnapshot = await firestoreDb
        .collection('users')
        .get();

      // Tüm kullanıcıları map et
      const allMembers = allSnapshot.docs
        .map((doc) => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            username: data.username || data.displayName || data.email || doc.id,
            email: data.email || '',
            phone: data.phone || data.phoneNumber || '',
            created_at: toISOTime(data.createdAt || data.created_at),
            approval_status: data.approval_status || data.approvalStatus || 'pending',
            is_active: data.is_active !== false,
            subscription_end: data.subscription_end ? toISOTime(data.subscription_end) : null,
            rejection_reason: data.rejection_reason || null,
            approved_at: data.approved_at ? toISOTime(data.approved_at) : null,
            approved_by: data.approved_by || null,
          };
        })
        .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));

      // Eski kullanıcıları filter et (reddedilen, inactive, subscription süresi geçen)
      const oldUsers = allMembers.filter((user: any) => {
        // 1. Reddedilen kullanıcılar
        if (user.approval_status === 'rejected') return true;

        // 2. İnaktif kullanıcılar
        if (!user.is_active) return true;

        // 3. Subscription'ı geçen kullanıcılar
        if (user.subscription_end && new Date(user.subscription_end) < new Date()) return true;

        return false;
      });

      return res.json({
        success: true,
        count: oldUsers.length,
        oldUsers: oldUsers,
        stats: {
          total: allMembers.length,
          rejected: allMembers.filter((u: any) => u.approval_status === 'rejected').length,
          inactive: allMembers.filter((u: any) => !u.is_active).length,
          subscriptionExpired: allMembers.filter((u: any) =>
            u.subscription_end && new Date(u.subscription_end) < new Date()
          ).length,
        }
      });
    }

    const db = getDatabase();
    const pendingUsers = await db.getPendingUsers();

    res.json({
      success: true,
      count: 0,
      oldUsers: [],
      stats: {
        total: 0,
        rejected: 0,
        inactive: 0,
        subscriptionExpired: 0,
      }
    });
  } catch (error) {
    console.error('Eski kullanıcıları getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Eski kullanıcılar alınamadı',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Kullanıcı onayını güncelle (Admin işlemi)
 * Onay yapıldığında otomatik olarak paket açılır
 */
export const handleApproveUser: RequestHandler = async (req, res) => {
  try {
    const { userId, status, reason, packageId = 'starter' } = req.body;
    const adminId = (req as any).adminId || 'admin';

    if (!userId || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz istek: userId ve status (approved/rejected) gereklidir'
      });
    }

    // Paket validasyonu
    if (status === 'approved' && !PACKAGES[packageId as PackageType]) {
      return res.status(400).json({
        success: false,
        error: `Geçersiz paket: ${packageId}`
      });
    }

    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const userRef = firestoreDb.collection('users').doc(userId);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        // Paket bilgisini al
        const pkg = PACKAGES[packageId as PackageType];
        const startTime = Date.now();
        const expiryTime = calculateExpiryTimestamp(packageId as PackageType, startTime);

        // Update data
        const updateData: any = {
          approval_status: status,
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          rejection_reason: status === 'rejected' ? (reason || null) : null,
          is_active: status === 'approved',
        };

        // Onay yapıldıysa subscription set et
        if (status === 'approved' && pkg) {
          updateData.current_package = packageId;
          updateData.subscription_start = new Date(startTime).toISOString();
          updateData.subscription_end = new Date(expiryTime).toISOString();
          updateData.package_activated_at = new Date().toISOString();
          updateData.package_activated_by = adminId;
          updateData.is_active = true; // Kullanıcıyı aktif yap
        }

        await userRef.set(updateData, { merge: true });

        console.log(`✅ Üye ${status}: ${userId} (Firestore, Admin: ${adminId})`);
        if (status === 'approved') {
          console.log(`📦 Paket açıldı: ${packageId} (Süresi: ${pkg?.duration})`);
        }

        return res.json({
          success: true,
          message: status === 'approved'
            ? `Üye onaylandı ve ${pkg?.name} paketi otomatik açıldı`
            : 'Üye başarıyla reddedildi',
          userId,
          status,
          packageId: status === 'approved' ? packageId : undefined,
          subscriptionEnd: status === 'approved' ? new Date(expiryTime).toISOString() : undefined
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

        // Onay başarılı ise paket data al ve subscription set et
        let subscriptionEnd = undefined;
        if (status === 'approved') {
          const pkg = PACKAGES[packageId as PackageType];
          if (pkg) {
            const startTime = Date.now();
            const expiryTime = calculateExpiryTimestamp(packageId as PackageType, startTime);
            subscriptionEnd = new Date(expiryTime).toISOString();
            console.log(`📦 Paket açıldı: ${packageId} (Süresi: ${pkg.duration})`);
            
            // Veritabanına da subscription bilgisini ekle
            try {
              const db = getDatabase();
              await db.updateUserSubscription(userId, packageId, subscriptionEnd);
            } catch (dbErr) {
              console.warn(`⚠️ Veritabanı subscription güncelleme hatası: ${userId}`, dbErr);
            }
          }
        }

    console.log(`✅ Üye ${status}: ${userId} (Admin: ${adminId})`);

    res.json({
      success: true,
      message: status === 'approved'
        ? `Üye onaylandı ve paket otomatik açıldı`
        : 'Üye başarıyla reddedildi',
      userId,
      status,
      packageId: status === 'approved' ? packageId : undefined,
      subscriptionEnd: subscriptionEnd
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
 * Tüm kullanıcıları getir (Admin için)
 */
export const handleGetAllUsers: RequestHandler = async (req, res) => {
  try {
    const firestoreDb = getAdminDb();
    if (firestoreDb) {
      const snapshot = await firestoreDb.collection('users').get();
      
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username || data.displayName || data.email || doc.id,
          email: data.email || '',
          phone: data.phone || data.phoneNumber || '',
          created_at: toISOTime(data.createdAt || data.created_at),
          approval_status: data.approval_status || data.approvalStatus || 'pending',
          is_active: data.is_active !== false,
          current_package: data.current_package || 'free',
          subscription_end: data.subscription_end ? toISOTime(data.subscription_end) : null,
          last_login: data.last_login ? toISOTime(data.last_login) : null,
        };
      });

      return res.json({
        success: true,
        count: users.length,
        users: users.sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
      });
    }

    const db = getDatabase();
    const users = await db.getAllUsers();

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Tüm kullanıcıları getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kullanıcılar alınamadı',
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
