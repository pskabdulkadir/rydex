import { RequestHandler } from "express";
import { getUserIdFromToken } from "./auth";
import { checkSubscriptionValidity } from "./subscription";

/**
 * Middleware: Aktif subscription kontrol
 * Kullanıcının subscription'ı geçerliyse devam etsin, yoksa 403 döndür
 */
export const requireActiveSubscription: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.warn("❌ Subscription kontrol: Token bulunamadı");
      return res.status(401).json({
        success: false,
        message: "Token gerekli",
      });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.warn("❌ Subscription kontrol: Token geçersiz");
      return res.status(401).json({
        success: false,
        message: "Geçersiz token",
      });
    }

    const subscriptionStatus = checkSubscriptionValidity(userId);

    if (!subscriptionStatus.isActive) {
      console.warn(`⚠️  Subscription kontrol başarısız - Kullanıcı: ${userId}, Durum: ${subscriptionStatus.daysRemaining > 0 ? 'Süresi dolmuş' : 'Satın alınmamış'}`);
      return res.status(403).json({
        success: false,
        message: "Abonelik süresi dolmuş. Lütfen yenileyin.",
        requiresRenewal: true,
        daysRemaining: subscriptionStatus.daysRemaining,
      });
    }

    // Request objesine user bilgisini ekle
    (req as any).userId = userId;
    (req as any).subscription = subscriptionStatus;

    console.log(`✅ Subscription kontrol BAŞARILI - Kullanıcı: ${userId}, Kalan: ${subscriptionStatus.daysRemaining} gün`);

    next();
  } catch (error) {
    console.error("Subscription middleware hatası:", error);
    res.status(500).json({
      success: false,
      message: "Subscription kontrol sırasında hata oluştu",
    });
  }
};

/**
 * Middleware: Admin kontrolü
 * Sadece admin kullanıcılar erişebilir
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token gerekli",
      });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz token",
      });
    }

    // Basit kontrol - gerçekte kullanıcı veritabanından kontrol edilecek
    // Şimdilik sadece özel user ID'lere izin veriyoruz
    const adminUserIds = [
      "admin",
      "admin_user",
      process.env.ADMIN_USER_ID,
    ].filter(Boolean);

    if (!adminUserIds.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için admin yetkisi gerekli",
      });
    }

    (req as any).userId = userId;
    next();
  } catch (error) {
    console.error("Admin middleware hatası:", error);
    res.status(500).json({
      success: false,
      message: "Admin kontrol sırasında hata oluştu",
    });
  }
};

/**
 * Middleware: Token doğrulama
 * Her protected route başında kullanılır
 */
export const verifyToken: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token gerekli",
      });
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz token",
      });
    }

    (req as any).userId = userId;
    (req as any).token = token;
    next();
  } catch (error) {
    console.error("Token verification hatası:", error);
    res.status(500).json({
      success: false,
      message: "Token doğrulama sırasında hata oluştu",
    });
  }
};

/**
 * Middleware: Subscription süresi dolmak üzereyse uyarı
 * Süresi 7 günden az kaldıysa uyarı mesajı döndür
 */
export const checkSubscriptionExpiring: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next();
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return next();
    }

    const subscriptionStatus = checkSubscriptionValidity(userId);

    if (subscriptionStatus.isActive && subscriptionStatus.daysRemaining <= 7) {
      // Response header'ına uyarı ekle
      res.setHeader(
        "X-Subscription-Warning",
        `Aboneliğiniz ${subscriptionStatus.daysRemaining} gün içinde sona erecek`
      );
    }

    (req as any).userId = userId;
    (req as any).subscription = subscriptionStatus;
    next();
  } catch (error) {
    console.error("Subscription expiring check hatası:", error);
    next();
  }
};
