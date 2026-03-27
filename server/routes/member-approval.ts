import { RequestHandler } from "express";
import { getDatabase } from "../database";

/**
 * Onay bekleyen kullanıcıları getir (Admin için)
 */
export const handleGetPendingMembers: RequestHandler = async (req, res) => {
  try {
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
