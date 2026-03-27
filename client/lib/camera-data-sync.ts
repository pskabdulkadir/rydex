import { CameraAnalysisResult } from './camera-analyzer';

export interface CameraLocationData {
  id: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
  };
  camera: {
    isActive: boolean;
    facingMode: 'environment' | 'user';
    captureMethod: 'photo' | 'video' | 'stream';
  };
  analysis?: CameraAnalysisResult;
  metadata?: {
    zoom?: number;
    brightness?: number;
    sessionId?: string;
  };
}

export class CameraDataSync {
  private syncBuffer: CameraLocationData[] = [];
  private isOnline = navigator.onLine;
  private syncInterval = 5000; // 5 saniye
  private maxBufferSize = 100;
  private syncIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Online/Offline dinle
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushBuffer();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sayfa kapatılırken verileri gönder
    window.addEventListener('beforeunload', () => {
      this.flushBuffer();
    });
  }

  // Kamera+Konum verisini buffer'a ekle
  addCameraLocationData(data: CameraLocationData) {
    this.syncBuffer.push(data);

    // Buffer dolmaya başlarsa hemen gönder
    if (this.syncBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  // Otomatik senkronizasyon başlat
  startAutoSync() {
    if (this.syncIntervalId) return;

    this.syncIntervalId = setInterval(() => {
      if (this.isOnline && this.syncBuffer.length > 0) {
        this.flushBuffer();
      }
    }, this.syncInterval);
  }

  // Otomatik senkronizasyonu durdur
  stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // Buffer'daki tüm verileri sunucuya gönder
  async flushBuffer() {
    if (this.syncBuffer.length === 0) return;

    const dataToSync = [...this.syncBuffer];
    this.syncBuffer = [];

    try {
      const response = await fetch('/api/camera/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch: dataToSync,
          timestamp: Date.now(),
          deviceId: this.getDeviceId(),
        }),
      });

      if (!response.ok) {
        console.error('Sync başarısız:', response.statusText);
        // Başarısız verileri geri buffer'a koy
        this.syncBuffer.unshift(...dataToSync);
      }

      return response;
    } catch (err) {
      console.error('Sync hatası:', err);
      // Bağlantı hatası - verileri geri koy
      this.syncBuffer.unshift(...dataToSync);
      throw err;
    }
  }

  // Cihaz kimliği (localStorage kullanarak)
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('camera-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('camera-device-id', deviceId);
    }
    return deviceId;
  }

  // Veri kalitesi raporu
  getSyncStats() {
    return {
      bufferedItems: this.syncBuffer.length,
      isOnline: this.isOnline,
      isSyncing: this.syncIntervalId !== null,
      maxBufferSize: this.maxBufferSize,
    };
  }

  // Cleanup
  destroy() {
    this.stopAutoSync();
    this.flushBuffer();
  }
}

// Global instance
let syncInstance: CameraDataSync | null = null;

export const getCameraDataSync = () => {
  if (!syncInstance) {
    syncInstance = new CameraDataSync();
  }
  return syncInstance;
};
