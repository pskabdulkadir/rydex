import { useState, useEffect, useCallback } from 'react';

export interface LicenseData {
  key: string;
  activatedAt: number; // Timestamp
  expiresAt: number; // Timestamp
  isValid: boolean;
  daysRemaining: number;
}

// Geçerli lisans anahtarları (backend'de olması ideal ama şimdilik burada)
const VALID_LICENSE_KEYS = ['SULTAN-2024-KEY'];

// Lisans localStorage key'i
const LICENSE_STORAGE_KEY = 'system_license_data';

/**
 * Lisans anahtarını doğrula
 */
export function validateLicenseKey(key: string): boolean {
  return VALID_LICENSE_KEYS.includes(key.trim().toUpperCase());
}

/**
 * Lisans verisi oluştur
 */
export function createLicenseData(key: string): LicenseData {
  const now = Date.now();
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000; // 12 ay
  
  return {
    key: key.trim().toUpperCase(),
    activatedAt: now,
    expiresAt: now + oneYearInMs,
    isValid: true,
    daysRemaining: 365,
  };
}

/**
 * Lisans verisini localStorage'a kaydet
 */
export function saveLicenseData(licenseData: LicenseData): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
    console.log('📜 Lisans kaydedildi:', {
      key: licenseData.key,
      expiresAt: new Date(licenseData.expiresAt).toLocaleDateString('tr-TR'),
    });
  } catch (error) {
    console.error('Lisans kaydedilemedi:', error);
  }
}

/**
 * localStorage'dan lisans verisini getir
 */
export function getLicenseDataFromStorage(): LicenseData | null {
  try {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Lisans okunamadı:', error);
    return null;
  }
}

/**
 * Lisans geçerlilik süresini hesapla
 */
export function calculateLicenseValidity(licenseData: LicenseData): {
  isValid: boolean;
  daysRemaining: number;
  isExpiringSoon: boolean; // 30 gün kala
  isExpired: boolean;
} {
  const now = Date.now();
  const timeRemaining = licenseData.expiresAt - now;
  const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
  
  return {
    isValid: timeRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    isExpiringSoon: daysRemaining > 0 && daysRemaining <= 30,
    isExpired: timeRemaining <= 0,
  };
}

/**
 * Lisans kontrolü yap
 */
export function checkLicense(): {
  hasValidLicense: boolean;
  daysRemaining: number;
  isExpiring: boolean;
  licenseData: LicenseData | null;
} {
  const licenseData = getLicenseDataFromStorage();
  
  if (!licenseData) {
    return {
      hasValidLicense: false,
      daysRemaining: 0,
      isExpiring: false,
      licenseData: null,
    };
  }
  
  const validity = calculateLicenseValidity(licenseData);
  
  return {
    hasValidLicense: validity.isValid,
    daysRemaining: validity.daysRemaining,
    isExpiring: validity.isExpiringSoon,
    licenseData,
  };
}

/**
 * Lisansı sil (test amaçlı)
 */
export function removeLicense(): void {
  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    console.log('🗑️ Lisans kaldırıldı');
  } catch (error) {
    console.error('Lisans kaldırılamadı:', error);
  }
}

/**
 * Lisans yönetim hook'u
 */
export function useLicense() {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Başlangıçta lisans kontrol et
  useEffect(() => {
    const license = getLicenseDataFromStorage();
    setLicenseData(license);
    
    if (license) {
      const validity = calculateLicenseValidity(license);
      setIsValid(validity.isValid);
      setDaysRemaining(validity.daysRemaining);
      setIsExpiringSoon(validity.isExpiringSoon);
    }
    
    setIsLoading(false);
  }, []);

  // Her saniye lisans geçerlilik süresini kontrol et (görsel güncelleme için)
  useEffect(() => {
    if (!licenseData) return;
    
    const interval = setInterval(() => {
      const validity = calculateLicenseValidity(licenseData);
      setIsValid(validity.isValid);
      setDaysRemaining(validity.daysRemaining);
      setIsExpiringSoon(validity.isExpiringSoon);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [licenseData]);

  // Lisans anahtarını aktiflestir
  const activateLicense = useCallback((key: string) => {
    if (!validateLicenseKey(key)) {
      return {
        success: false,
        message: '❌ Geçersiz lisans anahtarı!',
      };
    }

    const newLicense = createLicenseData(key);
    saveLicenseData(newLicense);
    
    setLicenseData(newLicense);
    setIsValid(true);
    setDaysRemaining(365);
    setIsExpiringSoon(false);

    return {
      success: true,
      message: '✅ Lisans başarıyla aktif edildi!',
      licenseData: newLicense,
    };
  }, []);

  return {
    licenseData,
    isValid,
    daysRemaining,
    isExpiringSoon,
    isLoading,
    activateLicense,
  };
}
