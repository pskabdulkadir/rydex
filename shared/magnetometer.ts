// Manyetik alan ölçümü veri modeli
export interface MagneticReading {
  x: number; // µT
  y: number; // µT
  z: number; // µT
  total: number; // Toplam manyetik alan şiddeti (µT)
  timestamp: number; // Milisaniye
}

// Tespit edilen kaynak türü
export enum ResourceType {
  // Değerli Metaller
  GOLD = "GOLD", // Altın
  SILVER = "SILVER", // Gümüş
  COPPER = "COPPER", // Bakır
  MERCURY = "MERCURY", // Civa
  PLATINUM = "PLATINUM", // Platin

  // Değerli Taşlar ve Kristaller
  DIAMOND = "DIAMOND", // Elmas
  RUBY = "RUBY", // Yakut
  EMERALD = "EMERALD", // Zümrüt
  SAPPHIRE = "SAPPHIRE", // Safir
  AMETHYST = "AMETHYST", // Ametist

  // Tarihi Eserler ve Arkeolojik Bulgular
  STATUE = "STATUE", // Heykeller
  POTTERY = "POTTERY", // Seramik
  PARCHMENT = "PARCHMENT", // Parchment/Kütüphane Yazıları
  WRITTEN_TABLET = "WRITTEN_TABLET", // Yazılı Levhalar
  ARTIFACT = "ARTIFACT", // Arkeolojik Eser
  COIN = "COIN", // Madeni Para
  JEWELRY = "JEWELRY", // Takı

  // Genel Kaynaklar
  MINERAL = "MINERAL", // Madeni Kaynak
  ORE = "ORE", // Cevher
  GEM = "GEM", // Mücevher

  // Yapılar ve Harita Özellikleri
  UNDERGROUND_STRUCTURE = "UNDERGROUND_STRUCTURE", // Yer Altı Yapısı
  CHAMBER = "CHAMBER", // Oda/Depo
  VAULT = "VAULT", // Kasa/Hazine Odası
  TUNNEL = "TUNNEL", // Tünel
  WALL = "WALL", // Duvar
  FOUNDATION = "FOUNDATION", // Temel

  // Diğer
  VALUABLE_MATERIAL = "VALUABLE_MATERIAL", // Değerli Materyal
  ANOMALY = "ANOMALY", // Genel Anomali
  UNKNOWN = "UNKNOWN", // Bilinmeyen
}

export interface TreasureResult {
  id: string;
  resourceType: ResourceType;
  magneticStrength: number; // µT
  anomalyLevel: number;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  confidence: number; // 0-100
}

// Kalibrasyon verisi
export interface CalibrationData {
  baseline: number; // Başlangıç manyetik alan değeri
  calibratedAt: number;
  readings: number;
}

// Sabitler
export const RESOURCE_THRESHOLDS = {
  // Değerli Metaller (Yüksek Magnetik Alan)
  [ResourceType.GOLD]: 130, // Çok nadir, zayıf diamagnetik
  [ResourceType.SILVER]: 125, // Nadir, zayıf diamagnetik
  [ResourceType.COPPER]: 120, // Zayıf diamagnetik
  [ResourceType.MERCURY]: 115, // Zayıf diamagnetik
  [ResourceType.PLATINUM]: 128, // Çok nadir ve pahalı

  // Değerli Taşlar
  [ResourceType.DIAMOND]: 110,
  [ResourceType.RUBY]: 118,
  [ResourceType.EMERALD]: 112,
  [ResourceType.SAPPHIRE]: 116,
  [ResourceType.AMETHYST]: 105,

  // Tarihi Eserler
  [ResourceType.STATUE]: 100,
  [ResourceType.POTTERY]: 85,
  [ResourceType.PARCHMENT]: 70,
  [ResourceType.WRITTEN_TABLET]: 90,
  [ResourceType.ARTIFACT]: 105,
  [ResourceType.COIN]: 115,
  [ResourceType.JEWELRY]: 120,

  // Genel Kaynaklar
  [ResourceType.MINERAL]: 95,
  [ResourceType.ORE]: 100,
  [ResourceType.GEM]: 108,

  // Yapılar ve Harita Özellikleri
  [ResourceType.UNDERGROUND_STRUCTURE]: 80,
  [ResourceType.CHAMBER]: 85,
  [ResourceType.VAULT]: 95,
  [ResourceType.TUNNEL]: 75,
  [ResourceType.WALL]: 78,
  [ResourceType.FOUNDATION]: 82,

  // Diğer
  [ResourceType.VALUABLE_MATERIAL]: 110,
  [ResourceType.ANOMALY]: 60,
  [ResourceType.UNKNOWN]: 0,
};

export const RESOURCE_DISPLAY_NAMES = {
  // Değerli Metaller
  [ResourceType.GOLD]: "Altın",
  [ResourceType.SILVER]: "Gümüş",
  [ResourceType.COPPER]: "Bakır",
  [ResourceType.MERCURY]: "Civa",
  [ResourceType.PLATINUM]: "Platin",

  // Değerli Taşlar
  [ResourceType.DIAMOND]: "Elmas",
  [ResourceType.RUBY]: "Yakut",
  [ResourceType.EMERALD]: "Zümrüt",
  [ResourceType.SAPPHIRE]: "Safir",
  [ResourceType.AMETHYST]: "Ametist",

  // Tarihi Eserler
  [ResourceType.STATUE]: "Heykeller",
  [ResourceType.POTTERY]: "Seramik",
  [ResourceType.PARCHMENT]: "Yazı Malzemeleri",
  [ResourceType.WRITTEN_TABLET]: "Yazılı Levhalar",
  [ResourceType.ARTIFACT]: "Arkeolojik Eser",
  [ResourceType.COIN]: "Madeni Para",
  [ResourceType.JEWELRY]: "Takı",

  // Genel Kaynaklar
  [ResourceType.MINERAL]: "Madeni Kaynak",
  [ResourceType.ORE]: "Cevher",
  [ResourceType.GEM]: "Mücevher",

  // Yapılar
  [ResourceType.UNDERGROUND_STRUCTURE]: "Yer Altı Yapısı",
  [ResourceType.CHAMBER]: "Oda/Depo",
  [ResourceType.VAULT]: "Kasa/Hazine Odası",
  [ResourceType.TUNNEL]: "Tünel",
  [ResourceType.WALL]: "Duvar",
  [ResourceType.FOUNDATION]: "Temel",

  // Diğer
  [ResourceType.VALUABLE_MATERIAL]: "Değerli Materyal",
  [ResourceType.ANOMALY]: "Genel Anomali",
  [ResourceType.UNKNOWN]: "Bilinmeyen",
};

export const RESOURCE_COLORS = {
  // Değerli Metaller
  [ResourceType.GOLD]: "#FFD700", // Altın
  [ResourceType.SILVER]: "#C0C0C0", // Gümüş
  [ResourceType.COPPER]: "#B87333", // Bakır
  [ResourceType.MERCURY]: "#C0C0C0", // Civa (Gümüş)
  [ResourceType.PLATINUM]: "#E8E8E8", // Platin

  // Değerli Taşlar
  [ResourceType.DIAMOND]: "#F0F8FF", // Elmas
  [ResourceType.RUBY]: "#E0115F", // Yakut
  [ResourceType.EMERALD]: "#50C878", // Zümrüt
  [ResourceType.SAPPHIRE]: "#0F52BA", // Safir
  [ResourceType.AMETHYST]: "#9966CC", // Ametist

  // Tarihi Eserler
  [ResourceType.STATUE]: "#CD853F", // Heykeller (Çikolata rengi)
  [ResourceType.POTTERY]: "#8B4513", // Seramik (Kahverengi)
  [ResourceType.PARCHMENT]: "#F5DEB3", // Yazı (Buğday rengi)
  [ResourceType.WRITTEN_TABLET]: "#A9A9A9", // Yazılı Levhalar (Koyu Gri)
  [ResourceType.ARTIFACT]: "#DAA520", // Arkeolojik (Goldenrod)
  [ResourceType.COIN]: "#FFD700", // Madeni Para (Altın)
  [ResourceType.JEWELRY]: "#FF69B4", // Takı (Sıcak Pembe)

  // Genel Kaynaklar
  [ResourceType.MINERAL]: "#00FFFF", // Madeni Kaynak (Cyan)
  [ResourceType.ORE]: "#696969", // Cevher (Dim Gray)
  [ResourceType.GEM]: "#00FF00", // Mücevher (Yeşil)

  // Yapılar
  [ResourceType.UNDERGROUND_STRUCTURE]: "#808080", // Gri
  [ResourceType.CHAMBER]: "#4B0082", // İndigo (Oda)
  [ResourceType.VAULT]: "#FF4500", // Orange Red (Kasa)
  [ResourceType.TUNNEL]: "#2F4F4F", // Koyu Mavi-Gri
  [ResourceType.WALL]: "#A9A9A9", // Koyu Gri
  [ResourceType.FOUNDATION]: "#8B7355", // Burlywood

  // Diğer
  [ResourceType.VALUABLE_MATERIAL]: "#FF0000", // Kırmızı
  [ResourceType.ANOMALY]: "#FFFF00", // Sarı
  [ResourceType.UNKNOWN]: "#FFFFFF", // Beyaz
};

// Normal dünya manyetik alanı
export const EARTH_MAGNETIC_FIELD_RANGE = { min: 25, max: 65 };
