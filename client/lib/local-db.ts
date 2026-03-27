/**
 * IndexedDB - Telefonda yerel veri depolaması
 * Çevrimdışı çalışma için optimize edilmiş
 */

import {
  UserProfile,
  FirestoreScanSession,
  SavedReport,
  SavedLocation,
} from '@shared/api';

const DB_NAME = 'hazine-arama-db';
const DB_VERSION = 1;

// Store adları
const STORES = {
  USER: 'user',
  SCANS: 'scanSessions',
  REPORTS: 'reports',
  FAVORITES: 'favorites',
  SYNC_QUEUE: 'syncQueue', // İnternet olunca gönderilecek veriler
};

let db: IDBDatabase | null = null;

/**
 * IndexedDB'yi başlat
 */
export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Kullanıcı profili
      if (!database.objectStoreNames.contains(STORES.USER)) {
        database.createObjectStore(STORES.USER, { keyPath: 'uid' });
      }

      // Tarama oturumları
      if (!database.objectStoreNames.contains(STORES.SCANS)) {
        const scanStore = database.createObjectStore(STORES.SCANS, {
          keyPath: 'id',
        });
        scanStore.createIndex('userId', 'userId', { unique: false });
        scanStore.createIndex('startedAt', 'startedAt', { unique: false });
      }

      // Raporlar
      if (!database.objectStoreNames.contains(STORES.REPORTS)) {
        const reportStore = database.createObjectStore(STORES.REPORTS, {
          keyPath: 'id',
        });
        reportStore.createIndex('userId', 'userId', { unique: false });
        reportStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Favori Konumlar
      if (!database.objectStoreNames.contains(STORES.FAVORITES)) {
        const favStore = database.createObjectStore(STORES.FAVORITES, {
          keyPath: 'id',
        });
        favStore.createIndex('userId', 'userId', { unique: false });
      }

      // Senkronizasyon Kuyruğu
      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        database.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
  });
}

/**
 * Veritabanı bağlantısını al
 */
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    await initializeDB();
  }
  return db!;
}

// ============ KULLANICILAR ============

export async function createLocalUser(
  user: UserProfile
): Promise<UserProfile> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USER], 'readwrite');
    const store = transaction.objectStore(STORES.USER);
    const request = store.add(user);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(user);
  });
}

export async function getLocalUser(uid: string): Promise<UserProfile | null> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USER], 'readonly');
    const store = transaction.objectStore(STORES.USER);
    const request = store.get(uid);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function updateLocalUser(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const database = await getDB();
  const user = await getLocalUser(uid);

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.USER], 'readwrite');
    const store = transaction.objectStore(STORES.USER);
    const request = store.put({ ...user, ...updates });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============ TARAMA OTURUMLARI ============

export async function createLocalScanSession(
  session: FirestoreScanSession
): Promise<FirestoreScanSession> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SCANS], 'readwrite');
    const store = transaction.objectStore(STORES.SCANS);
    const request = store.add(session);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(session);
  });
}

export async function getLocalScanSession(
  id: string
): Promise<FirestoreScanSession | null> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SCANS], 'readonly');
    const store = transaction.objectStore(STORES.SCANS);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getUserLocalScanSessions(
  userId: string
): Promise<FirestoreScanSession[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SCANS], 'readonly');
    const store = transaction.objectStore(STORES.SCANS);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result || [];
      // En yeni taramaları önce sırala
      results.sort((a, b) => b.startedAt - a.startedAt);
      resolve(results);
    };
  });
}

export async function updateLocalScanSession(
  id: string,
  updates: Partial<FirestoreScanSession>
): Promise<void> {
  const database = await getDB();
  const session = await getLocalScanSession(id);

  if (!session) {
    throw new Error('Tarama oturumu bulunamadı');
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SCANS], 'readwrite');
    const store = transaction.objectStore(STORES.SCANS);
    const request = store.put({ ...session, ...updates });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteLocalScanSession(id: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SCANS], 'readwrite');
    const store = transaction.objectStore(STORES.SCANS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============ RAPORLAR ============

export async function createLocalReport(
  report: SavedReport
): Promise<SavedReport> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.REPORTS], 'readwrite');
    const store = transaction.objectStore(STORES.REPORTS);
    const request = store.add(report);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(report);
  });
}

export async function getUserLocalReports(
  userId: string
): Promise<SavedReport[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.REPORTS], 'readonly');
    const store = transaction.objectStore(STORES.REPORTS);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result || [];
      results.sort((a, b) => b.createdAt - a.createdAt);
      resolve(results);
    };
  });
}

export async function deleteLocalReport(id: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.REPORTS], 'readwrite');
    const store = transaction.objectStore(STORES.REPORTS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============ FAVORİ KONUMLAR ============

export async function addLocalFavorite(
  location: SavedLocation
): Promise<SavedLocation> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
    const store = transaction.objectStore(STORES.FAVORITES);
    const request = store.add(location);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(location);
  });
}

export async function getUserLocalFavorites(
  userId: string
): Promise<SavedLocation[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.FAVORITES], 'readonly');
    const store = transaction.objectStore(STORES.FAVORITES);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result || [];
      results.sort((a, b) => b.createdAt - a.createdAt);
      resolve(results);
    };
  });
}

export async function removeLocalFavorite(id: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.FAVORITES], 'readwrite');
    const store = transaction.objectStore(STORES.FAVORITES);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============ SENKRONIZASYON KUYRUĞU ============
// İnternet olduğunda sunucuya gönderilecek veriler

export async function addToSyncQueue(data: {
  type: string;
  action: string;
  payload: any;
  timestamp: number;
}): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.add(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSyncQueue(): Promise<any[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function clearSyncQueue(): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
