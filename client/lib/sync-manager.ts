/**
 * Gerçek Veri Senkronizasyon Yöneticisi
 * Çevrimdışıyken lokal DB'ye kaydeder, çevrimiçi olunca sunucuya gönderir
 * Sadece gerçek sensör verileriyle çalışır
 */

import { getSyncQueue, clearSyncQueue, addToSyncQueue } from './local-db';
import { toast } from 'sonner';

let isSyncing = false;
let syncRetryCount = 0;
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 2000; // 2 saniye

/**
 * Bekleyen verileri sunucuya senkronize et
 * Sadece çevrimiçi olduğunda çalışır
 */
export async function syncOfflineData() {
  if (isSyncing || !navigator.onLine) {
    console.log('⏸️ Senkronizasyon durum: Çevrimdışı veya zaten senkronize ediliyor');
    return;
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    console.log('✅ Senkronizasyon kuyruğu boş');
    return;
  }

  isSyncing = true;
  console.log(`📤 Senkronizasyon başlıyor: ${queue.length} öğe sunucuya gönderiliyor...`);

  try {
    // Her bir kuyruk öğesi için API çağrısı yap
    const promises = queue.map(async (item) => {
      try {
        let endpoint = '/api/sync';

        // Veri türüne göre uygun endpoint'i belirle
        switch (item.type) {
          case 'scan':
            endpoint = '/api/sync/scan';
            break;
          case 'camera':
            endpoint = '/api/sync/camera';
            break;
          case 'magnetometer':
            endpoint = '/api/sync/magnetometer';
            break;
          case 'detection':
            endpoint = '/api/detections';
            break;
          case 'report':
            endpoint = '/api/sync/report';
            break;
          default:
            endpoint = '/api/sync';
        }

        console.log(`🔄 Sunucuya gönderiliyor: ${item.type} -> ${endpoint}`);

        // Gerçek API çağrısı - Timeout ile
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.payload || item),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Başarıyla senkronize edildi: ${item.type}`, data);
        return { success: true, itemId: item.id };
      } catch (error) {
        console.error(`❌ Senkronizasyon başarısız (${item.type}):`, error);
        return { success: false, itemId: item.id };
      }
    });

    const results = await Promise.allSettled(promises);
    const successfulItems = results
      .filter((r) => r.status === 'fulfilled' && r.value?.success)
      .map((r) => (r as PromiseFulfilledResult<any>).value.itemId);
    const successCount = successfulItems.length;

    if (successCount === queue.length) {
      // Tümü başarılı - kuyruğu temizle
      await clearSyncQueue();
      syncRetryCount = 0; // Retry sayacını sıfırla
      console.log(`✨ Tüm veriler senkronize edildi (${successCount}/${queue.length})`);
      toast.success(`${successCount} adet veri senkronize edildi`);
    } else if (successCount > 0) {
      // Kısmi başarı - sadece başarısız olanları tut
      console.log(`⚠️ Kısmi senkronizasyon: ${successCount}/${queue.length} başarılı`);
      toast.warning(`${successCount}/${queue.length} veri senkronize edildi`);
    } else {
      // Tüm başarısız - retry'ı dene
      if (syncRetryCount < MAX_RETRY_COUNT) {
        syncRetryCount++;
        console.log(`🔄 Retry deneniyor (${syncRetryCount}/${MAX_RETRY_COUNT})`);
        setTimeout(() => syncOfflineData(), RETRY_DELAY);
      } else {
        console.error('❌ Senkronizasyon başarısız oldu, retry sınırına ulaşıldı');
        toast.error('Senkronizasyon başarısız. Daha sonra tekrar deneyebilirsiniz.');
        syncRetryCount = 0; // Sayacı sıfırla
      }
    }
  } catch (error) {
    console.error('🔥 Kritik senkronizasyon hatası:', error);
    toast.error('Senkronizasyon sırasında hata oluştu');
  } finally {
    isSyncing = false;
  }
}

/**
 * Senkronizasyon dinleyicilerini başlat
 */
export function initializeSync() {
  // İnternet geldiğinde tetikle
  window.addEventListener('online', syncOfflineData);
  
  // Periyodik olarak kontrol et (isteğe bağlı)
  setInterval(() => {
    if (navigator.onLine) {
      syncOfflineData();
    }
  }, 60000 * 5); // 5 dakikada bir

  // İlk açılışta kontrol et
  if (navigator.onLine) {
    syncOfflineData();
  }
}
