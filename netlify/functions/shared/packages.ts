/**
 * GEOSCAN-X Premium SAAS Platform
 * Paket Tanımlamaları ve Fiyatlandırma Motoru
 */

export type PackageType = 'starter' | 'pro' | 'deep' | 'ultimate' | 'monthly' | 'master';

export interface Package {
  id: PackageType;
  name: string;
  duration: string;
  durationMs: number; // Milisaniye cinsinden
  price: number; // TL cinsinden
  features: string[];
  technicalAccess: string;
  isLifetime: boolean;
  isCorporate: boolean;
  requiresEscrow: boolean;
}

/**
 * Hard-coded paket tanımlamaları
 * Sistem bu paketler üzerinden biliniyor ve satış yapıyor
 */
export const PACKAGES: Record<PackageType, Package> = {
  starter: {
    id: 'starter',
    name: 'Starter Scan',
    duration: '1 Saat',
    durationMs: 1 * 60 * 60 * 1000, // 1 saat
    price: 2000,
    features: [
      '3D Temel Analiz',
      'Harita Görüntüleme',
      'Marker Yerleştirme',
      'Temel Raporlama'
    ],
    technicalAccess: 'Temel 3D Analiz',
    isLifetime: false,
    isCorporate: false,
    requiresEscrow: false
  },
  
  pro: {
    id: 'pro',
    name: 'Pro Explorer',
    duration: '3 Saat',
    durationMs: 3 * 60 * 60 * 1000, // 3 saat
    price: 6000,
    features: [
      'Starter\' deki tüm özellikler',
      '3D Analiz + Metal Ayrımı',
      'Katman Analizi',
      'Gelişmiş Raporlama',
      'Veri Dışa Aktarma'
    ],
    technicalAccess: '3D + Metal Ayrımı',
    isLifetime: false,
    isCorporate: false,
    requiresEscrow: false
  },
  
  deep: {
    id: 'deep',
    name: 'Deep Analyser',
    duration: '12 Saat',
    durationMs: 12 * 60 * 60 * 1000, // 12 saat
    price: 15000,
    features: [
      'Pro\' deki tüm özellikler',
      'GPR (Yer Radarı) Analizi',
      'Çok Katmanlı Analiz',
      'İleri Veri Analitikleri',
      'API Erişimi (Sınırlı)'
    ],
    technicalAccess: 'GPR + Katman Analizi',
    isLifetime: false,
    isCorporate: false,
    requiresEscrow: false
  },
  
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate Access',
    duration: '24 Saat',
    durationMs: 24 * 60 * 60 * 1000, // 24 saat
    price: 30000,
    features: [
      'Deep\' deki tüm özellikler',
      'Sınırsız Tüm Özellikler',
      'Tam API Erişimi',
      'Gerçek Zamanlı Sensör Verisi',
      'Özel Destek (24 saat)'
    ],
    technicalAccess: 'Sınırsız Tüm Özellikler',
    isLifetime: false,
    isCorporate: false,
    requiresEscrow: false
  },
  
  monthly: {
    id: 'monthly',
    name: 'Monthly Corp',
    duration: '30 Gün',
    durationMs: 30 * 24 * 60 * 60 * 1000, // 30 gün
    price: 100000,
    features: [
      'Tüm Ultimate özellikler',
      'Kurumsal Raporlama',
      'Ekip Yönetimi (5 Kullanıcı)',
      'Bulut Depolama (100GB)',
      'API v2 Erişimi',
      'Teknik Destek + Eğitim'
    ],
    technicalAccess: 'Kurumsal Raporlama + API',
    isLifetime: false,
    isCorporate: true,
    requiresEscrow: false
  },
  
  master: {
    id: 'master',
    name: 'Master License',
    duration: 'Ömer Boyu',
    durationMs: Number.MAX_SAFE_INTEGER, // Sınırsız (ömür boyu)
    price: 3000000,
    features: [
      'Tüm Monthly özellikleri',
      'Tam Kaynak Kod Erişimi',
      'Ticari Haklar',
      'White-Label Hakkı',
      'Özel Geliştirme Desteği',
      'İletime Dahil Güncelleme ve Destek'
    ],
    technicalAccess: 'Kaynak Kod + Ticari Haklar',
    isLifetime: true,
    isCorporate: true,
    requiresEscrow: true // Master License için Escrow süreci gerekli
  }
};

/**
 * Paket fiyatını doğrula
 * Webhook gelen tutar ile DB tutar eşleşmesi için
 */
export function validatePackagePrice(packageId: PackageType, amount: number): boolean {
  const pkg = PACKAGES[packageId];
  if (!pkg) return false;
  return pkg.price === amount;
}

/**
 * Paket bilgisi getir
 */
export function getPackage(packageId: PackageType): Package | null {
  return PACKAGES[packageId] || null;
}

/**
 * Expiry timestamp oluştur
 * Ödeme zamanı + paket süresi = exp
 */
export function calculateExpiryTimestamp(packageId: PackageType, paymentTimeMs: number = Date.now()): number {
  const pkg = PACKAGES[packageId];
  if (!pkg) throw new Error(`Paket bulunamadı: ${packageId}`);
  
  // Ömür boyu paketler için çok ileri bir tarih (2099)
  if (pkg.isLifetime) {
    return new Date('2099-12-31').getTime();
  }
  
  return paymentTimeMs + pkg.durationMs;
}

/**
 * Paket listesini kategoriye göre getir
 */
export function getPackagesByCategory(category: 'basic' | 'pro' | 'corporate' | 'all' = 'all'): Package[] {
  const packages = Object.values(PACKAGES);
  
  switch (category) {
    case 'basic':
      return packages.filter(p => !p.isCorporate && p.price <= 30000);
    case 'pro':
      return packages.filter(p => !p.isCorporate && p.price > 30000);
    case 'corporate':
      return packages.filter(p => p.isCorporate);
    case 'all':
    default:
      return packages;
  }
}
