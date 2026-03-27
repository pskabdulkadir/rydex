import { useEffect, useCallback, useRef, useState } from 'react';
import { getCameraDataSync, CameraLocationData } from './camera-data-sync';
import { useLocation } from './location-context';
import { CameraAnalyzer, CameraAnalysisResult } from './camera-analyzer';

export interface UseCameraSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  analyzeFrames?: boolean;
}

export const useCameraSync = (options: UseCameraSyncOptions = {}) => {
  const { autoSync = true, syncInterval = 5000, analyzeFrames = false } = options;
  const { location } = useLocation();
  const syncRef = useRef(getCameraDataSync());
  const analyzerRef = useRef<CameraAnalyzer | null>(null);
  const [syncStats, setSyncStats] = useState({
    bufferedItems: 0,
    isOnline: navigator.onLine,
    isSyncing: false,
  });

  // Kamera veri analiz et (isteğe bağlı)
  const analyzeCameraFrame = useCallback(
    (
      videoElement: HTMLVideoElement
    ): CameraAnalysisResult | null => {
      if (!analyzeFrames || !videoElement) return null;

      try {
        if (!analyzerRef.current) {
          analyzerRef.current = new CameraAnalyzer();
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(videoElement, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        return analyzerRef.current.analyzeFrame(
          imageData,
          canvas.width,
          canvas.height
        );
      } catch (err) {
        console.error('Frame analiz hatası:', err);
        return null;
      }
    },
    [analyzeFrames]
  );

  // Kamera + Konum verisini senkronize et
  const syncCameraLocation = useCallback(
    async (
      videoElement: HTMLVideoElement,
      metadata?: any
    ) => {
      if (!location || !videoElement.srcObject) return null;

      const analysis = analyzeFrames ? analyzeCameraFrame(videoElement) : undefined;

      const data: CameraLocationData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        location: {
          latitude: location.lat,
          longitude: location.lng,
        },
        camera: {
          isActive: true,
          facingMode: 'environment',
          captureMethod: 'stream',
        },
        analysis,
        metadata,
      };

      syncRef.current.addCameraLocationData(data);
      updateSyncStats();

      return data;
    },
    [location, analyzeFrames, analyzeCameraFrame]
  );

  // Sync istatistiklerini güncelle
  const updateSyncStats = useCallback(() => {
    const stats = syncRef.current.getSyncStats();
    setSyncStats({
      bufferedItems: stats.bufferedItems,
      isOnline: stats.isOnline,
      isSyncing: stats.isSyncing,
    });
  }, []);

  // Otomatik senkronizasyon başlat
  useEffect(() => {
    if (autoSync) {
      syncRef.current.startAutoSync();
      const interval = setInterval(updateSyncStats, 1000);

      return () => {
        clearInterval(interval);
        syncRef.current.stopAutoSync();
      };
    }
  }, [autoSync, updateSyncStats]);

  // Manual senkronizasyon
  const manualSync = useCallback(async () => {
    try {
      await syncRef.current.flushBuffer();
      updateSyncStats();
      return true;
    } catch (err) {
      console.error('Manual sync hatası:', err);
      return false;
    }
  }, [updateSyncStats]);

  // Cleanup
  useEffect(() => {
    return () => {
      syncRef.current.destroy();
    };
  }, []);

  return {
    syncCameraLocation,
    manualSync,
    syncStats,
    updateSyncStats,
    analyzeCameraFrame,
    isOnline: navigator.onLine,
  };
};
