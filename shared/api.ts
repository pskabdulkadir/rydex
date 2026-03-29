/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 *
 * AÇIK KAYNAK API'LER KULLANILIYOR:
 * - Uydu Görüntüleri: USGS + Esri + Copernicus (API key yok)
 * - İklim Verisi: Open-Meteo (API key yok)
 * - Manyetik Alan: NOAA WMM (API key yok)
 * - Jeoloji: Overpass API + UNESCO + Open Context (API key yok)
 * - Toprak: SoilGrids (API key yok)
 * - Sismik: USGS Earthquake (API key yok)
 *
 * Tüm veriler gerçek, dinamik ve hiçbir harici API anahtarı gerektirmez.
 */

/**
 * /api/demo için örnek response tipi
 */
export interface DemoResponse {
  message: string;
}

/**
 * Desteklenen Para Birimleri
 */
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  exchangeRate: number; // TRY cinsinden
  locale: string;
}

export interface CurrencyRates {
  baseCurrency: Currency;
  timestamp: number;
  rates: Record<Currency, number>;
}

/**
 * Multi-currency ödeme başlatma request
 */
export interface InitiatePaymentRequest {
  userId: string;
  packageId: string;
  amount: number;
  currency: Currency;
  email: string;
  returnUrl: string;
}

/**
 * Invoice üretimi request
 */
export interface GenerateInvoiceRequest {
  userId: string;
  paymentId: string;
  packageId: string;
  amount: number;
  currency: Currency;
  userEmail: string;
  userName?: string;
}

/**
 * Invoice üretimi response
 */
export interface GenerateInvoiceResponse {
  success: boolean;
  invoiceId: string;
  invoiceNumber: string;
  pdfUrl?: string;
  message: string;
}

/**
 * Invoice satır öğesi
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Invoice belge
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  paymentId: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: Currency;
  userEmail: string;
  userName: string;
  issueDate: number;
  dueDate: number;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  pdfUrl?: string;
}

/**
 * Ölçüm kaydı request
 */
export interface MeasurementRequest {
  timestamp: number;
  latitude: number;
  longitude: number;
  magneticX: number;
  magneticY: number;
  magneticZ: number;
  magnitude: number;
  accuracy: number;
  altitude: number;
}

/**
 * Ölçüm kaydı response
 */
export interface MeasurementResponse {
  success: boolean;
  message: string;
  id?: string;
}

/**
 * Tespit edilen anomali
 */
export interface Detection {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  magnitude: number;
  accuracy: number;
}

/**
 * Geçmiş öğesi
 */
export interface HistoryItem {
  id: string;
  date: string;
  count: number;
  maxMagnitude: number;
}

/**
 * Çok katmanlı analiz sonuçları
 */
export interface MultiLayerAnalysisResult {
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;

  // Bileşen skorları
  geometricAnomaly: number; // 0-100
  magneticDeviation: number; // 0-100
  plantStress: number; // 0-100
  signalAttenuation: number; // 0-100
  topographicSuitability: number; // 0-100

  // Final skor
  finalAnomalyScore: number; // 0-100
  anomalyLevel: "düşük" | "orta" | "yüksek";

  // Detaylı bulgular
  riskFactors: string[];
  recommendations: string[];

  // Metadata
  scanDuration: number; // milisaniye
  processedDataPoints: number;
}

/**
 * Hazine türü sınıflandırması
 */
export interface TreasureClassification {
  resourceType: string; // ResourceType enum
  probability: number; // 0-100
  depth: number; // Tahmini derinlik (metre)
  size: number; // Tahmini boyut (cm³)
  composition: string; // Malzeme tahmini
}

/**
 * Alan analiz başlık saklı yapısı
 */
export interface ScanSession {
  id: string;
  startTime: number;
  endTime?: number;
  location: {
    latitude: number;
    longitude: number;
  };
  status: "recording" | "processing" | "completed" | "failed";
  totalScans: number;
  analysisResults: MultiLayerAnalysisResult[];
}

// ============ VERİ TABANI TİPLERİ ============

/**
 * Subscription Planları
 */
export type SubscriptionPlan = "free" | "monthly" | "quarterly" | "annual";

export interface SubscriptionPlanDetail {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: {
    scansPerDay: number;
    maxScanDuration: number; // seconds
    customAnalysis: boolean;
    adminAccess: boolean;
  };
}

/**
 * Subscription Kaydı (Satın Alma)
 */
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: number;
  endDate: number;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Ödeme Kaydı
 */
export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "stripe" | "paypal" | "credit_card";
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  processedAt?: number;
}

/**
 * Dekont (Receipt) Kaydı - Ödeme Kanıtı
 */
export interface Receipt {
  id: string;
  userId: string;
  subscriptionId: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  fileName: string;
  fileUrl: string; // Yüklenen dosyanın URL'i
  fileSize: number; // Byte cinsinden
  mimeType: string; // image/jpeg, application/pdf vb.
  status: "pending" | "approved" | "rejected";
  approvedBy?: string; // Admin ID
  approvalNotes?: string;
  uploadedAt: number;
  approvedAt?: number;
  expiresAt?: number; // Onay geçerliliği
}

/**
 * Dekont Onaylama Request
 */
export interface ReceiptApprovalRequest {
  receiptId: string;
  status: "approved" | "rejected";
  notes?: string;
}

/**
 * Kullanıcı Profili (Güncellenmiş)
 */
export interface UserProfile {
  uid: string;
  username: string;
  phone: string;
  password?: string; // Hash'lenmiş, sadece server'da tutulur
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
  isAdmin: boolean;
  preferences: {
    theme: "light" | "dark";
    language: "tr" | "en";
    notifications: boolean;
  };
  statistics: {
    totalScans: number;
    totalScanTime: number; // milliseconds
    areasExplored: number;
  };
  subscription?: {
    plan: SubscriptionPlan;
    isActive: boolean;
    daysRemaining: number;
    endDate: number;
  };
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
}

/**
 * Register Response
 */
export interface RegisterResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  message?: string;
}

/**
 * Tarama Oturumu
 */
export interface FirestoreScanSession {
  id: string;
  userId: string;
  title: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  startedAt: number;
  completedAt?: number;
  status: "active" | "paused" | "completed" | "archived";
  satelliteImageUrl?: string;
  depth?: number;      // Metre cinsinden tarama derinliği
  area?: number;       // m² cinsinden tarama alanı
  measurements: MeasurementRequest[];
  anomalies: Detection[];
  notes: string;
  tags: string[];
}

/**
 * Raporlar
 */
export interface SavedReport {
  id: string;
  userId: string;
  sessionId: string;
  title: string;
  createdAt: number;
  location: {
    latitude: number;
    longitude: number;
  };
  summary: {
    totalMeasurements: number;
    anomalyCount: number;
    highestAnomalyScore: number;
    estimatedDepth: { min: number; max: number };
  };
  analysisResults: MultiLayerAnalysisResult[];
  treasureClassifications: TreasureClassification[];
  satelliteImageUrl?: string;
  exported: boolean;
}

/**
 * Favoriler
 */
export interface SavedLocation {
  id: string;
  userId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  createdAt: number;
  lastVisited?: number;
  tags: string[];
}

/**
 * Uydu Görüntüleri Önbelleği
 */
export interface SatelliteImageCache {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  imageUrl: string;
  source: "Landsat" | "Sentinel" | "USGS" | "Esri" | "Copernicus";
  cachedAt: number;
  expiresAt: number;
}

// ============ TARAMA SONUÇ ÖZELLİKLERİ ============

/**
 * Kamera Analizi Sonucu
 */
export interface CameraAnalysisResult {
  edgeDetected: boolean;
  edgeStrength: number;
  linesFound: number;
  symmetryScore: number;
  colorAnomalies: Array<{ color: string; anomalyLevel: number }>;
  textureAnalysis: {
    variance: number;
    roughness: number;
  };
  timestamp: number;
  frameCount: number;
}

/**
 * Manyetometre Analizi Sonucu
 */
export interface MagnetometerResult {
  readings: Array<{
    timestamp: number;
    x: number;
    y: number;
    z: number;
    total: number;
  }>;
  baselineAverage: number;
  maxDeviation: number;
  anomalyDetected: boolean;
  anomalyConfidence: number;
  noiseLevel: number;
  calibrationStatus: "good" | "fair" | "poor";
}

/**
 * Hazine Tespiti Sonucu
 */
export interface TreasureDetectionResult {
  detected: boolean;
  confidence: number;
  resourceType: string;
  estimatedDepth: number;
  estimatedSize: number;
  composition: string;
  trend: "increasing" | "decreasing" | "stable";
  detections: Array<{
    timestamp: number;
    latitude: number;
    longitude: number;
    intensity: number;
  }>;
}

/**
 * Harita Tespitleri Sonucu
 */
export interface MapDetectionsResult {
  totalDetections: number;
  hotspots: Array<{
    latitude: number;
    longitude: number;
    intensity: number;
    radius: number;
  }>;
  clusterCount: number;
  mapImageUrl?: string;
}

/**
 * Tarama Geçmişi Verisi
 */
export interface ScanHistoryResult {
  totalMeasurements: number;
  averageReading: number;
  maxReading: number;
  minReading: number;
  timeRange: { start: number; end: number };
  readings: Array<{ timestamp: number; value: number }>;
}

/**
 * AR Görüntü Analizi
 */
export interface ARAnalysisResult {
  detected: boolean;
  markerCount: number;
  confidence: number;
  overlayData: Array<{
    x: number;
    y: number;
    type: string;
    intensity: number;
  }>;
  frameData: {
    width: number;
    height: number;
    processedFrames: number;
  };
}

/**
 * Radar Tarama Sonucu
 */
export interface RadarScanResult {
  activityScore: number;
  anomalyRings: Array<{
    angle: number;
    radius: number;
    intensity: number;
  }>;
  directionalAnomalies: { angle: number; strength: number }[];
  peakDirections: number[];
  scanQuality: number;
}

/**
 * 3D Görüntüleme Sonucu
 */
export interface Viewer3DResult {
  modelGenerated: boolean;
  depth: number;
  areaRadius: number;
  density: number;
  anomalyCount: number;
  depthProfile: Array<{ depth: number; intensity: number }>;
  layerAnalysis: Array<{
    layer: number;
    composition: string;
    intensity: number;
  }>;
}

/**
 * Uydu Analizi Sonucu
 */
export interface SatelliteAnalysisResult {
  imageUrl: string;
  timestamp: string;
  source: string;
  colorAnalysis: {
    dominantColors: string[];
    spectralAnomalies: boolean;
  };
  vegetationIndex?: number;
  moistureIndex?: number;
  thermalData?: {
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
  };
}

/**
 * Alan Tarama Sonucu (AreaScanner)
 */
export interface AreaScanResult {
  gridResolution: number;
  totalCells: number;
  anomalousCells: number;
  heatmapUrl?: string;
  peakLocations: Array<{
    gridX: number;
    gridY: number;
    intensity: number;
  }>;
  scanType: string;
  coverage: number;
}

/**
 * Yapı Tarayıcı Sonucu
 */
export interface StructureScanResult {
  structuresFound: Array<{
    type: string;
    category: string;
    depth: number;
    confidence: number;
    description: string;
  }>;
  totalStructures: number;
  dominantType: string;
  analysisNotes: string;
}

/**
 * Gelişmiş Analitik Sonucu
 */
export interface AdvancedAnalyticsResult {
  magneticFieldMap: Array<{
    x: number;
    y: number;
    intensity: number;
  }>;
  peakDetections: Array<{
    location: { lat: number; lon: number };
    magnitude: number;
  }>;
  gradientAnalysis: {
    maxGradient: number;
    avgGradient: number;
  };
  spectralAnalysis: {
    dominantFrequency: number;
    powerSpectrum: number[];
  };
  field3DAnalysis: {
    vectorField: Array<{ x: number; y: number; z: number }>;
    volumetricIntensity: number;
  };
}

/**
 * Topografya Analizi Sonucu
 */
export interface TopographyResult {
  elevationDifference: number;
  slopeAverage: number;
  slopeMax: number;
  reliefEnergy: number;
  waterProximity: number;
  suitabilityScore: number;
}

/**
 * Bitki Analizi Sonucu
 */
export interface VegetationResult {
  greenIntensity: number;
  ndviValue: number;
  plantHealthScore: number;
  stressLevel: number;
  colorSegmentation: {
    healthyArea: number;
    stressedArea: number;
    deadArea: number;
  };
}

/**
 * Sinyal Analizi Sonucu
 */
export interface SignalAnalysisResult {
  wifiSignalStrength: number;
  gsmSignalStrength: number;
  lteSignalStrength: number;
  signalStability: number;
  deadZonesDetected: boolean;
  attenuationMap: Array<{
    location: { lat: number; lon: number };
    attenuation: number;
  }>;
}

// ============ YENİ ÖZELLIK SONUÇLARI ============

/**
 * Okyanus Analizi Sonucu
 */
export interface OceanAnalysisResult {
  waterDepth: number;
  saltConcentration: number;
  currentSpeed: number;
  temperature: number;
}

/**
 * İklim Verileri Sonucu
 */
export interface ClimateDataResult {
  temperature: number;
  humidity: number;
  pressure: number;
  windDirection: number;
}

/**
 * Rüzgar Analizi Sonucu
 */
export interface WindAnalysisResult {
  speed: number;
  direction: number;
  strength: number;
  gusts: number;
}

/**
 * Termal Enerji Sonucu
 */
export interface ThermalEnergyResult {
  maxTemp: number;
  avgTemp: number;
  minTemp: number;
  energyPotential: number;
}

/**
 * Toprak Bileşimi Sonucu
 */
export interface SoilCompositionResult {
  pH: number;
  mineralDensity: number;
  organicContent: number;
  carbonContent: number;
}

/**
 * Mikroorganizmalar Sonucu
 */
export interface MicroorganismsResult {
  bacteriaCount: number;
  fungalCount: number;
  biologicalActivity: number;
  diversity: number;
}

/**
 * Radyoaktivite Sonucu
 */
export interface RadioactivityResult {
  radiationLevel: number;
  dominantElement: string;
  halfLife: number;
  risk: string;
}

/**
 * Görüntü İşleme Sonucu
 */
export interface VisionAnalysisResult {
  objectCount: number;
  avgConfidence: number;
  classesDetected: number;
  processingTime: number;
}

/**
 * Basınç Haritalama Sonucu
 */
export interface PressureMappingResult {
  maxPressure: number;
  avgPressure: number;
  cavitiesDetected: number;
  pressureVariance: number;
}

/**
 * Zaman Serisi Analizi Sonucu
 */
export interface TimeSeriesAnalysisResult {
  dataPoints: number;
  trend: string;
  volatility: number;
  forecastAccuracy: number;
}

/**
 * Hacimsel Ölçüm Sonucu
 */
export interface VolumetricMeasurementResult {
  totalVolume: number;
  anomalyVolume: number;
  voidRatio: number;
  accuracy: number;
}

/**
 * Yerçekimi Alanı Sonucu
 */
export interface GravitationalFieldResult {
  dominantAnomaly: number;
  densityContrast: number;
  anomalyStrength: number;
  gravityGradient: number;
}

/**
 * Sismik Aktivite Sonucu
 */
export interface SeismicActivityResult {
  lastMagnitude: number;
  faultCount: number;
  depth: number;
  risk: number;
}

/**
 * Ağ Analizi Sonucu
 */
export interface NetworkAnalysisResult {
  nodeCount: number;
  edgeCount: number;
  connectionDensity: number;
  centrality: number;
}

/**
 * Arkeoloji Veritabanı Sonucu
 */
export interface ArcheologyDatabaseResult {
  recordedFindings: number;
  culturalHeritage: number;
  historicalPeriods: number;
  siteSignificance: number;
}

// ============ HAZİNE ARAMA ÖZELLIKLERI ============

/**
 * Hazine Odaları Sonucu
 */
export interface TreasureChambersResult {
  detected: boolean;
  chambersFound: number;
  totalVolume: number;
  averageDepth: number;
  estimatedAge: number;
  constructionType: string;
  chambers: Array<{
    id: number;
    name: string;
    volume: number;
    depth: number;
    width: number;
    length: number;
    contents: string;
    condition: string;
  }>;
  preservationScore: number;
}

/**
 * Yeraltı Yapıları Sonucu
 */
export interface UndergroundStructuresResult {
  structuresDetected: boolean;
  totalStructures: number;
  structureCount: number;
  types: {
    walls: number;
    pillars: number;
    passages: number;
    vaults: number;
  };
  structures: Array<any>;
  overallIntegrity: number;
}

/**
 * Su Kanalları Sonucu
 */
export interface WaterChannelsResult {
  detected: boolean;
  channelsFound: number;
  totalLength: number;
  waterPresence: boolean;
  waterType: string;
  channels: Array<{
    id: number;
    depth: number;
    width: number;
    length: number;
    direction: string;
    waterFlow: number;
  }>;
  flowRate: number;
}

/**
 * Girişler Sonucu
 */
export interface EntrancesResult {
  detected: boolean;
  entrancesFound: number;
  entrances: Array<{
    id: number;
    latitude: number;
    longitude: number;
    type: string;
    width: number;
    height: number;
    depth: number;
    sealed: boolean;
    condition: string;
  }>;
  mainEntranceCoords: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Metal Yatakları Sonucu
 */
export interface MetalDepositsResult {
  detected: boolean;
  depositsFound: number;
  deposits: Array<{
    id: number;
    metal: string;
    quantity: number;
    purity: number;
    depth: number;
    concentration: number;
    value: number;
  }>;
  totalEstimatedValue: number;
}

/**
 * İçerik Analizi Sonucu
 */
export interface ContentAnalysisResult {
  organicMatter: number;
  mineralContent: number;
  metalContent: number;
  ceramicFragments: number;
  boneMaterial: number;
  textileRemains: number;
  artifacts: Array<{
    id: number;
    type: string;
    era: string;
    condition: number;
    estimatedAge: number;
  }>;
  sampleQuality: number;
}

/**
 * Jeoloji Analizi Sonucu
 */
export interface GeologyAnalysisResult {
  dominantRock: string;
  soilComposition: {
    clay: number;
    silt: number;
    sand: number;
  };
  mineralDeposits: string;
  faulting: number;
  fracturing: number;
  stabilityRating: number;
}

/**
 * Ses Analizi Sonucu
 */
export interface SoundAnalysisResult {
  voidDetected: boolean;
  voidVolume: number;
  resonanceFrequency: number;
  echoPower: number;
  anomalies: Array<{
    id: number;
    frequency: number;
    intensity: number;
    location: {
      lat: number;
      lon: number;
    };
  }>;
  materialDensity: number;
}

/**
 * Termal Haritalama Sonucu
 */
export interface ThermalMappingResult {
  averageTemperature: number;
  temperatureVariance: number;
  hotSpots: Array<{
    id: number;
    latitude: number;
    longitude: number;
    temperature: number;
    radius: number;
    intensity: number;
  }>;
  geothermalActivity: number;
  anomalyScore: number;
}

/**
 * Artefakt Tespiti Sonucu
 */
export interface ArtifactDetectionResult {
  artifactsDetected: boolean;
  totalArtifacts: number;
  artifacts: Array<{
    id: number;
    name: string;
    material: string;
    estimatedValue: number;
    era: number;
    condition: number;
    rarity: number;
  }>;
  estimatedTotalValue: number;
  archaeologicalSignificance: number;
}

/**
 * Harita Görselleştirmesi Sonucu
 */
export interface MapVisualizationResult {
  gridSize: number;
  anomalyPoints: Array<{
    x: number;
    y: number;
    intensity: number;
    type: string;
  }>;
  scale: number;
}

/**
 * Komprehensif Tarama Sonuç Verisi
 */
export interface ComprehensiveScanResult {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: number;
  duration: number; // milliseconds
  depth?: number;  // Metre cinsinden tarama derinliği
  area?: number;   // m² cinsinden tarama alanı

  // Tüm feature sonuçları
  features: {
    camera?: CameraAnalysisResult;
    magnetometer?: MagnetometerResult;
    treasureDetection?: TreasureDetectionResult;
    mapDetections?: MapDetectionsResult;
    scanHistory?: ScanHistoryResult;
    arAnalysis?: ARAnalysisResult;
    radarScan?: RadarScanResult;
    viewer3D?: Viewer3DResult;
    satelliteAnalysis?: SatelliteAnalysisResult;
    areaScan?: AreaScanResult;
    structureScan?: StructureScanResult;
    advancedAnalytics?: AdvancedAnalyticsResult;
    topography?: TopographyResult;
    vegetation?: VegetationResult;
    signalAnalysis?: SignalAnalysisResult;
    oceanAnalysis?: OceanAnalysisResult;
    climateData?: ClimateDataResult;
    windAnalysis?: WindAnalysisResult;
    thermalEnergy?: ThermalEnergyResult;
    soilComposition?: SoilCompositionResult;
    microorganisms?: MicroorganismsResult;
    radioactivity?: RadioactivityResult;
    visionAnalysis?: VisionAnalysisResult;
    pressureMapping?: PressureMappingResult;
    timeSeriesAnalysis?: TimeSeriesAnalysisResult;
    volumetricMeasurement?: VolumetricMeasurementResult;
    gravitationalField?: GravitationalFieldResult;
    seismicActivity?: SeismicActivityResult;
    networkAnalysis?: NetworkAnalysisResult;
    archeologyDatabase?: ArcheologyDatabaseResult;
    treasureChambers?: TreasureChambersResult;
    undergroundStructures?: UndergroundStructuresResult;
    waterChannels?: WaterChannelsResult;
    entrances?: EntrancesResult;
    metalDeposits?: MetalDepositsResult;
    contentAnalysis?: ContentAnalysisResult;
    geologyAnalysis?: GeologyAnalysisResult;
    soundAnalysis?: SoundAnalysisResult;
    thermalMapping?: ThermalMappingResult;
    artifactDetection?: ArtifactDetectionResult;
    mapVisualization?: MapVisualizationResult;
    treasureCatalog?: any;
    valuableMineral?: any;
    roomsAndTunnels?: any;
    doorsAndEntrances?: any;
    progressionMap?: any;
    waterCanals?: any;
    trapsAndSecurity?: any;
    spiritualEnergyDetection?: any;
  };

  // Özet
  overallAnomalyScore: number;
  recommendedAction: string;
  notes?: string;
  tags: string[];
}
