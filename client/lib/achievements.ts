import { Achievement } from './storage-manager';

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_scan: {
    id: 'first_scan',
    name: 'İlk Tarama',
    description: 'İlk yeraltı taramanı tamamla',
    icon: '🎯',
  },
  scan_explorer: {
    id: 'scan_explorer',
    name: '10 Farklı Yapı Keşfedici',
    description: '10 farklı yapı türünü tara',
    icon: '🔍',
    progress: 0,
  },
  deep_digger: {
    id: 'deep_digger',
    name: 'Derin Kazıcı',
    description: '5 metreye kadar derinlikte tarama yap',
    icon: '⛏️',
  },
  magnetic_master: {
    id: 'magnetic_master',
    name: 'Manyetik Ustası',
    description: '500+ nT manyetik sinyal tespiti',
    icon: '⚡',
  },
  collection_hunter: {
    id: 'collection_hunter',
    name: 'Koleksiyoncu Avcı',
    description: '20 yapı türünü favorilere ekle',
    icon: '⭐',
    progress: 0,
  },
  scan_marathon: {
    id: 'scan_marathon',
    name: 'Tarama Maratonu',
    description: 'Bir seansda 25 tarama yap',
    icon: '🏃',
    progress: 0,
  },
  precision_locator: {
    id: 'precision_locator',
    name: 'Hassas Konumlandırıcı',
    description: '80+ tespit doğruluğu olan 15 yapı tara',
    icon: '🎯',
    progress: 0,
  },
  historical_keeper: {
    id: 'historical_keeper',
    name: 'Tarihsel Koruyucu',
    description: 'Tüm tarihsel yapı türlerini tara',
    icon: '🏛️',
    progress: 0,
  },
  lucky_finder: {
    id: 'lucky_finder',
    name: 'Şanslı Bulucu',
    description: 'Kritik kültürel değere sahip yapıyı tara',
    icon: '💎',
  },
  safety_conscious: {
    id: 'safety_conscious',
    name: 'Güvenlik Bilinci',
    description: 'Yüksek riskli 5 yapı türü hakkında bilgi oku',
    icon: '🛡️',
    progress: 0,
  },
  all_seeing_eye: {
    id: 'all_seeing_eye',
    name: 'Hep Görmeyenler',
    description: 'Tüm 38 yapı türünü gözlemle',
    icon: '👁️',
    progress: 0,
  },
  ultimate_explorer: {
    id: 'ultimate_explorer',
    name: 'Son Keşfedici',
    description: '50+ tarama yap ve 20 yapı türü keşfet',
    icon: '🚀',
    progress: 0,
  },
};

export function getAchievementDisplay(achievement: Achievement) {
  return {
    icon: achievement.icon,
    name: achievement.name,
    description: achievement.description,
    isUnlocked: !!achievement.unlockedAt,
    progress: achievement.progress || 0,
    unlockedAt: achievement.unlockedAt,
  };
}

export function formatAchievementDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
