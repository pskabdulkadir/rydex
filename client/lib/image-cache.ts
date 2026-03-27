/**
 * Uydu Görüntüleri Önbelleği
 * Uydu görüntülerini (USGS, Copernicus, Esri, Sentinel vb.) telefonun depolamasında önbelleğe alır
 */

const CACHE_NAME = 'satellite-images-v1';
const CACHE_EXPIRY_DAYS = 30;

interface CachedImage {
  id: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  blobUrl: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Uydu görüntüsünü indir ve cache'le
 */
export async function cacheSatelliteImage(
  latitude: number,
  longitude: number,
  imageUrl: string
): Promise<CachedImage> {
  try {
    const cache = await caches.open(CACHE_NAME);

    // CORS sorunu yaşanabileceği için timeout ve hata yönetimi ekle
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

    let response: Response;
    try {
      response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'image/*' }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`Görüntü indirilemedi: ${response.status} ${response.statusText}`);
    }

    // Cache'e kaydet
    const cacheKey = `satellite-${latitude}-${longitude}-${Date.now()}`;
    await cache.put(cacheKey, response.clone());

    // Blob URL'si oluştur
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const cachedImage: CachedImage = {
      id: cacheKey,
      latitude,
      longitude,
      imageUrl,
      blobUrl,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    };

    return cachedImage;
  } catch (error) {
    console.error('Görüntü cache hatası:', error);
    throw error;
  }
}

/**
 * Cache'deki görüntüyü al
 */
export async function getCachedImage(
  latitude: number,
  longitude: number
): Promise<CachedImage | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    // En yakın konum için görüntü ara (çalışan sunuculardan)
    for (const request of keys) {
      const url = request.url;

      // Eski/çalışmayan USGS URL'lerini atla
      if (url.includes('basemap.nationalmap.gov')) {
        await cache.delete(request);
        continue;
      }

      if (url.includes(`satellite-${latitude}-${longitude}`)) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          return {
            id: request.url,
            latitude,
            longitude,
            imageUrl: request.url,
            blobUrl,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Cache alma hatası:', error);
    return null;
  }
}

/**
 * Tüm cache'i temizle
 */
export async function clearImageCache(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
  } catch (error) {
    console.error('Cache temizleme hatası:', error);
  }
}

/**
 * Cache boyutunu al (yaklaşık)
 */
export async function getImageCacheSize(): Promise<number> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    let totalSize = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Cache boyutu hatası:', error);
    return 0;
  }
}

/**
 * Eski cache'leri temizle
 */
export async function cleanupOldImages(): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const now = Date.now();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseTime = new Date(dateHeader).getTime();
          const age = now - responseTime;

          // 30 günden eski ise sil
          if (age > CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cleanup hatası:', error);
  }
}
