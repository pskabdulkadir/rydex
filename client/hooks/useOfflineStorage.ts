/**
 * useOfflineStorage Hook
 * Offline depolama ve cache işlemleri için
 */

import { useEffect, useState, useCallback } from "react";
import { offlineStorage, StoredScanSession } from "@/services/offline-storage";
import { RealDataResponse } from "@shared/real-data-service";
import { ScanSession } from "@/services/scan-state-manager";

export interface OfflineStorageState {
  isReady: boolean;
  totalScans: number;
  cacheSize: number;
  offlineLogs: number;
}

export const useOfflineStorage = () => {
  const [state, setState] = useState<OfflineStorageState>({
    isReady: false,
    totalScans: 0,
    cacheSize: 0,
    offlineLogs: 0,
  });

  const [error, setError] = useState<string | null>(null);

  // Başlangıçta depolama hazırlanır
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Süresi dolmuş cache'i otomatik temizle
        await offlineStorage.cleanupExpiredCache();

        // Depolama stats'ı al
        const stats = await offlineStorage.getStorageStats();

        setState({
          isReady: true,
          totalScans: stats.totalScans,
          cacheSize: stats.cacheSize,
          offlineLogs: stats.offlineLogs,
        });

        // Quota kontrol et
        await offlineStorage.enforceStorageQuota();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Depolama başlatılamadı";
        setError(message);
        console.error("Offline depolama hatası:", err);
      }
    };

    initializeStorage();
  }, []);

  /**
   * Tarama oturumunu kaydet
   */
  const saveScan = useCallback(async (session: ScanSession): Promise<void> => {
    try {
      await offlineStorage.saveScanSession(session);

      // Stats'ı güncelle
      const stats = await offlineStorage.getStorageStats();
      setState((prev) => ({
        ...prev,
        totalScans: stats.totalScans,
        cacheSize: stats.cacheSize,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tarama kaydedilemedi";
      setError(message);
    }
  }, []);

  /**
   * Tarama oturumunu yükle
   */
  const loadScan = useCallback(async (sessionId: string): Promise<StoredScanSession | null> => {
    try {
      return await offlineStorage.loadScanSession(sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tarama yüklenemedi";
      setError(message);
      return null;
    }
  }, []);

  /**
   * Tüm taramaları yükle
   */
  const loadAllScans = useCallback(async (): Promise<StoredScanSession[]> => {
    try {
      return await offlineStorage.loadAllScanSessions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Taramalar yüklenemedi";
      setError(message);
      return [];
    }
  }, []);

  /**
   * Gerçek veriyi cache'e kaydet
   */
  const cacheRealData = useCallback(
    async (locationKey: string, data: RealDataResponse): Promise<void> => {
      try {
        await offlineStorage.cacheRealData(locationKey, data);

        // Stats'ı güncelle
        const stats = await offlineStorage.getStorageStats();
        setState((prev) => ({
          ...prev,
          cacheSize: stats.cacheSize,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cache kaydedilemedi";
        setError(message);
      }
    },
    []
  );

  /**
   * Cache'ten gerçek veri yükle
   */
  const getCachedRealData = useCallback(
    async (locationKey: string): Promise<RealDataResponse | null> => {
      try {
        return await offlineStorage.getCachedRealData(locationKey);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cache yüklenemedi";
        setError(message);
        return null;
      }
    },
    []
  );

  /**
   * Offline log'ları al
   */
  const getOfflineLogs = useCallback(async () => {
    try {
      return await offlineStorage.getOfflineLogs();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Log'lar yüklenemedi";
      setError(message);
      return [];
    }
  }, []);

  /**
   * Tarama sil
   */
  const deleteScan = useCallback(async (sessionId: string): Promise<void> => {
    try {
      // Bu fonksiyon OfflineStorage'da implementasyon gerektirir
      // Şimdilik manuel implement ediyoruz
      const allScans = await offlineStorage.loadAllScanSessions();
      const filtered = allScans.filter((s) => s.id !== sessionId);

      // Tüm verileri sil ve yeniden kaydet
      await offlineStorage.clearAllData();
      for (const scan of filtered) {
        await offlineStorage.saveScanSession(scan);
      }

      // Stats'ı güncelle
      const stats = await offlineStorage.getStorageStats();
      setState((prev) => ({
        ...prev,
        totalScans: stats.totalScans,
        cacheSize: stats.cacheSize,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tarama silinemedi";
      setError(message);
    }
  }, []);

  /**
   * Tüm verileri sil
   */
  const clearAll = useCallback(async (): Promise<void> => {
    try {
      await offlineStorage.clearAllData();
      setState({
        isReady: true,
        totalScans: 0,
        cacheSize: 0,
        offlineLogs: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Veriler silinemedi";
      setError(message);
    }
  }, []);

  /**
   * Depolama stat'larını yenile
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await offlineStorage.getStorageStats();
      setState((prev) => ({
        ...prev,
        totalScans: stats.totalScans,
        cacheSize: stats.cacheSize,
        offlineLogs: stats.offlineLogs,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stats yüklenemedi";
      setError(message);
    }
  }, []);

  return {
    // State
    isReady: state.isReady,
    stats: {
      totalScans: state.totalScans,
      cacheSize: state.cacheSize,
      offlineLogs: state.offlineLogs,
    },
    error,
    clearError: () => setError(null),

    // Operasyonlar
    saveScan,
    loadScan,
    loadAllScans,
    deleteScan,
    clearAll,
    cacheRealData,
    getCachedRealData,
    getOfflineLogs,
    refreshStats,
  };
};
