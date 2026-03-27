/**
 * Web-to-App Bridge
 * 
 * GEOSCAN-X Web platformundan uygulamaya (radar yazılımı) geçiş sağlar.
 * Session token aracılığıyla güvenli bağlantı kurar.
 */

export interface SessionToken {
  userId: string;
  packageId: string;
  accessLevel: number;
  expiryTimestamp: number;
  iat: number; // Issued at
  exp: number; // Expiration
}

export interface WebToAppBridgeConfig {
  appDeepLink: string; // 'geoscan-x://launch' gibi
  fallbackUrl: string; // Web app URL (eğer uygulama yüklü değilse)
  tokenParamName: string; // URL parametresi adı
  sessionDuration: number; // Token geçerlilik süresi (ms)
}

/**
 * Varsayılan konfigürasyon
 */
const DEFAULT_CONFIG: WebToAppBridgeConfig = {
  appDeepLink: 'geoscan-x://launch',
  fallbackUrl: window.location.origin + '/landing',
  tokenParamName: 'session_token',
  sessionDuration: 3600000 // 1 saat
};

/**
 * Web-to-App Bridge Manager
 */
export class WebToAppBridge {
  private config: WebToAppBridgeConfig;

  constructor(config?: Partial<WebToAppBridgeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Session token oluştur
   * Ödeme sisteminden çağrılır
   */
  createSessionToken(
    userId: string,
    packageId: string,
    accessLevel: number,
    expiryTimestamp: number
  ): string {
    const now = Date.now();
    const token: SessionToken = {
      userId,
      packageId,
      accessLevel,
      expiryTimestamp,
      iat: now,
      exp: now + this.config.sessionDuration
    };

    // Base64 encode (Production'da JWT kullan)
    const encoded = btoa(JSON.stringify(token));
    console.log(`✅ Session token oluşturuldu: ${userId} - ${packageId}`);
    return encoded;
  }

  /**
   * Session token'ı doğrula
   */
  verifySessionToken(token: string): SessionToken | null {
    try {
      const decoded = JSON.parse(atob(token));

      // Geçerlilik kontroller
      if (decoded.exp < Date.now()) {
        console.warn('⚠ Session token süresi dolmuş');
        return null;
      }

      if (!decoded.userId || !decoded.packageId || decoded.accessLevel === undefined) {
        console.warn('⚠ Eksik token bilgisi');
        return null;
      }

      return decoded as SessionToken;
    } catch (error) {
      console.error('Session token doğrulama hatası:', error);
      return null;
    }
  }

  /**
   * Uygulamaya başlat - Deep link oluştur
   */
  launchApp(sessionToken: string): void {
    const appUrl = `${this.config.appDeepLink}?${this.config.tokenParamName}=${encodeURIComponent(sessionToken)}`;

    // Delayed fallback (uygulamanın açılmadığı durumda)
    const timeout = setTimeout(() => {
      console.warn('⚠ Uygulama açılamadı, fallback URL\'ye yönlendiriliyor');
      window.location.href = this.config.fallbackUrl;
    }, 2000);

    // Deep link'i açmayı dene
    try {
      // Mobile cihazlarda
      if (/mobile|android|ios|iphone/i.test(navigator.userAgent)) {
        window.location.href = appUrl;
      } else {
        // Desktop'ta (development)
        window.open(appUrl, '_blank');
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error('Uygulama başlatma hatası:', error);
      clearTimeout(timeout);
      window.location.href = this.config.fallbackUrl;
    }
  }

  /**
   * URL parametresinden token al
   */
  getTokenFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(this.config.tokenParamName);
  }

  /**
   * Token'ı localStorage'a kaydet
   */
  saveTokenLocally(token: string): void {
    localStorage.setItem('sessionToken', token);
    console.log('✓ Token localStorage\'a kaydedildi');
  }

  /**
   * localStorage'dan token al
   */
  getTokenFromStorage(): string | null {
    return localStorage.getItem('sessionToken');
  }

  /**
   * Token'ı sil (logout)
   */
  clearToken(): void {
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('sessionToken');
    console.log('✓ Token temizlendi');
  }

  /**
   * Manyetometre sensörlerini aktif et
   * Token doğrulandıktan sonra çağrılır
   * 
   * NOT: Bu fonksiyon uygulamada çalışacak
   * Web platformunda bu olmayacak
   */
  async activateSensors(token: SessionToken): Promise<boolean> {
    try {
      console.log('🔌 Sensörler aktive ediliyor...');

      // TODO: Native plugin'den çağır (React Native veya Capacitor)
      // const result = await Magnetometer.startTracking({
      //   frequency: 100,
      //   accessLevel: token.accessLevel
      // });

      console.log(`✅ Sensörler aktif: Access Level ${token.accessLevel}`);
      return true;
    } catch (error) {
      console.error('Sensör aktivasyon hatası:', error);
      return false;
    }
  }

  /**
   * Bridge bilgilerini logla
   */
  logBridgeInfo(): void {
    console.group('🌉 Web-to-App Bridge Bilgisi');
    console.log('Deep Link:', this.config.appDeepLink);
    console.log('Fallback URL:', this.config.fallbackUrl);
    console.log('Token Parametresi:', this.config.tokenParamName);
    console.log('Session Süresi:', `${this.config.sessionDuration / 1000 / 60} dakika`);
    console.groupEnd();
  }
}

/**
 * Global bridge instance
 */
let bridgeInstance: WebToAppBridge | null = null;

/**
 * Bridge instance al
 */
export function getBridge(config?: Partial<WebToAppBridgeConfig>): WebToAppBridge {
  if (!bridgeInstance) {
    bridgeInstance = new WebToAppBridge(config);
  }
  return bridgeInstance;
}

/**
 * Ödeme sonrası uygulamayı başlat
 * Checkout'tan çağrılacak
 */
export function launchAppAfterPayment(
  userId: string,
  packageId: string,
  accessLevel: number,
  expiryTimestamp: number
): void {
  const bridge = getBridge();

  // Token oluştur
  const token = bridge.createSessionToken(userId, packageId, accessLevel, expiryTimestamp);

  // localStorage'a kaydet
  bridge.saveTokenLocally(token);

  // AccessControl nesnesini da localStorage'a kaydet (Smart Lock hook tarafından kullanılacak)
  const { LEVEL_FEATURES, PACKAGE_TO_LEVEL } = require('@shared/types/access-control');
  const accessControl = {
    userId,
    packageId,
    accessLevel,
    isActive: true,
    expiryTimestamp,
    purchaseTimestamp: Date.now(),
    features: LEVEL_FEATURES[accessLevel] || LEVEL_FEATURES[0],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  localStorage.setItem('access_control', JSON.stringify(accessControl));
  localStorage.setItem('userId', userId);
  console.log(`✅ Access Control kaydedildi - Süresi: ${new Date(expiryTimestamp).toLocaleString('tr-TR')}`);

  // Uygulamayı başlat
  console.log('🚀 Uygulamayı başlatıyor...');
  bridge.launchApp(token);
}

/**
 * Uygulama başlangıcında token'ı doğrula
 * (Uygulamada kullanılacak)
 */
export function verifyAppLaunchToken(): SessionToken | null {
  const bridge = getBridge();

  // Önce URL'den al
  let token = bridge.getTokenFromUrl();

  // Yoksa localStorage'dan al
  if (!token) {
    token = bridge.getTokenFromStorage();
  }

  if (!token) {
    console.warn('⚠ Session token bulunamadı');
    return null;
  }

  // Token'ı doğrula
  const verified = bridge.verifySessionToken(token);

  if (verified) {
    console.log('✅ Token doğrulandı, sensörler aktive edilebilir');
    // localStorage'a kaydet (kalıcı tutmak için)
    bridge.saveTokenLocally(token);
  } else {
    console.error('❌ Token geçersiz');
    bridge.clearToken();
  }

  return verified;
}
