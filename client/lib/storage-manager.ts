import { UserProfile, SavedLocation, FirestoreScanSession } from '@shared/api';

/**
 * Eski storage-manager.ts geri getirildi (geçici çözüm)
 * Bu fonksiyonlar IndexedDB veya LocalStorage kullanacak şekilde güncellendi
 */

export const getFavorites = (): SavedLocation[] => {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
};

export const getScanStats = () => {
  const saved = localStorage.getItem('scan_stats');
  return saved ? JSON.parse(saved) : {
    totalScans: 0,
    totalScanTime: 0,
    areasExplored: 0
  };
};

export const getScanHistory = (): any[] => {
  const saved = localStorage.getItem('scan_history');
  return saved ? JSON.parse(saved) : [];
};

export const clearScanHistory = () => {
  localStorage.removeItem('scan_history');
};

export const addScanRecord = (record: any) => {
  const history = getScanHistory();
  history.unshift(record);
  localStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)));
};

export const isFavorite = (id: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(f => f.id === id);
};

export const addFavorite = (id: string, location?: Partial<SavedLocation>) => {
  const favorites = getFavorites();
  if (!favorites.some(f => f.id === id)) {
    const newFavorite: SavedLocation = {
      id,
      userId: location?.userId || 'local-user',
      name: location?.name || `Konum ${id}`,
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      savedAt: Date.now(),
      createdAt: Date.now(),
      tags: location?.tags || [],
      ...location
    };
    favorites.push(newFavorite);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
};

export const removeFavorite = (id: string) => {
  const favorites = getFavorites();
  const filtered = favorites.filter(f => f.id !== id);
  localStorage.setItem('favorites', JSON.stringify(filtered));
};

export const getAchievements = () => {
  const saved = localStorage.getItem('achievements');
  return saved ? JSON.parse(saved) : [];
};

export const addComparison = (comparison: any) => {
  const comparisons = JSON.parse(localStorage.getItem('comparisons') || '[]');
  comparisons.unshift(comparison);
  localStorage.setItem('comparisons', JSON.stringify(comparisons.slice(0, 20)));
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
}
