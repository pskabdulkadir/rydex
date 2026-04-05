import { RequestHandler } from "express";
import crypto from "crypto";

/**
 * GÖREV 10: Two-Factor Authentication (2FA)
 * - TOTP (Google Authenticator)
 * - SMS OTP
 * - Email OTP
 * - Backup codes
 */

// Bellek içi 2FA depolama (production'da veritabanı kullanılmalı)
const twoFactorStore = new Map<string, TwoFactorRecord>();
const otpStore = new Map<string, OTPRecord>();
const backupCodesStore = new Map<string, string[]>();

interface TwoFactorRecord {
  userId: string;
  method: "totp" | "sms" | "email";
  enabled: boolean;
  secret?: string;
  phoneNumber?: string;
  email?: string;
  createdAt: number;
  lastUsed?: number;
}

interface OTPRecord {
  userId: string;
  code: string;
  method: "sms" | "email";
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

/**
 * 6 haneli rastgele OTP kodu oluştur
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * TOTP Secret oluştur (Google Authenticator uyumlu)
 */
function generateTOTPSecret(): string {
  return crypto.randomBytes(32).toString("base64");
}

/**
 * TOTP token'ını doğrula
 */
function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  // Basit TOTP doğrulaması (production'da speakeasy gibi kütüphane kullanılmalı)
  const now = Math.floor(Date.now() / 30000);
  const entered = parseInt(token, 10);

  // ±window kadar tolerance
  for (let i = -window; i <= window; i++) {
    const expectedToken = generateTOTPToken(secret, now + i);
    if (expectedToken === entered) {
      return true;
    }
  }

  return false;
}

/**
 * Belirli bir zaman için TOTP token'ını hesapla
 */
function generateTOTPToken(secret: string, time: number): number {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(time), 0);
  
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "base64"));
  hmac.update(buffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const code = (hash[offset] & 0x7f) << 24 |
    (hash[offset + 1] & 0xff) << 16 |
    (hash[offset + 2] & 0xff) << 8 |
    (hash[offset + 3] & 0xff);
  
  return code % 1000000;
}

/**
 * Backup codes oluştur
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Format: XXXX-XXXX
    const code = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join("-") || "";
    codes.push(code);
  }
  return codes;
}

/**
 * 2FA'yı etkinleştir
 */
export const handleEnable2FA: RequestHandler = async (req, res) => {
  try {
    const { userId, method } = req.body as {
      userId: string;
      method: "totp" | "sms" | "email";
    };

    if (!userId || !method) {
      return res.status(400).json({
        success: false,
        error: "User ID ve method gerekli",
      });
    }

    if (!["totp", "sms", "email"].includes(method)) {
      return res.status(400).json({
        success: false,
        error: "Geçersiz 2FA methodu",
      });
    }

    const record: TwoFactorRecord = {
      userId,
      method,
      enabled: false, // Doğrulama öncesi
      createdAt: Date.now(),
    };

    if (method === "totp") {
      record.secret = generateTOTPSecret();
    }

    twoFactorStore.set(`${userId}:${method}`, record);

    // Backup codes oluştur
    const backupCodes = generateBackupCodes(10);
    backupCodesStore.set(userId, backupCodes);

    res.json({
      success: true,
      method,
      secret: method === "totp" ? record.secret : undefined,
      backupCodes: backupCodes.map((code, i) =>
        i < 3 ? code : "****-****" // İlk 3'ünü göster
      ),
      message: "2FA aktive etme başladı. Lütfen doğrulayın.",
    });

    console.log(`🔐 2FA etkinleştirme başlatıldı (${userId}): ${method}`);
  } catch (error) {
    console.error("2FA etkinleştirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "2FA etkinleştirme sırasında hata oluştu",
    });
  }
};

/**
 * 2FA'yı doğrula (etkinleştir)
 */
export const handleVerify2FA: RequestHandler = async (req, res) => {
  try {
    const { userId, method, code, phoneNumber, email } = req.body as {
      userId: string;
      method: "totp" | "sms" | "email";
      code: string;
      phoneNumber?: string;
      email?: string;
    };

    if (!userId || !method || !code) {
      return res.status(400).json({
        success: false,
        error: "User ID, method ve doğrulama kodu gerekli",
      });
    }

    const record = twoFactorStore.get(`${userId}:${method}`);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: "2FA kaydı bulunamadı",
      });
    }

    let isValid = false;

    if (method === "totp") {
      isValid = verifyTOTP(record.secret || "", code);
    } else if (method === "sms" || method === "email") {
      const otpRecord = otpStore.get(`${userId}:${method}`);

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          error: "OTP kodu geçersiz veya süresi dolmuş",
        });
      }

      if (otpRecord.expiresAt < Date.now()) {
        otpStore.delete(`${userId}:${method}`);
        return res.status(400).json({
          success: false,
          error: "OTP kodunun süresi dolmuş",
        });
      }

      isValid = otpRecord.code === code;

      if (!isValid) {
        otpRecord.attempts++;
        if (otpRecord.attempts >= otpRecord.maxAttempts) {
          otpStore.delete(`${userId}:${method}`);
          return res.status(400).json({
            success: false,
            error: "Çok fazla başarısız deneme. Lütfen yeniden başlayın.",
          });
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Doğrulama kodu geçersiz",
      });
    }

    // 2FA'yı aktive et
    record.enabled = true;
    if (phoneNumber) record.phoneNumber = phoneNumber;
    if (email) record.email = email;
    record.lastUsed = Date.now();

    twoFactorStore.set(`${userId}:${method}`, record);
    otpStore.delete(`${userId}:${method}`);

    const backupCodes = backupCodesStore.get(userId) || [];

    res.json({
      success: true,
      message: "2FA başarıyla etkinleştirildi",
      method,
      enabled: true,
      backupCodes: backupCodes,
    });

    console.log(`✅ 2FA etkinleştirildi (${userId}): ${method}`);
  } catch (error) {
    console.error("2FA doğrulama hatası:", error);
    res.status(500).json({
      success: false,
      error: "2FA doğrulama sırasında hata oluştu",
    });
  }
};

/**
 * 2FA'yı devre dışı bırak
 */
export const handleDisable2FA: RequestHandler = async (req, res) => {
  try {
    const { userId, method } = req.body as {
      userId: string;
      method: "totp" | "sms" | "email";
    };

    if (!userId || !method) {
      return res.status(400).json({
        success: false,
        error: "User ID ve method gerekli",
      });
    }

    twoFactorStore.delete(`${userId}:${method}`);
    otpStore.delete(`${userId}:${method}`);
    backupCodesStore.delete(userId);

    res.json({
      success: true,
      message: "2FA devre dışı bırakıldı",
    });

    console.log(`❌ 2FA devre dışı bırakıldı (${userId}): ${method}`);
  } catch (error) {
    console.error("2FA devre dışı bırakma hatası:", error);
    res.status(500).json({
      success: false,
      error: "2FA devre dışı bırakma sırasında hata oluştu",
    });
  }
};

/**
 * OTP kodu gönder (SMS/Email)
 */
export const handleSendOTP: RequestHandler = async (req, res) => {
  try {
    const { userId, method, phoneNumber, email } = req.body as {
      userId: string;
      method: "sms" | "email";
      phoneNumber?: string;
      email?: string;
    };

    if (!userId || !method) {
      return res.status(400).json({
        success: false,
        error: "User ID ve method gerekli",
      });
    }

    if (method === "sms" && !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "SMS yöntemi için telefon numarası gerekli",
      });
    }

    if (method === "email" && !email) {
      return res.status(400).json({
        success: false,
        error: "Email yöntemi için email adresi gerekli",
      });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 dakika geçerli

    const otpRecord: OTPRecord = {
      userId,
      code: otp,
      method,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
    };

    otpStore.set(`${userId}:${method}`, otpRecord);

    // Gerçek uygulamada SMS/Email gönderilir
    console.log(
      `📱 OTP kodu oluşturuldu (${userId}): ${otp} (${method})`
    );

    res.json({
      success: true,
      message: `OTP kodu ${method === "sms" ? "kısa mesajla" : "email ile"} gönderildi`,
      method,
      // Demo: OTP'yi göster (production'da gösterilmez)
      otp: otp,
      expiresIn: 600, // saniye
    });
  } catch (error) {
    console.error("OTP gönderme hatası:", error);
    res.status(500).json({
      success: false,
      error: "OTP gönderme sırasında hata oluştu",
    });
  }
};

/**
 * OTP doğrula
 */
export const handleVerifyOTP: RequestHandler = async (req, res) => {
  try {
    const { userId, method, code } = req.body as {
      userId: string;
      method: "sms" | "email";
      code: string;
    };

    if (!userId || !method || !code) {
      return res.status(400).json({
        success: false,
        error: "Tüm alanlar gerekli",
      });
    }

    const otpRecord = otpStore.get(`${userId}:${method}`);

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: "OTP kodu geçersiz veya süresi dolmuş",
      });
    }

    if (otpRecord.expiresAt < Date.now()) {
      otpStore.delete(`${userId}:${method}`);
      return res.status(400).json({
        success: false,
        error: "OTP kodunun süresi dolmuş",
      });
    }

    if (otpRecord.code !== code) {
      otpRecord.attempts++;

      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        otpStore.delete(`${userId}:${method}`);
        return res.status(400).json({
          success: false,
          error: "Çok fazla başarısız deneme. Yeni kod isteyin.",
        });
      }

      return res.status(400).json({
        success: false,
        error: "Doğrulama kodu geçersiz",
        attemptsRemaining: otpRecord.maxAttempts - otpRecord.attempts,
      });
    }

    otpStore.delete(`${userId}:${method}`);

    res.json({
      success: true,
      message: "OTP başarıyla doğrulandı",
      verified: true,
    });

    console.log(`✅ OTP doğrulandı (${userId}): ${method}`);
  } catch (error) {
    console.error("OTP doğrulama hatası:", error);
    res.status(500).json({
      success: false,
      error: "OTP doğrulama sırasında hata oluştu",
    });
  }
};

/**
 * 2FA durumunu kontrol et
 */
export const handleGet2FAStatus: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query as { userId: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID gerekli",
      });
    }

    const methods = ["totp", "sms", "email"];
    const status: Record<string, { enabled: boolean; lastUsed?: number }> = {};

    methods.forEach((method) => {
      const record = twoFactorStore.get(`${userId}:${method}`);
      status[method] = {
        enabled: record?.enabled || false,
        lastUsed: record?.lastUsed,
      };
    });

    res.json({
      success: true,
      userId,
      twoFactorStatus: status,
      hasBackupCodes: backupCodesStore.has(userId),
    });
  } catch (error) {
    console.error("2FA durumu kontrol hatası:", error);
    res.status(500).json({
      success: false,
      error: "2FA durumu kontrol sırasında hata oluştu",
    });
  }
};

/**
 * Backup codes'ı regenerate et
 */
export const handleRegenerateBackupCodes: RequestHandler = async (
  req,
  res
) => {
  try {
    const { userId } = req.body as { userId: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID gerekli",
      });
    }

    const newBackupCodes = generateBackupCodes(10);
    backupCodesStore.set(userId, newBackupCodes);

    res.json({
      success: true,
      message: "Yedek kodları yenilendi",
      backupCodes: newBackupCodes,
    });

    console.log(`🔄 Yedek kodları yenilendi (${userId})`);
  } catch (error) {
    console.error("Yedek kodları yenileme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Yedek kodları yenileme sırasında hata oluştu",
    });
  }
};
