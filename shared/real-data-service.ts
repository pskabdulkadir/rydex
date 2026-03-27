/**
 * Gerçek Veri Kaynakları Entegrasyonu
 * USGS, NOAA, UNESCO, Open Context vb. API'lerden gerçek veriler çekme
 */

export interface RealDataRequest {
  latitude: number;
  longitude: number;
  radius?: number; // kilometre cinsinden (default: 50km)
  depth?: number;  // metre cinsinden (yer altı derinliği)
  area?: number;   // m² cinsinden (tarama alanı)
}

// ============ MANYETİK ALAN VERİSİ (NOAA) ============

export interface MagneticFieldData {
  latitude: number;
  longitude: number;
  totalIntensity: number; // nanotesla
  declination: number; // derece
  inclination: number; // derece
  horizontalIntensity: number;
  timestamp: string;
  source: "NOAA";
  accuracy?: string;
}

// ============ JEOLOJİK VERİ (USGS) ============

export interface MineralDeposit {
  id: string;
  name: string;
  type: string; // "metal", "nonmetal", "energy"
  primaryMinerals: string[];
  commodity: string;
  latitude: number;
  longitude: number;
  depth?: number; // metre
  productionHistory?: string;
  significance: "major" | "moderate" | "minor";
}

export interface GeologyData {
  deposits: MineralDeposit[];
  rockTypes: Array<{
    type: string;
    percentage: number;
    location?: string;
  }>;
  seismicHistory?: Array<{
    magnitude: number;
    depth: number;
    date: string;
    epicenter: { latitude: number; longitude: number };
  }>;
  faultLines?: Array<{
    name: string;
    length: number;
    lastActivity: string;
  }>;
}

// ============ ARKEOLOJİK VERİ ============

export interface ArchaeologicalSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  period: string; // "Bronze Age", "Roman", vb.
  description: string;
  significance: "world_heritage" | "national" | "regional" | "local";
  discoveryDate?: string;
  artifacts?: string[];
  contactPerson?: string;
  contactEmail?: string;
}

export interface UnescoDatum {
  id: string;
  name: string;
  criteria: string[];
  yearInscribed: number;
  latitude: number;
  longitude: number;
  country: string;
  description: string;
}

export interface ArchaeologyData {
  unescoSites: UnescoDatum[];
  archaeologicalSites: ArchaeologicalSite[];
  historicalPeriods: string[];
  knownArtifacts: Array<{
    name: string;
    period: string;
    location: string;
    significance: number;
  }>;
}

// ============ TOPOGRAFİK VERİ (DEM) ============

export interface ElevationData {
  latitude: number;
  longitude: number;
  elevation: number; // metre
  resolution: number; // metre
  source: "USGS" | "GEBCO" | "Mapzen";
}

export interface TerrainData {
  elevation: ElevationData;
  slope: number; // derece
  aspect: number; // derece (0-360)
  ruggedIndexValue?: number;
  landform?: string;
}

// ============ UYDU VERİSİ ============

export interface SatelliteImageMetadata {
  url: string;
  source: string;
  date: string;
  resolution: number; // metre
  cloudCover: number; // yüzde
}

// ============ GENEL SONUÇ YAPISI ============

export interface RealDataResponse {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  dataQuality: "high" | "medium" | "low";

  depth?: number;  // metre cinsinden tarama derinliği
  area?: number;   // m² cinsinden tarama alanı

  magneticData?: MagneticFieldData;
  geologyData?: GeologyData;
  archaeologyData?: ArchaeologyData;
  terrainData?: TerrainData;
  satelliteImage?: SatelliteImageMetadata;

  metadata: {
    sourcesUsed: string[];
    requestTime: number; // milliseconds
    successRate: number; // yüzde
  };
}

// ============ API HELPER INTERFACE'LERİ ============

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export type RealDataCache = Map<string, CacheEntry<RealDataResponse>>;

// ============ SABİTLER ============

export const REAL_DATA_SOURCES = {
  NOAA_MAGNETIC: "https://www.ncei.noaa.gov/products/world-magnetic-model/",
  USGS_MINERAL: "https://mrdata.usgs.gov/api/",
  UNESCO_SITES: "https://api.worldwildlifefund.org/v1/",
  OPEN_CONTEXT: "https://opencontext.org/api/",
  GEBCO_ELEVATION: "https://www.gebco.net/",
  OPEN_ELEVATION: "https://api.open-elevation.com/api/v1/",
};

export const API_TIMEOUT = 10000; // 10 seconds
export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 gün
export const DEFAULT_RADIUS = 50; // kilometre
