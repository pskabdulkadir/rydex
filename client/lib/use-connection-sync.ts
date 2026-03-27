import { useEffect, useCallback } from 'react';
import { useNetwork } from '@/lib/network-context';
import { useQueryClient } from '@tanstack/react-query';
import { syncOfflineData } from '@/lib/sync-manager';
import { clearSyncQueue } from '@/lib/local-db';
import { clearAllMockData, checkOfflineDataAvailability } from '@/lib/mock-data-manager';
import { toast } from 'sonner';

/**
 * Bağlantı durumu değiştiğinde:
 * - Online: React Query cache'i geçersiz kıl ve verileri senkronize et
 * - Offline: Simülasyon verilerini ayarla
 */
export function useConnectionSync() {
  const { isOnline, connectionChanged, wasOnline } = useNetwork();
  const queryClient = useQueryClient();

  const handleConnectionChange = useCallback(async () => {
    console.log(`📡 Bağlantı Durumu Değişti: ${wasOnline ? 'Online' : 'Offline'} → ${isOnline ? 'Online' : 'Offline'}`);

    if (isOnline && !wasOnline) {
      // Offline'dan Online'a geçiş
      console.log('✅ Çevrimdışı → Çevrimiçi geçişi başlıyor...');

      try {
        // React Query cache'i geçersiz kıl (tüm istekleri yenile)
        await queryClient.invalidateQueries();

        // Bekleyen offline verileri senkronize et
        await syncOfflineData();

        // Simülasyon verilerini temizle
        clearAllMockData();
        deactivateOfflineMode();

        toast.success('Veriler güncelleniyor...', {
          description: 'İnternet bağlantısı sağlandı, gerçek veriler yükleniyor.',
        });
      } catch (error) {
        console.error('Senkronizasyon hatası:', error);
        toast.error('Senkronizasyon başarısız oldu');
      }
    } else if (!isOnline && wasOnline) {
      // Online'dan Offline'a geçiş
      console.log('❌ Çevrimiçi → Çevrimdışı geçişi başlıyor...');

      // Çevrimdışı veri kullanılabilirliğini kontrol et
      const offlineData = checkOfflineDataAvailability();

      // Offline modu aktivate et
      activateMockDataMode();

      if (offlineData.availableKeys.length > 0) {
        toast.warning('Çevrimdışı modus etkinleştirildi', {
          description: `${offlineData.availableKeys.length} veri kaynağı yerel olarak kullanılabilir.`,
        });
      } else {
        toast.warning('Çevrimdışı modus etkinleştirildi', {
          description: 'Bağlantı gelince veriler senkronize edilecek.',
        });
      }
    }
  }, [isOnline, wasOnline, queryClient]);

  useEffect(() => {
    if (connectionChanged) {
      handleConnectionChange();
    }
  }, [connectionChanged, handleConnectionChange]);
}

/**
 * Offline modu aktivate et - simülasyon verileri kullan
 */
function activateMockDataMode() {
  // Offline modda simülasyon verilerini sakla
  const mockMode = {
    isActive: true,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem('offline_mock_mode', JSON.stringify(mockMode));
    console.log('📦 Offline simülasyon modu aktivatildi');
  } catch (error) {
    console.warn('Offline modu ayarlanamadı:', error);
  }
}

/**
 * Offline modu kontrolü
 */
export function isOfflineModeActive(): boolean {
  try {
    const mode = localStorage.getItem('offline_mock_mode');
    return mode ? JSON.parse(mode).isActive : false;
  } catch {
    return false;
  }
}

/**
 * Offline modu deaktivatı
 */
export function deactivateOfflineMode() {
  try {
    localStorage.removeItem('offline_mock_mode');
    console.log('📳 Offline simülasyon modu deaktive edildi');
  } catch (error) {
    console.warn('Offline modu kapatılamadı:', error);
  }
}
