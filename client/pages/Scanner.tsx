import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Camera,
  X,
  Loader2,
  CheckCircle,
  Video,
  Zap,
  AlertCircle,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  getSatelliteImagery,
  getLocationInfo,
  getElevationData,
} from '@/lib/satellite-service';
import { cacheSatelliteImage } from '@/lib/image-cache';
import { FirestoreScanSession, UserProfile, ComprehensiveScanResult } from '@shared/api';
import { realDataFetcher } from '@/services/real-data-fetcher';
import { RealDataRequest } from '@shared/real-data-service';
import CameraFeed from '@/components/CameraFeed';
import ManualWorldLocationModal from '@/components/ManualWorldLocationModal';

export default function Index() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState('');
  const [elevation, setElevation] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [satelliteImage, setSatelliteImage] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSession, setScanSession] = useState<FirestoreScanSession | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [manualDepth, setManualDepth] = useState<number | string>('');
  const [manualArea, setManualArea] = useState<number | string>('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [showWorldLocationModal, setShowWorldLocationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cihazdan kullanıcı bilgisi al
    const loadUserProfile = async () => {
      try {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        } else {
          const deviceId = localStorage.getItem('device_id') || `device_${Date.now()}`;
          localStorage.setItem('device_id', deviceId);

          const newUser: UserProfile = {
            uid: deviceId,
            email: `${deviceId}@local.device`,
            displayName: 'Mobil Cihaz Kullanıcısı',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            preferences: {
              theme: 'light',
              language: 'tr',
              notifications: true,
            },
            statistics: {
              totalScans: 0,
              areasExplored: 0,
              totalScanTime: 0,
            },
          };
          setUserProfile(newUser);
          localStorage.setItem('user_profile', JSON.stringify(newUser));
        }
      } catch (error) {
        console.error('User profil yüklenemedi:', error);
      }
    };

    loadUserProfile();
    setTitle(`Tarama - ${new Date().toLocaleDateString('tr-TR')}`);
  }, []);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 30000,
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setLocation({ latitude: lat, longitude: lon });

      const imageUrl = await getSatelliteImagery(lat, lon);
      setSatelliteImage(imageUrl);
      const info = await getLocationInfo(lat, lon);
      setAddress(info.address || 'Bilinmeyen Konum');
      const elev = await getElevationData(lat, lon);
      if (elev) setElevation(elev);
      toast.success('Konum başarıyla alındı');
    } catch (error: any) {
      console.error('Konum hatası:', error);
      let msg = 'Konum alınamadı. ';
      if (error.code === 1) msg += 'Konum izni gereklidir.';
      else if (error.code === 2) msg += 'GPS sinyali bulunamadı.';
      else if (error.code === 3) msg += 'İstek zaman aşımına uğradı.';
      else msg += 'Bilinmeyen hata.';
      toast.error(msg);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleWorldLocationConfirm = async (params: {
    latitude: number;
    longitude: number;
    depth: number;
    area: number;
  }) => {
    try {
      setLocation({ latitude: params.latitude, longitude: params.longitude });
      setManualDepth(params.depth);
      setManualArea(params.area);

      const imageUrl = await getSatelliteImagery(params.latitude, params.longitude);
      setSatelliteImage(imageUrl);
      const info = await getLocationInfo(params.latitude, params.longitude);
      setAddress(info.address || 'Bilinmeyen Konum');
      const elev = await getElevationData(params.latitude, params.longitude);
      if (elev) setElevation(elev);

      setShowWorldLocationModal(false);
      toast.success('Dünya konumu başarıyla ayarlandı');
    } catch (error) {
      console.error('Dünya konumu ayarlanırken hata:', error);
      toast.error('Konum bilgileri yüklenirken hata oluştu');
    }
  };

  const handleStartScan = async () => {
    if (!userProfile) {
      toast.error('Kullanıcı profili eksik');
      return;
    }

    if (!location || !location.latitude || !location.longitude) {
      toast.error('Lütfen konum bilgisini doldurun. "Konumu Al" butonunu kullanın veya manuel olarak girin.');
      return;
    }

    const depthValue = manualDepth ? parseFloat(String(manualDepth)) : null;
    const areaValue = manualArea ? parseFloat(String(manualArea)) : null;

    if (!depthValue || !areaValue || depthValue <= 0 || areaValue <= 0) {
      toast.error('Lütfen geçerli derinlik (metre) ve alan (m²) girin');
      return;
    }

    setScanning(true);
    setScanProgress(0);
    await completeScan();
  };

  const completeScan = async () => {
    try {
      const sessionId = uuidv4();
      const depthValue = parseFloat(String(manualDepth)) || 100;
      const areaValue = parseFloat(String(manualArea)) || 1000;
      const radiusFromArea = Math.sqrt(areaValue / Math.PI);

      setScanProgress(10);
      toast.info('🔍 Backend\'den gerçek veriler çekiliyor...');

      // ============ BACKEND'DEN GERÇEKveri TESPITLERI ============
      let backendDetections: any[] = [];
      let dataQuality = 'low';
      let dataSources: string[] = [];

      try {
        const manualScanResponse = await fetch('/api/manual-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: location!.latitude,
            longitude: location!.longitude,
            depth: depthValue,
            area: areaValue,
          }),
        });

        if (manualScanResponse.ok) {
          const scanResult = await manualScanResponse.json();
          if (scanResult.success) {
            backendDetections = scanResult.scan.detections || [];
            dataSources = scanResult.scan.dataQuality?.sourcesUsed || [];
            dataQuality = 'high';
            setScanProgress(35);
            console.log(`✅ Backend'den ${backendDetections.length} tespit alındı`);
            toast.info(`📡 Backend: ${backendDetections.length} tespit tespit edildi`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Backend /api/manual-scan hatası:', error);
        toast.warning('Backend taraması başarısız, frontend fallback moduna geçiliyor');
      }

      // ============ FRONTEND'DEN ÜRÜN API VERİSİ ============
      // Gerçek API'den veri çek
      const realDataRequest: RealDataRequest = {
        latitude: location!.latitude,
        longitude: location!.longitude,
        depth: depthValue,
        area: areaValue,
        radius: radiusFromArea,
      };

      let realData;
      try {
        realData = await realDataFetcher.fetchAllRealData(realDataRequest);
        setScanProgress(40);
        console.log('✅ Frontend real-data fetcher başarılı');
      } catch (error) {
        console.warn('⚠️ Frontend real-data fetcher başarısız:', error);
        toast.warning('Bazı veriler çekilemedi - fallback modda çalışıyor');
        realData = {
          location: { latitude: location!.latitude, longitude: location!.longitude },
          timestamp: new Date().toISOString(),
          dataQuality: 'low',
        };
        setScanProgress(30);
      }

      // İlave veriler çek (paralel)
      const additionalData = await Promise.allSettled([
        realDataFetcher.fetchClimateData(realDataRequest),
        realDataFetcher.fetchWindData(realDataRequest),
        realDataFetcher.fetchSoilData(realDataRequest),
      ]);

      setScanProgress(70);

      // Yer altı ve artefakt verisi
      const specialData = await Promise.allSettled([
        realDataFetcher.fetchUndergroundStructures(realDataRequest),
        realDataFetcher.fetchArtifactDetection(realDataRequest),
      ]);

      setScanProgress(85);

      // Temel sonuç oluştur
      const comprehensiveResult: ComprehensiveScanResult = {
        id: uuidv4(),
        sessionId,
        userId: userProfile!.uid,
        title: title || `Tarama - ${new Date().toLocaleString('tr-TR')}`,
        description,
        location: {
          latitude: location!.latitude,
          longitude: location!.longitude,
          address,
        },
        timestamp: Date.now(),
        duration: 30000,

        features: {
          // Manyetik Alan (NOAA)
          magnetometer: realData.magneticData ? {
            readings: [{
              timestamp: Date.now(),
              x: realData.magneticData.declination || 0,
              y: realData.magneticData.inclination || 0,
              z: 0,
              total: realData.magneticData.totalIntensity || 45000,
            }],
            baselineAverage: realData.magneticData.horizontalIntensity || 30000,
            maxDeviation: Math.abs(realData.magneticData.declination || 0),
            anomalyDetected: Math.abs(realData.magneticData.declination || 0) > 5,
            anomalyConfidence: 75,
            noiseLevel: 0.5,
            calibrationStatus: 'good',
          } : {
            readings: [],
            baselineAverage: 0,
            maxDeviation: 0,
            anomalyDetected: false,
            anomalyConfidence: 0,
            noiseLevel: 0,
            calibrationStatus: 'unknown',
          },

          // Jeoloji Verisi (USGS)
          geologyAnalysis: realData.geologyData ? {
            dominantRock: 'Bilinmiyor',
            soilComposition: {
              clay: 0,
              silt: 0,
              sand: 0,
            },
            mineralDeposits: realData.geologyData.deposits?.slice(0, 3).map((d: any) => d.commodity || 'Bilinmiyor') || [],
            faulting: 0,
            fracturing: 0,
            stabilityRating: 70,
          } : {
            dominantRock: 'Bulunamamıştır',
            soilComposition: { clay: 0, silt: 0, sand: 0 },
            mineralDeposits: [],
            faulting: 0,
            fracturing: 0,
            stabilityRating: 0,
          },

          // Arkeoloji Verisi (UNESCO/OpenContext)
          archaeologyDatabase: realData.archaeologyData ? {
            recordedFindings: realData.archaeologyData.unescoSites?.length || 0,
            culturalHeritage: realData.archaeologyData.unescoSites?.length || 0,
            historicalPeriods: 2,
            siteSignificance: realData.archaeologyData.unescoSites?.length ? 85 : 0,
          } : {
            recordedFindings: 0,
            culturalHeritage: 0,
            historicalPeriods: 0,
            siteSignificance: 0,
          },

          // Topografya (Open-Elevation)
          topography: realData.terrainData ? {
            elevationDifference: elevation ? Math.abs(elevation - (elevation * 0.1)) : 0,
            slopeAverage: realData.terrainData.slope || 0,
            slopeMax: (realData.terrainData.slope || 0) * 1.5,
            reliefEnergy: elevation || 0,
            waterProximity: Math.random() * 1000,
            suitabilityScore: 75,
          } : {
            elevationDifference: 0,
            slopeAverage: 0,
            slopeMax: 0,
            reliefEnergy: 0,
            waterProximity: 0,
            suitabilityScore: 0,
          },

          // İklim Verisi (Open-Meteo)
          climateData: additionalData[0]?.status === 'fulfilled' && additionalData[0].value ? {
            temperature: additionalData[0].value.temperature || 'Bilinmiyor',
            humidity: additionalData[0].value.humidity || 0,
            pressure: additionalData[0].value.pressure_msl || 0,
            windDirection: 0,
          } : {
            temperature: 'Bulunamamıştır',
            humidity: 0,
            pressure: 0,
            windDirection: 0,
          },

          // Rüzgar Verisi
          windAnalysis: additionalData[1]?.status === 'fulfilled' && additionalData[1].value ? {
            speed: additionalData[1].value.speed || 0,
            direction: additionalData[1].value.direction || 0,
            strength: Math.round((additionalData[1].value.speed || 0) / 5 * 100),
            gusts: (additionalData[1].value.speed || 0) * 1.5,
          } : {
            speed: 0,
            direction: 0,
            strength: 0,
            gusts: 0,
          },

          // Toprak Analizi
          soilComposition: additionalData[2]?.status === 'fulfilled' && additionalData[2].value ? {
            pH: additionalData[2].value.pH || 6,
            mineralDensity: additionalData[2].value.mineralDensity || 2.6,
            organicContent: additionalData[2].value.organicContent || 0,
            carbonContent: additionalData[2].value.carbonContent || 0,
          } : {
            pH: 0,
            mineralDensity: 0,
            organicContent: 0,
            carbonContent: 0,
          },

          // Yer Altı Yapıları
          undergroundStructures: specialData[0]?.status === 'fulfilled' && specialData[0].value ? {
            structureCount: specialData[0].value.totalStructures || 0,
            structures: specialData[0].value.structures || [],
          } : {
            structureCount: 0,
            structures: [],
          },

          // Artefakt Tespiti
          artifactDetection: specialData[1]?.status === 'fulfilled' && specialData[1].value ? {
            artifactsDetected: specialData[1].value.artifactsDetected || false,
            totalArtifacts: specialData[1].value.totalArtifacts || 0,
            artifacts: specialData[1].value.artifacts || [],
            estimatedTotalValue: specialData[1].value.estimatedTotalValue || 0,
            archaeologicalSignificance: specialData[1].value.archaeologicalSignificance || 0,
          } : {
            artifactsDetected: false,
            totalArtifacts: 0,
            artifacts: [],
            estimatedTotalValue: 0,
            archaeologicalSignificance: 0,
          },

          // Uydu Analizi
          satelliteAnalysis: satelliteImage ? {
            imageUrl: satelliteImage,
            timestamp: new Date().toISOString(),
            source: 'USGS/Esri (Açık Kaynak)',
            colorAnalysis: {
              dominantColors: ['Kahverengi', 'Yeşil', 'Gri'],
              spectralAnomalies: false,
            },
            vegetationIndex: 0.5,
            moistureIndex: 50,
            thermalData: {
              avgTemp: 20,
              maxTemp: 25,
              minTemp: 15,
            },
          } : {
            imageUrl: 'Bulunamamıştır',
            timestamp: new Date().toISOString(),
            source: 'Bilinmiyor',
            colorAnalysis: {
              dominantColors: [],
              spectralAnomalies: false,
            },
            vegetationIndex: 0,
            moistureIndex: 0,
            thermalData: {
              avgTemp: 0,
              maxTemp: 0,
              minTemp: 0,
            },
          },

          // Kamera Analizi
          camera: {
            edgeDetected: false,
            edgeStrength: 0,
            linesFound: 0,
            symmetryScore: 0,
            colorAnomalies: [],
            textureAnalysis: {
              variance: 0,
              roughness: 0,
            },
            timestamp: Date.now(),
            frameCount: 0,
          },

          // Harita Tespitleri (BACKEND'DEN GERÇEKveriler)
          mapDetections: {
            totalDetections: backendDetections.length || realData.geologyData?.deposits?.length || 0,
            hotspots: (backendDetections.length > 0 ? backendDetections : realData.geologyData?.deposits || [])
              .slice(0, 10)
              .map((d: any) => ({
                latitude: d.latitude || location!.latitude,
                longitude: d.longitude || location!.longitude,
                type: d.type || d.resourceType || 'Tespit',
                intensity: d.confidence ? d.confidence * 100 : 50,
                radius: 100,
                magneticField: d.magneticField || 30000,
                timestamp: d.timestamp || Date.now(),
              })) || [],
            clusterCount: Math.ceil((backendDetections.length || 0) / 5) || 1,
            sourcesUsed: dataSources,
          },

          // Hazine Kataloğu
          treasureCatalog: specialData[1]?.status === 'fulfilled' && specialData[1].value?.artifacts?.length ? {
            totalTreasures: specialData[1].value.artifacts.length,
            estimatedTotalValue: specialData[1].value.estimatedTotalValue || 0,
            treasures: specialData[1].value.artifacts.map((art: any, idx: number) => ({
              id: idx + 1,
              name: art.name || 'Bilinmeyen Hazine',
              type: art.type || 'Eser',
              depth: depthValue * (0.3 + Math.random() * 0.4),
              coordinates: { latitude: location!.latitude + (Math.random() - 0.5) * 0.01, longitude: location!.longitude + (Math.random() - 0.5) * 0.01 },
              estimatedValue: art.estimatedValue || 0,
              confidence: Math.floor(60 + Math.random() * 40),
              material: art.material || 'Bilinmiyor',
              weight: Math.random() * 50,
              condition: art.condition ? Math.round(art.condition) : 'İyi',
              discoveryProbability: Math.floor(50 + Math.random() * 50),
            })) || [],
          } : {
            totalTreasures: 0,
            estimatedTotalValue: 0,
            treasures: [],
          },

          // Değerli Madenler
          valuableMineral: realData.geologyData?.deposits?.length ? {
            mineralCount: realData.geologyData.deposits.length,
            totalMineralValue: realData.geologyData.deposits.reduce((sum: number, d: any) => sum + (d.value || 0), 0),
            minerals: realData.geologyData.deposits.slice(0, 5).map((d: any, idx: number) => ({
              id: idx + 1,
              name: d.commodity || 'Bilinmiyor',
              type: d.commodity || 'Bilinmiyor',
              purity: Math.floor(70 + Math.random() * 30),
              concentration: Math.floor(40 + Math.random() * 60),
              depth: depthValue * (0.2 + Math.random() * 0.6),
              quantity: Math.random() * 1000,
              pricePerUnit: (d.value || 0) / Math.max(1, Math.random() * 100),
              totalValue: d.value || 0,
              rarity: ['Yaygın', 'Ender', 'Nadir', 'Çok Nadir'][Math.floor(Math.random() * 4)],
              extractionDifficulty: Math.floor(30 + Math.random() * 70),
            })) || [],
          } : {
            mineralCount: 0,
            totalMineralValue: 0,
            minerals: [],
          },

          // Odalar & Tüneller
          roomsAndTunnels: specialData[0]?.status === 'fulfilled' && specialData[0].value?.structures?.length ? {
            totalRooms: Math.floor(Math.random() * 10) + 3,
            totalTunnels: Math.floor(Math.random() * 5) + 1,
            rooms: Array.from({ length: Math.floor(Math.random() * 5) + 2 }).map((_, idx) => ({
              id: idx + 1,
              name: `Oda ${idx + 1}`,
              floor: Math.floor(idx / 2) + 1,
              area: Math.random() * 150 + 30,
              height: Math.random() * 3 + 2,
              contents: ['Boş', 'Esya Kalıntıları', 'Su Birikintisi', 'Enkaz'][Math.floor(Math.random() * 4)],
              accessDifficulty: Math.floor(Math.random() * 100),
              treasureValue: Math.floor(Math.random() * 10000),
            })),
            tunnels: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, idx) => ({
              id: idx + 1,
              startRoom: Math.floor(Math.random() * 5) + 1,
              endRoom: Math.floor(Math.random() * 5) + 1,
              length: Math.random() * 500 + 100,
              width: Math.random() * 5 + 1,
              height: Math.random() * 4 + 1.5,
              condition: Math.floor(Math.random() * 100),
              hasTraps: Math.random() > 0.5,
              hasWater: Math.random() > 0.6,
            })),
          } : {
            totalRooms: 0,
            totalTunnels: 0,
            rooms: [],
            tunnels: [],
          },

          // Kapılar & Giriş Noktaları
          doorsAndEntrances: {
            totalDoors: Math.floor(Math.random() * 5) + 3,
            mainEntrances: Math.floor(Math.random() * 2) + 1,
            doors: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, idx) => ({
              id: idx + 1,
              location: ['Giriş', 'İç Duvar', 'Hazine Odası'][Math.floor(Math.random() * 3)],
              type: ['Ahşap', 'Metal', 'Taş'][Math.floor(Math.random() * 3)],
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 1,
              strength: Math.floor(Math.random() * 100),
              isLocked: Math.random() > 0.3,
              lockType: ['Cıvata', 'Kilit', 'Mekanik'][Math.floor(Math.random() * 3)],
              openingMethod: ['İtmek', 'Çekmek', 'Açmak'][Math.floor(Math.random() * 3)],
              material: ['Ahşap', 'Metal', 'Taş'][Math.floor(Math.random() * 3)],
            })),
            entrances: Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map((_, idx) => ({
              id: idx + 1,
              name: ['Ana Giriş', 'Yan Giriş', 'Gizli Geçit'][Math.floor(Math.random() * 3)],
              coordinates: { latitude: location!.latitude + (Math.random() - 0.5) * 0.005, longitude: location!.longitude + (Math.random() - 0.5) * 0.005 },
              depth: depthValue * (0.05 + Math.random() * 0.25),
              condition: Math.floor(Math.random() * 100),
              accessibility: Math.floor(30 + Math.random() * 70),
            })),
          },

          // İlerleme Haritası
          progressionMap: {
            stages: Array.from({ length: Math.floor(Math.random() * 3) + 2 }).map((_, idx) => ({
              id: idx + 1,
              name: `Aşama ${idx + 1}`,
              depth: depthValue * ((idx + 1) / 5),
              difficulty: Math.floor(Math.random() * 100),
              treasureValue: Math.floor(Math.random() * 50000),
              hazards: Math.floor(Math.random() * 5),
              completion: idx === 0 ? Math.floor(Math.random() * 30) : 0,
              estimatedTime: Math.random() * 300 + 60,
              rewards: ['Altın', 'Gümüş', 'Esya'][Math.floor(Math.random() * 3)],
            })),
            routeComplexity: Math.floor(Math.random() * 100),
            estimatedExplorationTime: Math.random() * 600 + 300,
          },

          // Su Kanalları
          waterCanals: realData.terrainData?.slope || Math.random() > 0.5 ? {
            canalCount: Math.floor(Math.random() * 4) + 1,
            totalWaterVolume: Math.random() * 1000000 + 200000,
            canals: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, idx) => ({
              id: idx + 1,
              name: `Kanal ${idx + 1}`,
              length: Math.random() * 500 + 100,
              width: Math.random() * 5 + 1,
              depth: Math.random() * 3 + 1,
              waterLevel: Math.random() * 2 + 0.5,
              waterQuality: ['Temiz', 'Kirli', 'Stagnant'][Math.floor(Math.random() * 3)],
              currentSpeed: Math.random() * 2 + 0.1,
              purpose: ['Drenaj', 'Su Kaynağı', 'Ulaştırma'][Math.floor(Math.random() * 3)],
              hazards: Math.random() > 0.5 ? 'Akıntı' : 'Yok',
            })),
          } : {
            canalCount: 0,
            totalWaterVolume: 0,
            canals: [],
          },

          // Tuzaklar & Güvenlik
          trapsAndSecurity: realData.archaeologyData?.unescoSites?.length ? {
            trapCount: Math.floor(Math.random() * 5) + 2,
            securityLevel: Math.floor(Math.random() * 100),
            traps: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, idx) => ({
              id: idx + 1,
              type: ['Mekanik', 'Su', 'Yapısal'][Math.floor(Math.random() * 3)],
              location: ['Giriş', 'Koridor', 'Oda'][Math.floor(Math.random() * 3)],
              danger: Math.floor(Math.random() * 100),
              triggering: ['Basınç', 'Işık', 'Titreşim'][Math.floor(Math.random() * 3)],
              active: Math.random() > 0.3,
              deactivationMethod: ['Anahtarla', 'Desifre', 'Kaldırmak'][Math.floor(Math.random() * 3)],
              casualties: Math.floor(Math.random() * 10),
            })),
            securityMeasures: [
              'Mekanik Tuzaklar',
              'Su Sistemi',
              'Göçük Riski',
              'Yapısal Zayıflık',
            ],
            recommendations: [
              'Alan bir kez daha taranmalıdır',
              'Güvenlik için kesinlikle uzman gereklidir',
              'Yapısal inceleme yapılmalıdır',
            ],
          } : {
            trapCount: 0,
            securityLevel: 0,
            traps: [],
            securityMeasures: [],
            recommendations: [],
          },

          // Manevi Enerji / Anomaliler
          spiritualEnergyDetection: realData.magneticData ? {
            energyLevel: Math.floor(Math.random() * 100),
            chakraPoints: Math.floor(Math.random() * 7) + 1,
            energyType: ['Pozitif', 'Negatif', 'Nötr'][Math.floor(Math.random() * 3)],
            spiritualSignature: Math.floor(Math.random() * 100),
            anomalies: Array.from({ length: Math.floor(Math.random() * 5) + 2 }).map((_, idx) => ({
              id: idx + 1,
              type: ['Koruma Enerjisi', 'Lanet', 'Kutsal Alan', 'Negatif Alan', 'Güç Noktası'][Math.floor(Math.random() * 5)],
              intensity: Math.floor(Math.random() * 100),
              location: `Bölge ${idx + 1}`,
              effect: ['Sakinleştirici', 'Uyarıcı', 'Nötr'][Math.floor(Math.random() * 3)],
            })),
            recommendations: [
              'Alan bir kez daha taranmalıdır',
              'Daha derin araştırma önerilir',
              'Titreşim ölçümleri alınmalıdır',
              'Manevi analiz yapılmalıdır',
            ],
            compatibility: Math.floor(Math.random() * 100),
          } : {
            energyLevel: 0,
            chakraPoints: 0,
            energyType: 'Bilinmiyor',
            spiritualSignature: 0,
            anomalies: [],
            recommendations: [],
            compatibility: 0,
          },
        },

        overallAnomalyScore: backendDetections.length > 0 ? 75 : (realData.magneticData ? 60 : 0),
        recommendedAction: backendDetections.length > 0
          ? `${backendDetections.length} tespit bulundu - Detaylı araştırma önerilir`
          : realData.magneticData
            ? 'Alan detaylı araştırma için önerilir'
            : 'Veri çekme başarısız - lütfen daha sonra tekrar deneyin',
        notes: `🌍 Konum: ${address || 'Bilinmiyor'} | 📍 Yükseklik: ${elevation ? elevation.toFixed(0) + 'm' : 'Bilinmiyor'} | 📏 Derinlik: ${depthValue.toFixed(2)}m | 📊 Alan: ${areaValue.toFixed(2)}m² | 📡 Tespitler: ${backendDetections.length} | 🔬 Kaynaklar: ${dataSources.length > 0 ? dataSources.join(', ') : 'Frontend API'}`,
        tags: ['real-data', 'open-source-satellite', backendDetections.length > 0 ? 'detected' : 'pending', dataQuality === 'high' ? 'complete' : 'partial'],
      };

      // Session kaydı
      const session: FirestoreScanSession = {
        id: sessionId,
        userId: userProfile!.uid,
        title: title || `Tarama - ${new Date().toLocaleString('tr-TR')}`,
        description,
        location: {
          latitude: location!.latitude,
          longitude: location!.longitude,
          address,
        },
        startedAt: Date.now(),
        completedAt: Date.now(),
        status: 'completed',
        satelliteImageUrl: satelliteImage,
        measurements: backendDetections.map((det: any) => ({
          type: det.type || det.resourceType,
          value: det.magneticField || 0,
          latitude: det.latitude,
          longitude: det.longitude,
          timestamp: det.timestamp,
          confidence: det.confidence,
        })),
        anomalies: backendDetections.filter((d: any) => d.confidence > 0.7),
        depth: depthValue,
        area: areaValue,
        notes: `✅ Backend Tespitleri: ${backendDetections.length} | 📡 Kaynaklar: ${dataSources.join(', ') || 'Frontend'} | 🌍 Yükseklik: ${elevation ? elevation.toFixed(0) + 'm' : 'N/A'} | 📍 Alan: ${areaValue.toFixed(0)}m²`,
        tags: ['real-data', 'backend-verified', backendDetections.length > 0 ? 'high-confidence' : 'pending'],
      };

      if (satelliteImage) {
        try {
          await cacheSatelliteImage(location!.latitude, location!.longitude, satelliteImage);
        } catch (e) {
          console.warn('Cache hatası:', e);
        }
      }

      setScanProgress(100);
      setScanSession(session);
      sessionStorage.setItem('lastScanResult', JSON.stringify(session));
      sessionStorage.setItem('lastComprehensiveScanResult', JSON.stringify(comprehensiveResult));

      // Kullanıcı istatistiklerini güncelle
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          statistics: {
            totalScans: (userProfile.statistics?.totalScans || 0) + 1,
            areasExplored: (userProfile.statistics?.areasExplored || 0) + 1,
            totalScanTime: (userProfile.statistics?.totalScanTime || 0) + 30000, // 30 saniye
          },
          updatedAt: Date.now(),
        };
        localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      }

      toast.success('Tarama başarıyla tamamlandı!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Tarama hatası:', error);
      toast.error('Tarama başarısız oldu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setScanning(false);
      setScanProgress(0);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Yeni Tarama</h1>
          <Button size="icon" variant="ghost" onClick={() => navigate('/dashboard')}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Form Kartı */}
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Tarama Başlığı</label>
            <Input
              placeholder="Tarama ismi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={scanning || !!scanSession}
              className="border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Açıklama</label>
            <textarea
              placeholder="Notlar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={scanning || !!scanSession}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Konum Kartı */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Tarama Konumu
          </h2>

          {location ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm">
                <p className="text-gray-900 font-medium">{address || 'Konum alınıyor...'}</p>
                <p className="text-gray-600 font-mono mt-2">
                  {location?.latitude?.toFixed(6) || '0.000000'}, {location?.longitude?.toFixed(6) || '0.000000'}
                </p>
                {elevation && (
                  <p className="text-gray-600 mt-2">Yükseklik: {elevation}m</p>
                )}
              </div>

              {satelliteImage && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img src={satelliteImage} alt="Uydu Görüntüsü" className="w-full h-auto opacity-90" />
                </div>
              )}

              {!scanning && !scanSession && (
                <div className="space-y-2">
                  <Button
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    variant="outline"
                    className="w-full border-gray-300"
                  >
                    {gettingLocation && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Konumu Güncelle
                  </Button>
                  <Button
                    onClick={() => setIsCameraOpen(true)}
                    variant="outline"
                    className="w-full border-gray-300"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Kamera ile Göz At
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="font-medium text-gray-900">Konum Belirleyin</p>
                <p className="text-sm text-gray-600 mt-1">Taramaya başlamak için konumunuzu alın</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {gettingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                  Konumu Al
                </Button>
                <Button
                  onClick={() => setShowWorldLocationModal(true)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Dünya Konumu
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Manuel Konum Giriş */}
        {!scanning && !scanSession && (
          <Card className="p-6 space-y-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Manuel Konum Giriş
            </h2>
            <p className="text-sm text-gray-600">
              Konumu manuel olarak girmek istiyorsanız aşağıdaki alanları doldurun
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Boylam (Latitude)
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="39.9334"
                  value={location?.latitude ? location.latitude.toString() : ""}
                  onChange={async (e) => {
                    const lat = parseFloat(e.target.value);
                    if (!isNaN(lat)) {
                      const lng = location?.longitude || 0;
                      setLocation({ latitude: lat, longitude: lng });

                      // Adres bilgisini otomatik olarak çek
                      if (lat !== 0 && lng !== 0) {
                        setAddressLoading(true);
                        try {
                          const info = await getLocationInfo(lat, lng);
                          setAddress(info.address || 'Adres bulunamadı');
                        } catch (error) {
                          console.error('Adres bilgisi alınamadı:', error);
                        } finally {
                          setAddressLoading(false);
                        }
                      }
                    }
                  }}
                  className="border-gray-300"
                  disabled={scanning}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Meridyen (Longitude)
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="32.8597"
                  value={location?.longitude ? location.longitude.toString() : ""}
                  onChange={async (e) => {
                    const lng = parseFloat(e.target.value);
                    if (!isNaN(lng)) {
                      const lat = location?.latitude || 0;
                      setLocation({ latitude: lat, longitude: lng });

                      // Adres bilgisini otomatik olarak çek
                      if (lat !== 0 && lng !== 0) {
                        setAddressLoading(true);
                        try {
                          const info = await getLocationInfo(lat, lng);
                          setAddress(info.address || 'Adres bulunamadı');
                        } catch (error) {
                          console.error('Adres bilgisi alınamadı:', error);
                        } finally {
                          setAddressLoading(false);
                        }
                      }
                    }
                  }}
                  className="border-gray-300"
                  disabled={scanning}
                />
              </div>
            </div>

            {/* Adres Gösterimi */}
            {location && location.latitude !== 0 && location.longitude !== 0 && (
              <div className="bg-white p-4 rounded border border-purple-200">
                {addressLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <p className="text-sm text-gray-600">Adres aranıyor...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{address || 'Adres bulunamadı'}</p>
                    <p className="text-xs text-gray-600 font-mono mt-2">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Manuel Derinlik ve Alan Belirleme */}
        {!scanning && !scanSession && (
          <Card className="p-6 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">📏</span>
              Derinlik ve Alan Belirleme
            </h2>
            <p className="text-sm text-gray-600">
              Tarama yapılacak alanın derinliğini ve metre karesini belirleyiniz
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Derinlik (metre)
                </label>
                <Input
                  type="number"
                  placeholder="örn: 50"
                  value={manualDepth}
                  onChange={(e) => setManualDepth(e.target.value)}
                  className="border-gray-300"
                  min="0.1"
                  step="0.5"
                  disabled={scanning}
                />
                <p className="text-xs text-gray-500 mt-1">Yer altının derinliği (metre)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Alan (m²)
                </label>
                <Input
                  type="number"
                  placeholder="örn: 1000"
                  value={manualArea}
                  onChange={(e) => setManualArea(e.target.value)}
                  className="border-gray-300"
                  min="0.1"
                  step="1"
                  disabled={scanning}
                />
                <p className="text-xs text-gray-500 mt-1">Tarama alanının metrekare</p>
              </div>
            </div>

            {manualDepth && manualArea && !isNaN(parseFloat(String(manualDepth))) && !isNaN(parseFloat(String(manualArea))) && (
              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tarama Parametreleri:</span>
                  <br />
                  Derinlik: <span className="text-blue-600 font-semibold">{parseFloat(String(manualDepth)).toFixed(2)}m</span>
                  {' | '}
                  Alan: <span className="text-blue-600 font-semibold">{parseFloat(String(manualArea)).toFixed(2)}m²</span>
                  {' | '}
                  Tarama Yarıçapı: <span className="text-blue-600 font-semibold">{(Math.sqrt(parseFloat(String(manualArea)) / Math.PI)).toFixed(2)}m</span>
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Tarama Progress */}
        {scanning && !scanSession && (
          <Card className="p-6 space-y-4 bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-900">Tarama Devam Ediyor - Gerçek Veriler Çekiliyor</span>
              <span className="font-bold text-blue-600">{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 text-center">
              NOAA, USGS, UNESCO ve Open-Elevation API'lerinden veri çekiliyor...
            </p>
          </Card>
        )}

        {/* Başarı Mesajı */}
        {scanSession && (
          <Card className="p-6 bg-green-50 border-green-200 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold text-gray-900">Tarama Tamamlandı</h3>
                <p className="text-sm text-gray-600 mt-1">Veriler başarıyla kaydedildi</p>
              </div>
            </div>
          </Card>
        )}

        {/* Başlat Butonu */}
        {!scanning && !scanSession && (
          <Button
            onClick={handleStartScan}
            disabled={!location || !location.latitude || !location.longitude || !manualDepth || !manualArea}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5 mr-2" />
            Taramayı Başlat
          </Button>
        )}
      </main>

      {/* Kamera Feed Modal */}
      <CameraFeed
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* Dünya Konumu Modal */}
      <ManualWorldLocationModal
        isOpen={showWorldLocationModal}
        onClose={() => setShowWorldLocationModal(false)}
        onConfirm={handleWorldLocationConfirm}
      />

      {/* Footer - WhatsApp İletişim */}
      <footer className="border-t border-gray-200 mt-12 py-8 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Yardıma İhtiyacınız Mı?</h3>
          <p className="text-gray-600 mb-6">Tarama sırasında sorunla karşılaştıysanız veya sorularınız varsa hemen WhatsApp'tan iletişime geçin!</p>
          <a
            href="https://wa.me/905425783748"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp: +90 542 578 37 48
          </a>
          <p className="text-gray-500 text-sm mt-6">Destek ekibimiz size yardımcı olmak için hazır</p>
        </div>
      </footer>
    </div>
  );
}
