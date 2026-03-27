/**
 * Veri Cache Yöneticisi (Gerçek Veri Depolama)
 * Online modunda gerçek API'lerden alınan verilerin cache'lenmesini yönetir
 * Offline modda: Fallback mesajları gösterilir
 */

export interface CacheDataStore {
  magnetometerData: any[];
  locationData: any[];
  cameraData: any[];
  [key: string]: any;
}

const REAL_DATA_CACHE_PREFIX = 'real_cache_data_';

/**
 * Gerçek verileri cache'le
 */
export function cacheRealData(key: string, data: any): void {
  try {
    const storageKey = `${REAL_DATA_CACHE_PREFIX}${key}`;
    localStorage.setItem(storageKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
    console.log(`💾 Gerçek veri cache'lendi: ${key}`);
  } catch (error) {
    console.warn(`Gerçek veri cache'lenemedi: ${key}`, error);
  }
}

/**
 * Cache'lenmiş gerçek verileri getir
 */
export function getCachedRealData<T = any>(key: string): T | null {
  try {
    const storageKey = `${REAL_DATA_CACHE_PREFIX}${key}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Cache 24 saat geçerliliği kontrol et
    const age = Date.now() - parsed.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 saat
    
    if (age > maxAge) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    return parsed.data as T;
  } catch (error) {
    console.warn(`Gerçek veri okunamadı: ${key}`, error);
    return null;
  }
}

/**
 * Veri kaynağı bilgisini al
 */
export function getDataSourceInfo(key: string): {
  hasCached: boolean;
  lastCachedUpdate: number | null;
  cacheAge: string;
} {
  try {
    const cachedKey = `${REAL_DATA_CACHE_PREFIX}${key}`;
    const cachedStored = localStorage.getItem(cachedKey);
    const cachedData = cachedStored ? JSON.parse(cachedStored) : null;
    
    if (!cachedData) {
      return {
        hasCached: false,
        lastCachedUpdate: null,
        cacheAge: 'Yok',
      };
    }
    
    const age = Date.now() - cachedData.timestamp;
    const hours = Math.floor(age / (60 * 60 * 1000));
    const minutes = Math.floor((age % (60 * 60 * 1000)) / (60 * 1000));
    const cacheAge = hours > 0 ? `${hours}s ${minutes}d` : `${minutes}d`;
    
    return {
      hasCached: true,
      lastCachedUpdate: cachedData.timestamp,
      cacheAge,
    };
  } catch (error) {
    console.warn(`Veri kaynağı bilgisi okunamadı: ${key}`, error);
    return {
      hasCached: false,
      lastCachedUpdate: null,
      cacheAge: 'Bilinmiyor',
    };
  }
}

/**
 * Cache'de mevcut olan tüm verileri kontrol et
 */
export function checkCachedDataAvailability(): {
  totalCachedData: number;
  availableKeys: string[];
  oldestCache: number | null;
} {
  const cachedKeys = new Set<string>();
  let oldestTimestamp: number | null = null;
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(REAL_DATA_CACHE_PREFIX)) {
        const dataKey = key.replace(REAL_DATA_CACHE_PREFIX, '');
        cachedKeys.add(dataKey);
        
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!oldestTimestamp || parsed.timestamp < oldestTimestamp) {
              oldestTimestamp = parsed.timestamp;
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
  } catch (error) {
    console.warn('Cache veri kontrolü başarısız:', error);
  }
  
  return {
    totalCachedData: cachedKeys.size,
    availableKeys: Array.from(cachedKeys),
    oldestCache: oldestTimestamp,
  };
}

/**
 * Eski cache'leri temizle (24 saattan eski)
 */
export function cleanupOldCache(): number {
  let cleanedCount = 0;
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 saat
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(REAL_DATA_CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            const age = now - parsed.timestamp;
            
            if (age > maxAge) {
              localStorage.removeItem(key);
              cleanedCount++;
              const dataKey = key.replace(REAL_DATA_CACHE_PREFIX, '');
              console.log(`🗑️ Eski cache temizlendi: ${dataKey}`);
            }
          }
        } catch (e) {
          // Ignore and continue
        }
      }
    });
  } catch (error) {
    console.warn('Cache temizleme başarısız:', error);
  }
  
  return cleanedCount;
}

/**
 * Belirli bir cache'i kaldır
 */
export function removeCachedData(key: string): void {
  try {
    const storageKey = `${REAL_DATA_CACHE_PREFIX}${key}`;
    localStorage.removeItem(storageKey);
    console.log(`🗑️ Cache kaldırıldı: ${key}`);
  } catch (error) {
    console.warn(`Cache kaldırılamadı: ${key}`, error);
  }
}

/**
 * Tüm cache'leri temizle
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    let count = 0;
    keys.forEach(key => {
      if (key.startsWith(REAL_DATA_CACHE_PREFIX)) {
        localStorage.removeItem(key);
        count++;
      }
    });
    console.log(`✨ Toplam ${count} cache temizlendi`);
  } catch (error) {
    console.warn('Tüm cache temizleme başarısız:', error);
  }
}

// Geriye dönük uyumluluk ve hook uyumluluğu için alias'lar
export const checkOfflineDataAvailability = checkCachedDataAvailability;
export const clearAllMockData = clearAllCache;
