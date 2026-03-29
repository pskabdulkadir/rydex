import { RequestHandler } from "express";
import { SubscriptionPlan, Subscription, SubscriptionPlanDetail } from "@shared/api";
import { getUserIdFromToken } from "./auth";

// In-memory stores
const subscriptions = new Map<string, Subscription>();
const userSubscriptions = new Map<string, Subscription>();

// Plan detayları
const subscriptionPlans: Record<SubscriptionPlan, SubscriptionPlanDetail> = {
  free: {
    id: "free",
    name: "Ücretsiz",
    price: 0,
    currency: "TRY",
    durationDays: 0,
    features: {
      scansPerDay: 5,
      maxScanDuration: 60,
      customAnalysis: false,
      adminAccess: false,
    },
  },
  monthly: {
    id: "monthly",
    name: "Aylık",
    price: 99,
    currency: "TRY",
    durationDays: 30,
    features: {
      scansPerDay: 50,
      maxScanDuration: 600,
      customAnalysis: true,
      adminAccess: false,
    },
  },
  quarterly: {
    id: "quarterly",
    name: "3 Aylık",
    price: 249,
    currency: "TRY",
    durationDays: 90,
    features: {
      scansPerDay: 150,
      maxScanDuration: 1200,
      customAnalysis: true,
      adminAccess: false,
    },
  },
  annual: {
    id: "annual",
    name: "Yıllık",
    price: 799,
    currency: "TRY",
    durationDays: 365,
    features: {
      scansPerDay: 500,
      maxScanDuration: 3600,
      customAnalysis: true,
      adminAccess: true,
    },
  },
};

/**
 * Subscription planlarını al
 */
export const handleGetPlans: RequestHandler = (req, res) => {
  res.json({
    success: true,
    plans: Object.values(subscriptionPlans),
  });
};

/**
 * Aktif subscription'ı al
 */
export const handleGetActiveSubscription: RequestHandler = (req, res) => {
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

    const subscription = userSubscriptions.get(userId);
    
    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: "Aktif subscription yok",
      });
    }

    // Subscription'ın süresi dolmuşsa kontrol et
    const now = Date.now();
    if (subscription.endDate < now && subscription.status === "active") {
      subscription.status = "expired";
      userSubscriptions.set(userId, subscription);
    }

    const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      subscription: {
        ...subscription,
        daysRemaining,
      },
    });
  } catch (error) {
    console.error("Subscription fetch hatası:", error);
    res.status(500).json({
      success: false,
      message: "Subscription bilgisi alınamadı",
    });
  }
};

/**
 * Yeni subscription oluştur (Ödeme sonrası veya Dekont onayından sonra)
 */
export const handleCreateSubscription: RequestHandler<any, any, { userId?: string; plan: SubscriptionPlan }> = (
  req,
  res
) => {
  try {
    const { userId: bodyUserId, plan } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    // Önce token'dan userId al, yoksa body'den al
    let userId = bodyUserId;

    if (token) {
      const tokenUserId = getUserIdFromToken(token);
      if (tokenUserId) {
        console.log(`📝 Token'dan userId alındı: ${tokenUserId}`);
        userId = tokenUserId;
      }
    }

    if (!userId || !plan) {
      console.warn("❌ Subscription oluştur: userId veya plan eksik");
      return res.status(400).json({
        success: false,
        message: "userId ve plan gerekli",
      });
    }

    if (!subscriptionPlans[plan]) {
      console.warn(`❌ Subscription oluştur: Geçersiz plan - ${plan}`);
      return res.status(400).json({
        success: false,
        message: "Geçersiz plan",
      });
    }

    // Eğer aynı kullanıcının aktif subscription'ı varsa, öncekini tutmak isteyip istemediğini kontrol et
    const existingSub = userSubscriptions.get(userId);
    if (existingSub && existingSub.status === "active" && existingSub.endDate > Date.now()) {
      // Eski subscription'ın süresi kalan günleri hesapla ve yeni plana ekle
      const oldDaysRemaining = Math.ceil((existingSub.endDate - Date.now()) / (1000 * 60 * 60 * 24));
      console.log(`ℹ️ Kullanıcı ${userId} zaten aktif subscription'a sahip: ${oldDaysRemaining} gün kaldı`);
    }

    const planDetail = subscriptionPlans[plan];
    const now = Date.now();
    const endDate = now + planDetail.durationDays * 24 * 60 * 60 * 1000;

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      plan,
      startDate: now,
      endDate,
      status: "active",
      autoRenew: false,
      createdAt: now,
      updatedAt: now,
    };

    subscriptions.set(subscription.id, subscription);
    userSubscriptions.set(userId, subscription);

    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    console.log(`✅ Subscription başarıyla oluşturuldu:`);
    console.log(`   Kullanıcı: ${userId}`);
    console.log(`   Plan: ${plan}`);
    console.log(`   Gün: ${daysRemaining}`);
    console.log(`   Süresi Bitiş: ${new Date(endDate).toLocaleString("tr-TR")}`);

    res.status(201).json({
      success: true,
      subscription: {
        ...subscription,
        daysRemaining,
      },
      message: "Subscription başarıyla oluşturuldu",
    });
  } catch (error) {
    console.error("Subscription create hatası:", error);
    res.status(500).json({
      success: false,
      message: "Subscription oluşturulurken hata oluştu",
    });
  }
};

/**
 * Subscription iptal et
 */
export const handleCancelSubscription: RequestHandler = (req, res) => {
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

    const subscription = userSubscriptions.get(userId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Aktif subscription yok",
      });
    }

    subscription.status = "cancelled";
    subscription.updatedAt = Date.now();
    userSubscriptions.set(userId, subscription);

    console.log(`✅ Subscription iptal edildi: ${userId}`);

    res.json({
      success: true,
      message: "Subscription iptal edildi",
    });
  } catch (error) {
    console.error("Subscription cancel hatası:", error);
    res.status(500).json({
      success: false,
      message: "Subscription iptal edilirken hata oluştu",
    });
  }
};

/**
 * Subscription geçerliliğini kontrol et (Middleware için)
 */
export function isSubscriptionActive(userId: string): boolean {
  const subscription = userSubscriptions.get(userId);
  if (!subscription) return false;

  const now = Date.now();
  return subscription.status === "active" && subscription.endDate > now;
}

/**
 * Subscription geçerliliğini kontrol et ve güncelle
 */
export function checkSubscriptionValidity(userId: string): {
  isActive: boolean;
  daysRemaining: number;
  plan: SubscriptionPlan | null;
} {
  const subscription = userSubscriptions.get(userId);

  if (!subscription) {
    return {
      isActive: false,
      daysRemaining: 0,
      plan: null,
    };
  }

  const now = Date.now();
  const isActive = subscription.status === "active" && subscription.endDate > now;

  if (!isActive && subscription.status === "active") {
    subscription.status = "expired";
    userSubscriptions.set(userId, subscription);
  }

  const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)));

  return {
    isActive,
    daysRemaining,
    plan: isActive ? subscription.plan : null,
  };
}

/**
 * Tüm subscriptions'ları al (Admin için)
 */
export const handleGetAllSubscriptions: RequestHandler = (req, res) => {
  try {
    const allSubscriptions = Array.from(subscriptions.values()).map(sub => {
      const daysRemaining = Math.max(0, Math.ceil((sub.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
      return {
        ...sub,
        daysRemaining,
      };
    });

    res.json({
      success: true,
      count: allSubscriptions.length,
      subscriptions: allSubscriptions,
    });
  } catch (error) {
    console.error("Get all subscriptions hatası:", error);
    res.status(500).json({
      success: false,
      message: "Subscriptions alınamadı",
    });
  }
};

/**
 * Kullanıcının subscriptions geçmişini al (Admin için)
 */
export const handleGetUserSubscriptionHistory: RequestHandler<{ userId: string }> = (req, res) => {
  try {
    const { userId } = req.params;

    const userSubs = Array.from(subscriptions.values())
      .filter(sub => sub.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      userId,
      count: userSubs.length,
      subscriptions: userSubs,
    });
  } catch (error) {
    console.error("User subscription history hatası:", error);
    res.status(500).json({
      success: false,
      message: "Subscription geçmişi alınamadı",
    });
  }
};
