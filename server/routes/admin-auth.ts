import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

// Test admin hesabı (gerçek uygulamada database'den gelecek)
const ADMIN_ACCOUNTS = [
  {
    id: 'admin_001',
    name: 'Sistem Yöneticisi',
    email: 'psikologabdulkadirkan@gmail.com',
    passwordHash: 'Abdulkadir1983', // Gerçek uygulamada bcrypt ile hash'lenmiş olmalı
    role: 'admin' as const
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h'; // 24 saatlik token geçerliliği

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  success: boolean;
  token?: string;
  expiresAt?: number;
  adminId?: string;
  email?: string;
  name?: string;
  role?: string;
  message?: string;
}

/**
 * Admin Giriş Endpoint
 * POST /api/admin/login
 */
export const handleAdminLogin: RequestHandler = async (req, res) => {
  try {
    console.log(`[Admin Login] Request body:`, req.body);

    let { email, password } = req.body as AdminLoginRequest;

    // Trim whitespace
    if (email) email = email.trim();
    if (password) password = password.trim();

    console.log(`[Admin Login] Email: "${email}", Password: "${password}"`);

    // Validasyon
    if (!email || !password) {
      console.warn(`[Admin Login] Validasyon hatası: email veya password eksik`);
      console.warn(`[Admin Login] Email yok: ${!email}, Password yok: ${!password}`);
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gereklidir'
      } as AdminLoginResponse);
    }

    // Debug: Tüm admin hesaplarını listele
    console.log(`[Admin Login] Sistemde tanımlı admin hesapları:`, ADMIN_ACCOUNTS.map(a => ({ email: a.email, name: a.name })));

    // Admin hesabını bul
    const admin = ADMIN_ACCOUNTS.find(a => a.email === email);

    if (!admin) {
      console.warn(`[Admin Login] ❌ Admin bulunamadı: ${email}`);
      console.warn(`[Admin Login] Aranan email: "${email}", Tür: ${typeof email}`);
      return res.status(401).json({
        success: false,
        message: 'E-posta adresi veya şifre yanlış'
      } as AdminLoginResponse);
    }

    console.log(`[Admin Login] ✅ Admin bulundu: ${admin.name}`);
    console.log(`[Admin Login] Şifre kontrolü: gelen="${password}" (${password.length} char), stored="${admin.passwordHash}" (${admin.passwordHash.length} char)`);

    // Şifre kontrolü (gerçek uygulamada bcrypt.compare kullanılmalı)
    if (admin.passwordHash !== password) {
      console.warn(`[Admin Login] ❌ Şifre yanlış: ${email}`);
      console.warn(`[Admin Login] Gelen:     "${password}"`);
      console.warn(`[Admin Login] Stored:    "${admin.passwordHash}"`);
      console.warn(`[Admin Login] Eşit mi:   ${admin.passwordHash === password}`);
      return res.status(401).json({
        success: false,
        message: 'E-posta adresi veya şifre yanlış'
      } as AdminLoginResponse);
    }

    console.log(`[Admin Login] Şifre doğru, token oluşturuluyor...`);

    // JWT Token'ı oluştur
    const tokenPayload = {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY
    });

    // Token'ın expire zamanını hesapla
    const decoded = jwt.decode(token) as any;
    const expiresAt = (decoded.exp || 0) * 1000; // milliseconds

    console.log(`✅ Admin Giriş Başarılı: ${email}`);

    const response: AdminLoginResponse = {
      success: true,
      token,
      expiresAt,
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };

    return res.json(response);

  } catch (error) {
    console.error('❌ Admin login hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return res.status(500).json({
      success: false,
      message: 'Giriş işlemi başarısız oldu',
      details: errorMessage
    } as AdminLoginResponse);
  }
};

/**
 * JWT Token Doğrulama
 */
export function verifyAdminToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Admin Middleware - Token Doğrulama
 */
export const requireAdminAuth: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme token\'ı gereklidir'
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' prefix'ini kaldır
    const decoded = verifyAdminToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Request'e admin bilgisini ekle
    (req as any).admin = decoded;
    next();
  } catch (error) {
    console.error('Admin auth hatası:', error);
    return res.status(401).json({
      success: false,
      message: 'Kimlik doğrulama başarısız'
    });
  }
};

/**
 * Admin Verifikasyon Endpoint
 * GET /api/admin/verify
 */
export const handleAdminVerify: RequestHandler = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token gereklidir'
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAdminToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }

  return res.json({
    success: true,
    admin: decoded
  });
};

/**
 * Token Yenileme Endpoint
 * POST /api/admin/refresh-token
 */
export const handleTokenRefresh: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token gereklidir'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Admin hesabını bul
    const admin = ADMIN_ACCOUNTS.find(a => a.id === decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin hesabı bulunamadı'
      });
    }

    // Yeni token oluştur
    const newTokenPayload = {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      iat: Math.floor(Date.now() / 1000)
    };

    const newToken = jwt.sign(newTokenPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY
    });

    const newDecoded = jwt.decode(newToken) as any;
    const expiresAt = (newDecoded.exp || 0) * 1000;

    console.log(`🔄 Token Yenilendi: ${admin.email}`);

    return res.json({
      success: true,
      token: newToken,
      expiresAt,
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

  } catch (error) {
    console.error('Token refresh hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Token yenileme başarısız'
    });
  }
};
