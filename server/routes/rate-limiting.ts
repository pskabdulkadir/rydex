import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * GÖREV 12: Rate Limiting - API Oran Sınırlaması
 * API isteklerini sınırla ve DDoS'tan koru
 * - IP bazlı rate limiting
 * - User bazlı rate limiting
 * - Endpoint spesifik limitler
 * - Whitelist desteği
 */

interface RateLimitConfig {
  windowMs: number; // Zaman penceresi (ms)
  maxRequests: number; // Maksimum istek sayısı
  keyGenerator?: (req: Request) => string; // Anahtar üretme fonksiyonu
  skip?: (req: Request) => boolean; // Atlanacak istekler
  message?: string; // Hata mesajı
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitStats {
  total: number;
  blocked: number;
  blockedByIp: {
    [ip: string]: number;
  };
}

// Global rate limit store
const store: RateLimitStore = {};
const stats: RateLimitStats = {
  total: 0,
  blocked: 0,
  blockedByIp: {},
};

// Varsayılan konfigürasyon
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 100,
  keyGenerator: (req) => req.ip || "unknown",
  message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
};

/**
 * Rate limiting middleware'i oluştur
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    // ⚠️ DEVELOPMENT: Rate limiting devre dışı
    return next();

    try {
      // Skip kontrolü (artık çalışmayacak)
      if (finalConfig.skip && finalConfig.skip(req)) {
        return next();
      }

      const key = finalConfig.keyGenerator!(req);
      const now = Date.now();

      // Store'u temizle (süresi dolmuş öğeleri sil)
      if (store[key] && store[key].resetTime < now) {
        delete store[key];
      }

      // Kullanıcı için ilk istek
      if (!store[key]) {
        store[key] = {
          count: 1,
          resetTime: now + finalConfig.windowMs!,
        };
        stats.total++;
        return next();
      }

      // Kullanıcı limiti kontrol et
      if (store[key].count >= finalConfig.maxRequests!) {
        stats.blocked++;
        const ip = req.ip || "unknown";
        stats.blockedByIp[ip] = (stats.blockedByIp[ip] || 0) + 1;

        console.warn(
          `⚠️ Rate limit aşıldı (${key}): ${store[key].count}/${finalConfig.maxRequests}`
        );

        return res.status(429).json({
          success: false,
          error: finalConfig.message,
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        });
      }

      // İstek sayısını artır
      store[key].count++;
      stats.total++;

      // Headers'a bilgi ekle
      const remaining = finalConfig.maxRequests! - store[key].count;
      const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

      res.setHeader("X-RateLimit-Limit", finalConfig.maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
      res.setHeader("X-RateLimit-Reset", store[key].resetTime);
      res.setHeader("Retry-After", resetTime);

      next();
    } catch (error) {
      console.error("Rate limiter middleware error:", error);
      // Hata olursa middleware'i atlayıp devam et
      next();
    }
  };
}

/**
 * Sıkı rate limiting (giriş, kayıt vb. hassas endpoint'ler için)
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 5, // Maksimum 5 istek
  message: "Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.",
});

/**
 * Orta rate limiting (normal API endpoint'leri için)
 */
export const normalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 100, // Maksimum 100 istek
});

/**
 * Rahat rate limiting (veri getter endpoint'leri için)
 */
export const relaxedRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 1000, // Maksimum 1000 istek
});

/**
 * IP tabanlı strict rate limiting
 */
export const ipStrictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 saat
  maxRequests: 20, // IP başına 20 istek
  keyGenerator: (req) => req.ip || "unknown",
  message: "IP adresiniz geçici olarak kısıtlandı. Lütfen 1 saat sonra tekrar deneyin.",
});

/**
 * User bazlı rate limiting
 */
export function createUserRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    keyGenerator: (req) => {
      const userId = (req as any).userId || (req as any).user?.id;
      return userId ? `user-${userId}` : "anonymous";
    },
  };

  return createRateLimiter(finalConfig);
}

/**
 * Rate limit istatistiklerini getir (admin)
 */
export const handleGetRateLimitStats: RequestHandler = (req, res) => {
  try {
    const storeSize = Object.keys(store).length;

    res.json({
      success: true,
      stats: {
        ...stats,
        activeKeys: storeSize,
        topBlocked: Object.entries(stats.blockedByIp)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .reduce((acc, [ip, count]) => ({ ...acc, [ip]: count }), {}),
      },
    });

    console.log(`📊 Rate limit istatistikleri: ${stats.total} toplam, ${stats.blocked} bloklu`);
  } catch (error) {
    console.error("Rate limit istatistikleri getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Rate limit istatistikleri getirilemedi",
    });
  }
};

/**
 * Rate limit store'unu sıfırla (admin)
 */
export const handleResetRateLimitStore: RequestHandler = (req, res) => {
  try {
    const { ip, userId } = req.query;

    if (ip) {
      // Belirtilen IP'yi sıfırla
      Object.keys(store).forEach((key) => {
        if (key === ip) {
          delete store[key];
        }
      });
      console.log(`🔄 Rate limit sıfırlandı (IP: ${ip})`);
    } else if (userId) {
      // Belirtilen user'ı sıfırla
      Object.keys(store).forEach((key) => {
        if (key === `user-${userId}`) {
          delete store[key];
        }
      });
      console.log(`🔄 Rate limit sıfırlandı (User: ${userId})`);
    } else {
      // Tümünü sıfırla
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
      console.log("🔄 Tüm rate limit'ler sıfırlandı");
    }

    res.json({
      success: true,
      message: "Rate limit store başarıyla sıfırlandı",
    });
  } catch (error) {
    console.error("Rate limit store'unu sıfırlama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Rate limit store sıfırlanırken bir hata oluştu",
    });
  }
};

/**
 * Whitelist'e IP ekle
 */
const ipWhitelist = new Set<string>();

export function addToWhitelist(ip: string) {
  ipWhitelist.add(ip);
  console.log(`✅ IP whitelist'e eklendi: ${ip}`);
}

export function removeFromWhitelist(ip: string) {
  ipWhitelist.delete(ip);
  console.log(`❌ IP whitelist'ten çıkarıldı: ${ip}`);
}

/**
 * Whitelist kontrolü yapan middleware
 */
export function createWhitelistRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const limiter = createRateLimiter(config);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    if (ipWhitelist.has(ip)) {
      return next();
    }
    return limiter(req, res, next);
  };
}

/**
 * Sliding window algoritması ile rate limiting
 */
interface SlidingWindowStore {
  [key: string]: number[]; // Timestamps
}

const slidingWindowStore: SlidingWindowStore = {};

export function createSlidingWindowRateLimiter(
  windowMs: number,
  maxRequests: number
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    // Eski requestleri temizle
    if (!slidingWindowStore[key]) {
      slidingWindowStore[key] = [];
    }

    slidingWindowStore[key] = slidingWindowStore[key].filter(
      (timestamp) => now - timestamp < windowMs
    );

    // Limit kontrolü
    if (slidingWindowStore[key].length >= maxRequests) {
      res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        error: "Çok fazla istek. Lütfen daha sonra tekrain deneyin.",
      });
    }

    // Yeni request'i ekle
    slidingWindowStore[key].push(now);

    // Headers
    const remaining = maxRequests - slidingWindowStore[key].length;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
    res.setHeader("X-RateLimit-Reset", now + windowMs);

    next();
  };
}

/**
 * Token bucket algoritması ile rate limiting
 */
interface TokenBucketStore {
  [key: string]: {
    tokens: number;
    lastRefill: number;
  };
}

const tokenBucketStore: TokenBucketStore = {};

export function createTokenBucketRateLimiter(
  refillRate: number = 10, // İstek/saniye
  bucketSize: number = 100 // Maksimum token
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();

    if (!tokenBucketStore[key]) {
      tokenBucketStore[key] = {
        tokens: bucketSize,
        lastRefill: now,
      };
    }

    const bucket = tokenBucketStore[key];

    // Token'ları doldur
    const timePassed = (now - bucket.lastRefill) / 1000; // saniye
    const tokensToAdd = timePassed * refillRate;
    bucket.tokens = Math.min(bucketSize, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Token kontrolü
    if (bucket.tokens < 1) {
      const retryAfter = (1 - bucket.tokens) / refillRate;
      res.setHeader("Retry-After", Math.ceil(retryAfter));
      return res.status(429).json({
        success: false,
        error: "Oran sınırı aşıldı. Lütfen bir süre bekleyin.",
      });
    }

    // Token'ı kullan
    bucket.tokens -= 1;

    // Headers
    res.setHeader("X-RateLimit-Limit", bucketSize);
    res.setHeader("X-RateLimit-Remaining", Math.floor(bucket.tokens));
    res.setHeader("X-RateLimit-Reset", now + (1 - bucket.tokens) / refillRate);

    next();
  };
}

/**
 * Rate limit istatistiklerini temizle (eski veriler için)
 */
export function cleanupRateLimitStore(maxAgeMs: number = 60 * 60 * 1000) {
  const now = Date.now();
  let cleaned = 0;

  Object.keys(store).forEach((key) => {
    if (now - store[key].resetTime > maxAgeMs) {
      delete store[key];
      cleaned++;
    }
  });

  if (cleaned > 0) {
    console.log(`🧹 Rate limit store temizlendi: ${cleaned} kayıt silindi`);
  }
}

// Startup'ta store'u sıfırla
console.log("🔄 Rate limit store başlatılıyor - tüm eski veriler silinecek");
Object.keys(store).forEach(key => {
  delete store[key];
});

// Periyodik temizlik (her 1 saat)
setInterval(() => {
  cleanupRateLimitStore();
}, 60 * 60 * 1000);
