/**
 * Offline Depolama ve Cache Yönetimi
 * Tarama sonuçlarını cihazda sakla, internette olmadığında kullan
 */

import { RealDataResponse } from "@shared/real-data-service";
import { ScanSession } from "./scan-state-manager";

export interface StoredScanSession extends ScanSession {
  savedAt: number;
  savedLocally: boolean;
}

export interface CacheConfig {
  maxCacheSize: number; // Bytes
  cacheExpiry: number; // Miliseconds
  autoCleanup: boolean;
}

export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private config: CacheConfig = {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cacheExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
    autoCleanup: true,
  };

  constructor() {
    this.initializeDB();
  }

  /**
   * IndexedDB'yi başlat
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ArchaeoScannerDB", 1);

      request.onerror = () => {
        console.error("IndexedDB açılmadı");
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB başarılı");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tarama oturumları store'u
        if (!db.objectStoreNames.contains("scans")) {
          const scanStore = db.createObjectStore("scans", { keyPath: "id" });
          scanStore.createIndex("timestamp", "timestamp", { unique: false });
          scanStore.createIndex("location", "location", { unique: false });
        }

        // Gerçek veri cache store'u
        if (!db.objectStoreNames.contains("realDataCache")) {
          const cacheStore = db.createObjectStore("realDataCache", { keyPath: "id" });
          cacheStore.createIndex("expiresAt", "expiresAt", { unique: false });
          cacheStore.createIndex("location", "location", { unique: false });
        }

        // Offline uyarılar
        if (!db.objectStoreNames.contains("offlineLogs")) {
          db.createObjectStore("offlineLogs", { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }

  /**
   * Tarama oturumunu yerel olarak kaydet
   */
  async saveScanSession(session: ScanSession): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    const storedSession: StoredScanSession = {
      ...session,
      savedAt: Date.now(),
      savedLocally: true,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("scans", "readwrite");
      const store = transaction.objectStore("scans");
      const request = store.put(storedSession);

      request.onsuccess = () => {
        console.log("Tarama oturumu kaydedildi:", session.id);
        resolve();
      };

      request.onerror = () => {
        console.error("Tarama oturumu kaydedilemedi");
        reject(request.error);
      };
    });
  }

  /**
   * Tarama oturumunu yükle
   */
  async loadScanSession(sessionId: string): Promise<StoredScanSession | null> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("scans", "readonly");
      const store = transaction.objectStore("scans");
      const request = store.get(sessionId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Tüm tarama oturumlarını yükle
   */
  async loadAllScanSessions(): Promise<StoredScanSession[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("scans", "readonly");
      const store = transaction.objectStore("scans");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Gerçek veri cache'e kaydet
   */
  async cacheRealData(
    locationKey: string,
    data: RealDataResponse
  ): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    const cacheEntry = {
      id: locationKey,
      location: locationKey,
      data,
      savedAt: Date.now(),
      expiresAt: Date.now() + this.config.cacheExpiry,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("realDataCache", "readwrite");
      const store = transaction.objectStore("realDataCache");
      const request = store.put(cacheEntry);

      request.onsuccess = () => {
        console.log("Gerçek veri cache'lendi:", locationKey);
        resolve();
      };

      request.onerror = () => {
        console.error("Cache'leme başarısız");
        reject(request.error);
      };
    });
  }

  /**
   * Cache'ten gerçek veri yükle
   */
  async getCachedRealData(locationKey: string): Promise<RealDataResponse | null> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("realDataCache", "readonly");
      const store = transaction.objectStore("realDataCache");
      const request = store.get(locationKey);

      request.onsuccess = () => {
        const result = request.result;

        // Expire kontrol et
        if (result && result.expiresAt > Date.now()) {
          resolve(result.data);
        } else if (result) {
          // Süresi dolmuş, sil
          this.deleteCachedData(locationKey);
          resolve(null);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Süresi dolmuş cache'i temizle
   */
  async cleanupExpiredCache(): Promise<number> {
    if (!this.db) {
      await this.initializeDB();
    }

    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("realDataCache", "readwrite");
      const store = transaction.objectStore("realDataCache");
      const index = store.index("expiresAt");
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`${deletedCount} süresi dolmuş cache temizlendi`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Belirli cache'i sil
   */
  private async deleteCachedData(locationKey: string): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("realDataCache", "readwrite");
      const store = transaction.objectStore("realDataCache");
      const request = store.delete(locationKey);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Offline uyarısı kaydet (internete tekrar bağlı olduğunda senkronize etmek için)
   */
  async logOfflineAction(action: {
    type: string;
    data: any;
    timestamp: number;
  }): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("offlineLogs", "readwrite");
      const store = transaction.objectStore("offlineLogs");
      const request = store.add(action);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Offline log'ları al
   */
  async getOfflineLogs(): Promise<any[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("offlineLogs", "readonly");
      const store = transaction.objectStore("offlineLogs");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Offline log'ları temizle (başarıyla senkronize ettikten sonra)
   */
  async clearOfflineLogs(): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction("offlineLogs", "readwrite");
      const store = transaction.objectStore("offlineLogs");
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Toplam cache boyutunu hesapla
   */
  async getCacheSize(): Promise<number> {
    if (!this.db) {
      await this.initializeDB();
    }

    const scans = await this.loadAllScanSessions();
    const size = JSON.stringify(scans).length;
    return size;
  }

  /**
   * Cache'in bir kısmını temizle (boyut limiti aşıldıysa)
   */
  async enforceStorageQuota(): Promise<void> {
    const currentSize = await this.getCacheSize();

    if (currentSize > this.config.maxCacheSize) {
      console.warn(`Cache limit aşıldı (${currentSize} bytes)`);

      // En eski taramaları sil
      const sessions = await this.loadAllScanSessions();
      const sorted = sessions.sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));

      const toDelete = sorted.slice(0, Math.floor(sessions.length / 4)); // İlk %25'i sil

      if (!this.db) {
        await this.initializeDB();
      }

      for (const session of toDelete) {
        await new Promise((resolve, reject) => {
          const transaction = this.db!.transaction("scans", "readwrite");
          const store = transaction.objectStore("scans");
          const request = store.delete(session.id);

          request.onsuccess = () => resolve(null);
          request.onerror = () => reject(request.error);
        });
      }

      console.log(`${toDelete.length} eski tarama silindi`);
    }
  }

  /**
   * Tüm verileri sil (reset)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.initializeDB();
    }

    const stores = ["scans", "realDataCache", "offlineLogs"];

    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve(null);
        request.onerror = () => reject(request.error);
      });
    }

    console.log("Tüm veriler silindi");
  }

  /**
   * Yapılandırmayı güncelle
   */
  setConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Cache durumunu getir
   */
  async getStorageStats(): Promise<{
    totalScans: number;
    cacheSize: number;
    offlineLogs: number;
  }> {
    const sessions = await this.loadAllScanSessions();
    const logs = await this.getOfflineLogs();
    const size = await this.getCacheSize();

    return {
      totalScans: sessions.length,
      cacheSize: size,
      offlineLogs: logs.length,
    };
  }
}

// Global instance
export const offlineStorage = new OfflineStorage();
