/**
 * Admin Authentication Service
 * JWT tabanlı secure authentication ve token management
 */

interface AdminLoginData {
  email: string;
  password: string;
}

interface AdminAuthToken {
  token: string;
  expiresAt: number;
  adminId: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

const ADMIN_TOKEN_KEY = 'admin_auth_token';
const ADMIN_USER_KEY = 'admin_user_data';
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Token'ı expire olmadan 5 dakika önce refresh et
let tokenRefreshTimeout: NodeJS.Timeout | null = null;
let isRefreshing = false;

/**
 * Admin olarak giriş yap (API tabanlı)
 */
export async function loginAdmin(credentials: AdminLoginData): Promise<AdminAuthToken> {
  try {
    console.log(`[Client] Login credentials:`, { email: credentials.email, password: credentials.password });

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    console.log(`[Client] Response status:`, response.status, response.statusText);
    console.log(`[Client] Response data:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'Giriş başarısız');
    }

    // Token ve kullanıcı bilgilerini kaydet
    const authToken: AdminAuthToken = {
      token: data.token,
      expiresAt: data.expiresAt,
      adminId: data.adminId,
      email: data.email,
      name: data.name,
      role: data.role
    };

    saveAdminToken(authToken);
    return authToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Admin olarak giriş yap (Client-side, API'ye bağlı değil)
 * Production'da API çalışmadığında kullanılır
 */
export async function loginAdminLocal(password: string): Promise<AdminAuthToken> {
  // Hardcoded admin şifresi
  const ADMIN_PASSWORD = 'admin123';

  if (password.trim() !== ADMIN_PASSWORD) {
    throw new Error('Şifre yanlış');
  }

  // Token oluştur
  const authToken: AdminAuthToken = {
    token: `local_${Date.now()}`,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 saat geçerli
    adminId: 'admin_local',
    email: 'admin@local',
    name: 'Admin Yöneticisi',
    role: 'admin'
  };

  saveAdminToken(authToken);
  return authToken;
}

/**
 * Admin çıkış yap
 */
export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

/**
 * Token'ı localStorage'a kaydet
 */
export function saveAdminToken(token: AdminAuthToken): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, JSON.stringify(token));
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({
    adminId: token.adminId,
    email: token.email,
    name: token.name,
    role: token.role
  }));
}

/**
 * Kaydedilmiş token'ı al
 */
export function getAdminToken(): AdminAuthToken | null {
  const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!stored) return null;

  try {
    const token = JSON.parse(stored) as AdminAuthToken;
    
    // Token'ın süresi dolmuş mu kontrol et
    if (token.expiresAt < Date.now()) {
      logoutAdmin();
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

/**
 * Admin kullanıcı bilgisini al
 */
export function getAdminUser() {
  const stored = localStorage.getItem(ADMIN_USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Giriş yapılmış mı kontrol et
 */
export function isAdminLoggedIn(): boolean {
  const token = getAdminToken();
  return token !== null && token.expiresAt > Date.now();
}

/**
 * Authorization header'ı al
 */
export function getAuthorizationHeader(): { Authorization: string } | null {
  const token = getAdminToken();
  if (!token) return null;

  return {
    Authorization: `Bearer ${token.token}`
  };
}

/**
 * Token'ı yenile
 */
export async function refreshAdminToken(): Promise<AdminAuthToken | null> {
  // Zaten refresh işlemi devam ediyorsa bekle
  if (isRefreshing) {
    // Refresh işlemi bitene kadar bekle
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isRefreshing) {
          clearInterval(checkInterval);
          resolve(getAdminToken());
        }
      }, 100);
    });
  }

  try {
    isRefreshing = true;
    const currentToken = getAdminToken();

    if (!currentToken) {
      isRefreshing = false;
      return null;
    }

    const response = await fetch('/api/admin/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken.token}`
      }
    });

    if (!response.ok) {
      // Token refresh başarısız, logout yap
      if (response.status === 401) {
        logoutAdmin();
      }
      isRefreshing = false;
      return null;
    }

    const data = await response.json();

    if (data.success) {
      const newToken: AdminAuthToken = {
        token: data.token,
        expiresAt: data.expiresAt,
        adminId: data.adminId,
        email: data.email,
        name: data.name,
        role: data.role
      };

      saveAdminToken(newToken);
      scheduleTokenRefresh(); // Yeni token için refresh zamanlaması yap

      console.log('🔄 Token yenilendi');
      isRefreshing = false;
      return newToken;
    }

    isRefreshing = false;
    return null;
  } catch (error) {
    console.error('Token yenileme hatası:', error);
    isRefreshing = false;
    return null;
  }
}

/**
 * Token'ın refresh zamanlamasını yap
 */
export function scheduleTokenRefresh(): void {
  // Önceki timeout'u temizle
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  const token = getAdminToken();
  if (!token) return;

  const now = Date.now();
  const timeUntilExpiry = token.expiresAt - now;
  const refreshTime = Math.max(0, timeUntilExpiry - TOKEN_REFRESH_BUFFER);

  if (refreshTime > 0) {
    tokenRefreshTimeout = setTimeout(() => {
      refreshAdminToken();
    }, refreshTime);

    console.log(`⏰ Token refresh zamanlandı: ${Math.round(refreshTime / 1000)}s sonra`);
  }
}

/**
 * Token refresh zamanlamasını iptal et
 */
export function cancelTokenRefreshSchedule(): void {
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
    tokenRefreshTimeout = null;
  }
}

/**
 * Token'ın çok yakında expire olacağını kontrol et
 */
export function isTokenExpiringSoon(bufferMs: number = TOKEN_REFRESH_BUFFER): boolean {
  const token = getAdminToken();
  if (!token) return true;

  const timeUntilExpiry = token.expiresAt - Date.now();
  return timeUntilExpiry < bufferMs;
}
