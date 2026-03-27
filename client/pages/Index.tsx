import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MapPin,
  Camera,
  Loader2,
  Compass,
  Zap,
  Map,
  Activity,
  Radio,
  Radar,
  Box,
  Satellite,
  Grid3X3,
  Building2,
  TrendingUp,
  Leaf,
  Signal,
  Waves,
  Cloud,
  Wind,
  Flame,
  Eye,
  Gauge,
  Beaker,
  Microscope,
  Clock,
  Maximize2,
  Minimize2,
  Vibrate,
  Network,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { initializeDB } from '@/lib/local-db';
import { getSatelliteImagery, getLocationInfo } from '@/lib/satellite-service';
import { getCachedImage, cacheSatelliteImage, clearImageCache } from '@/lib/image-cache';
import { UserProfile, ComprehensiveScanResult } from '@shared/api';
import { useCamera } from '@/lib/camera-context';
import PersistentCameraWidget from '@/components/PersistentCameraWidget';
import TreasureCatalogDetail from '@/components/TaramaSonuclari/TreasureCatalogDetail';
import MineralDepositsDetail from '@/components/TaramaSonuclari/MineralDepositsDetail';
import UndergroundStructuresDetail from '@/components/TaramaSonuclari/UndergroundStructuresDetail';
import RoomsAndTunnelsDetail from '@/components/TaramaSonuclari/RoomsAndTunnelsDetail';
import DoorsAndEntrancesDetail from '@/components/TaramaSonuclari/DoorsAndEntrancesDetail';
import ProgressionMapDetail from '@/components/TaramaSonuclari/ProgressionMapDetail';
import WaterCanalsDetail from '@/components/TaramaSonuclari/WaterCanalsDetail';
import TrapsAndSecurityDetail from '@/components/TaramaSonuclari/TrapsAndSecurityDetail';
import SpiritualEnergyDetail from '@/components/TaramaSonuclari/SpiritualEnergyDetail';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [satelliteImage, setSatelliteImage] = useState<string>('');
  const [locationInfo, setLocationInfo] = useState<string>('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [comprehensiveResult, setComprehensiveResult] = useState<ComprehensiveScanResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [hasAvailableResults, setHasAvailableResults] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const navigate = useNavigate();
  const { openCamera, setHasLocation } = useCamera();

  interface FeatureItem {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
    available: boolean;
  }

  // Uygulamayı başlat
  useEffect(() => {
    const initApp = async () => {
      try {
        // Eski cache'i temizle (USGS ve diğer başarısız sunucular)
        await clearImageCache();

        await initializeDB();

        // Cihaz bilgisinden user profil oluştur/al
        let savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        } else {
          // Cihaz tanımlayıcısı al
          const deviceId = localStorage.getItem('device_id') || `device_${Date.now()}`;
          localStorage.setItem('device_id', deviceId);

          // Cihaz tarafından kullanılacak user profili
          const deviceUser: UserProfile = {
            uid: deviceId,
            email: `${deviceId}@local.device`,
            displayName: navigator.userAgent?.substring(0, 30) || 'Mobil Cihaz',
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
          setUserProfile(deviceUser);
          localStorage.setItem('user_profile', JSON.stringify(deviceUser));

          console.log('🔧 Cihaz profili oluşturuldu:', deviceId);
        }

        // Comprehensive result'ın mevcut olup olmadığını kontrol et
        const comprehensiveScan = sessionStorage.getItem('lastComprehensiveScanResult');
        if (comprehensiveScan) {
          try {
            // Gerçek tarama verileri mevcutsa, göster düğmesini aktif et
            setHasAvailableResults(true);
          } catch (e) {
            console.warn('Tarama sonucu okunamadı:', e);
          }
        }
      } catch (error) {
        console.error('Başlatma hatası:', error);
        toast.error('Uygulama başlatılamadı');
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  // Tarama sonuçlarını göster
  const handleShowResults = () => {
    const comprehensiveScan = sessionStorage.getItem('lastComprehensiveScanResult');
    if (comprehensiveScan) {
      try {
        setComprehensiveResult(JSON.parse(comprehensiveScan));
        setShowResults(true);
      } catch (e) {
        console.warn('Comprehensive scan result okunamadı:', e);
        toast.error('Sonuçlar yüklenemedi');
      }
    }
  };

  // Konum al
  const getCurrentLocation = async () => {
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
      setMapError(false); // Yeni konum için hata sıfırla

      // Cache'ten kontrol et
      const cached = await getCachedImage(lat, lon);
      if (cached) {
        setSatelliteImage(cached.blobUrl);
      } else {
        // Yeni uydu görüntüsü al
        const imageUrl = await getSatelliteImagery(lat, lon);
        setSatelliteImage(imageUrl);

        // Arka planda cache'le (hata olsa da devam et)
        cacheSatelliteImage(lat, lon, imageUrl)
          .catch((e) => {
            // Hata göster ama taramaya devam et
            console.warn('Uydu görüntüsü cache\'e kaydedilemedi:', e);
            // toast.warning('Görüntü cache'e kaydedilemedi, ancak tarama devam ediyor');
          });
      }

      const info = await getLocationInfo(lat, lon);
      setLocationInfo(info.address || 'Bilinmeyen Konum');

      // Konum başarıyla alındı - kamerayı aç
      setHasLocation(true);
      openCamera();
      toast.success('Konum başarıyla alındı! Kamera açılıyor...');
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

  // Özellik detay sayfalarına git
  const handleFeatureClick = (featureId: string) => {
    const featureRoutes: { [key: string]: string } = {
      'camera': '/camera-analysis',
      'magnetometer': '/magnetometer-app',
      'treasureDetection': '/treasure-detection',
      'viewer3D': '/viewer-3d-app',
      'satelliteAnalysis': '/satellite-analysis',
      'radarScan': '/radar-scanner',
      'thermalEnergy': '/thermal-energy',
      'mapDetections': '/map-detections',
      'scanHistory': '/scan-history',
      'arAnalysis': '/ar',
      'areaScan': '/area-scanner',
      'structureScan': '/structure-scanner',
      'advancedAnalytics': '/advanced-analytics',
      'topography': '/topography',
      'vegetation': '/vegetation',
      'signalAnalysis': '/signal-analysis',
      'oceanAnalysis': '/ocean-analysis',
      'climateData': '/climate-data',
      'windAnalysis': '/wind-analysis',
      'soilComposition': '/soil-composition',
      'microorganisms': '/microorganisms',
      'radioactivity': '/radioactivity',
      'visionAnalysis': '/vision-analysis',
      'pressureMapping': '/pressure-mapping',
      'timeSeriesAnalysis': '/time-series-analysis',
      'volumetricMeasurement': '/volumetric-measurement',
      'gravitationalField': '/gravitational-field',
      'seismicActivity': '/seismic-activity',
      'networkAnalysis': '/network-analysis',
      'archeologyDatabase': '/archeology-database',
    };

    if (featureRoutes[featureId]) {
      navigate(featureRoutes[featureId]);
    }
  };

  const getFeaturesList = (): FeatureItem[] => {
    return [
      {
        id: 'camera',
        name: 'Detaylı Tarama',
        icon: Camera,
        color: 'bg-blue-100 text-blue-600',
        description: 'Kenar tespiti, simetri analizi ve renk anomalileri',
        available: !!comprehensiveResult?.features.camera && comprehensiveResult.features.camera.edgeDetected,
      },
      {
        id: 'magnetometer',
        name: 'Manyetometre',
        icon: Compass,
        color: 'bg-red-100 text-red-600',
        description: 'Manyetik alan okuma ve anomali tespiti',
        available: !!comprehensiveResult?.features.magnetometer,
      },
      {
        id: 'treasureDetection',
        name: 'Hazine Tespiti',
        icon: Zap,
        color: 'bg-yellow-100 text-yellow-600',
        description: 'Kaynak sınıflandırması ve derinlik tahmini',
        available: !!comprehensiveResult?.features.treasureDetection,
      },
      {
        id: 'mapDetections',
        name: 'Harita Tespitleri',
        icon: Map,
        color: 'bg-green-100 text-green-600',
        description: 'Hotspot haritası ve kümeleme analizi',
        available: !!comprehensiveResult?.features.mapDetections,
      },
      {
        id: 'scanHistory',
        name: 'Tarama Geçmişi',
        icon: Activity,
        color: 'bg-purple-100 text-purple-600',
        description: 'Ölçüm geçmişi ve istatistikler',
        available: !!comprehensiveResult?.features.scanHistory,
      },
      {
        id: 'arAnalysis',
        name: 'AR Analizi',
        icon: Radio,
        color: 'bg-indigo-100 text-indigo-600',
        description: 'Artırılmış gerçeklik tarama ve marker tespiti',
        available: !!comprehensiveResult?.features.arAnalysis,
      },
      {
        id: 'radarScan',
        name: 'Radar Tarama',
        icon: Radar,
        color: 'bg-cyan-100 text-cyan-600',
        description: '360° radar görüntüleme ve aktivite skoru',
        available: !!comprehensiveResult?.features.radarScan,
      },
      {
        id: 'viewer3D',
        name: '3D Görüntüleme',
        icon: Box,
        color: 'bg-orange-100 text-orange-600',
        description: '3D model oluşturma ve katman analizi',
        available: !!comprehensiveResult?.features.viewer3D,
      },
      {
        id: 'satelliteAnalysis',
        name: 'Uydu Analizi',
        icon: Satellite,
        color: 'bg-slate-100 text-slate-600',
        description: 'USGS/Esri görüntüleri ve spektral analiz',
        available: !!comprehensiveResult?.features.satelliteAnalysis,
      },
      {
        id: 'areaScan',
        name: 'Alan Tarama',
        icon: Grid3X3,
        color: 'bg-lime-100 text-lime-600',
        description: 'Grid tabanlı tarama ve heatmap',
        available: !!comprehensiveResult?.features.areaScan,
      },
      {
        id: 'structureScan',
        name: 'Yapı Tarayıcı',
        icon: Building2,
        color: 'bg-amber-100 text-amber-600',
        description: 'Yeraltı yapı tespiti ve analizi',
        available: !!comprehensiveResult?.features.structureScan,
      },
      {
        id: 'advancedAnalytics',
        name: 'Gelişmiş Analitik',
        icon: TrendingUp,
        color: 'bg-fuchsia-100 text-fuchsia-600',
        description: 'Manyetik alan haritası ve spektral analiz',
        available: !!comprehensiveResult?.features.advancedAnalytics,
      },
      {
        id: 'topography',
        name: 'Topografya',
        icon: Activity,
        color: 'bg-emerald-100 text-emerald-600',
        description: 'Yükseklik ve eğim analizi',
        available: !!comprehensiveResult?.features.topography,
      },
      {
        id: 'vegetation',
        name: 'Bitki Analizi',
        icon: Leaf,
        color: 'bg-green-100 text-green-600',
        description: 'Bitki sağlığı ve stres analizi',
        available: !!comprehensiveResult?.features.vegetation,
      },
      {
        id: 'signalAnalysis',
        name: 'Sinyal Analizi',
        icon: Signal,
        color: 'bg-violet-100 text-violet-600',
        description: 'WiFi/GSM/LTE sinyal gücü analizi',
        available: !!comprehensiveResult?.features.signalAnalysis,
      },
      {
        id: 'oceanAnalysis',
        name: 'Okyanus Analizi',
        icon: Waves,
        color: 'bg-blue-100 text-blue-600',
        description: 'Su taraması, dalga analizi ve tuz konsantrasyonu',
        available: !!comprehensiveResult?.features.oceanAnalysis,
      },
      {
        id: 'climateData',
        name: 'İklim Verileri',
        icon: Cloud,
        color: 'bg-gray-100 text-gray-600',
        description: 'Sıcaklık, nem ve hava basıncı analizi',
        available: !!comprehensiveResult?.features.climateData,
      },
      {
        id: 'windAnalysis',
        name: 'Rüzgar Analizi',
        icon: Wind,
        color: 'bg-cyan-100 text-cyan-600',
        description: 'Rüzgar yönü, hızı ve enerji potansiyeli',
        available: !!comprehensiveResult?.features.windAnalysis,
      },
      {
        id: 'thermalEnergy',
        name: 'Termal Enerji',
        icon: Flame,
        color: 'bg-red-100 text-red-600',
        description: '3D ısı dağılımı ve enerji rezervleri',
        available: !!comprehensiveResult?.features.thermalEnergy,
      },
      {
        id: 'soilComposition',
        name: 'Toprak Bileşimi',
        icon: Beaker,
        color: 'bg-amber-100 text-amber-600',
        description: 'Kimyasal analiz ve mineral yoğunluğu',
        available: !!comprehensiveResult?.features.soilComposition,
      },
      {
        id: 'microorganisms',
        name: 'Mikroorganizmalar',
        icon: Microscope,
        color: 'bg-purple-100 text-purple-600',
        description: 'Bakteri, mantar ve biyolojik aktivite tespiti',
        available: !!comprehensiveResult?.features.microorganisms,
      },
      {
        id: 'radioactivity',
        name: 'Radyoaktivite',
        icon: Zap,
        color: 'bg-yellow-100 text-yellow-600',
        description: 'Radyoaktif elemanlara ait açık seçiklik',
        available: !!comprehensiveResult?.features.radioactivity,
      },
      {
        id: 'visionAnalysis',
        name: 'Görüntü İşleme',
        icon: Eye,
        color: 'bg-indigo-100 text-indigo-600',
        description: 'Yapay zeka destekli görsel tanıma ve sınıflandırma',
        available: !!comprehensiveResult?.features.visionAnalysis,
      },
      {
        id: 'pressureMapping',
        name: 'Basınç Haritalama',
        icon: Gauge,
        color: 'bg-pink-100 text-pink-600',
        description: 'Yeraltı basınç dağılımı ve boşluk tespiti',
        available: !!comprehensiveResult?.features.pressureMapping,
      },
      {
        id: 'timeSeriesAnalysis',
        name: 'Zaman Serisi',
        icon: Clock,
        color: 'bg-orange-100 text-orange-600',
        description: 'Geçmiş tarama verilerinin karşılaştırma analizi',
        available: !!comprehensiveResult?.features.timeSeriesAnalysis,
      },
      {
        id: 'volumetricMeasurement',
        name: 'Hacimsel Ölçüm',
        icon: Maximize2,
        color: 'bg-teal-100 text-teal-600',
        description: '3D hacim hesaplama ve kavite tespiti',
        available: !!comprehensiveResult?.features.volumetricMeasurement,
      },
      {
        id: 'gravitationalField',
        name: 'Yerçekimi Alanı',
        icon: Minimize2,
        color: 'bg-slate-100 text-slate-600',
        description: 'Yerçekimi anomalileri ve yoğunluk farklılıkları',
        available: !!comprehensiveResult?.features.gravitationalField,
      },
      {
        id: 'seismicActivity',
        name: 'Sismik Aktivite',
        icon: Vibrate,
        color: 'bg-red-100 text-red-600',
        description: 'Deprem eğilimi ve kırık analizi',
        available: !!comprehensiveResult?.features.seismicActivity,
      },
      {
        id: 'networkAnalysis',
        name: 'Ağ Analizi',
        icon: Network,
        color: 'bg-green-100 text-green-600',
        description: 'Yapı bağlantıları ve iletişim ağları',
        available: !!comprehensiveResult?.features.networkAnalysis,
      },
      {
        id: 'archeologyDatabase',
        name: 'Arkeoloji Veritabanı',
        icon: FileText,
        color: 'bg-yellow-100 text-yellow-700',
        description: 'Tarihsel buluntu katalogları ve kültür varlıkları',
        available: !!comprehensiveResult?.features.archeologyDatabase,
      },
    ];
  };

  const renderFeatureDetail = (featureId: string) => {
    if (!comprehensiveResult) return null;

    const features = comprehensiveResult.features;

    switch (featureId) {
      case 'camera':
        if (!features.camera) return null;
        return (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Kenar Tespiti</p>
              <p className="font-bold">{features.camera.edgeDetected ? 'Evet' : 'Hayır'}</p>
            </div>
            <div>
              <p className="text-gray-600">Kenar Gücü</p>
              <p className="font-bold">{features.camera.edgeStrength.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-600">Bulunan Çizgiler</p>
              <p className="font-bold">{features.camera.linesFound}</p>
            </div>
            <div>
              <p className="text-gray-600">Simetri Skoru</p>
              <p className="font-bold">{features.camera.symmetryScore.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-600">İşlenen Frame'ler</p>
              <p className="font-bold">{features.camera.frameCount}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
          <p className="text-gray-600 mb-6">Uygulama profili yüklenemedi. Lütfen sayfayı yenileyiniz veya internet bağlantınızı kontrol ediniz.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sayfayı Yenile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Kalıcı Kamera Widget */}
      <PersistentCameraWidget />

      {/* Header */}
      <header className="border-b border-gray-200 p-4 sticky top-0 bg-white z-30">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Görüntüleme Sistemi</h1>
          <p className="text-sm text-gray-600">{userProfile.displayName}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* İstatistikler */}
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {userProfile.statistics.totalScans}
              </p>
              <p className="text-sm text-gray-600 mt-1">Taramalar</p>
            </div>
            <div className="border-l border-r border-gray-200">
              <p className="text-3xl font-bold text-purple-600">
                {userProfile.statistics.areasExplored}
              </p>
              <p className="text-sm text-gray-600 mt-1">Alanlar</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(userProfile.statistics.totalScanTime / 1000 / 60)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Dakika</p>
            </div>
          </div>
        </Card>

        {/* Konum Kartı */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Konum
          </h2>

          {location ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-gray-900 font-medium">{locationInfo}</p>
                <p className="text-xs text-gray-600 font-mono mt-2">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>

              {satelliteImage && !mapError && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={satelliteImage}
                    alt="Açık Kaynak Uydu Görüntüsü"
                    className="w-full h-auto"
                    onError={() => setMapError(true)}
                  />
                </div>
              )}

              {(!satelliteImage || mapError) && location && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <Map className="w-12 h-12 text-blue-400 mb-3 opacity-50" />
                  <p className="text-gray-600 text-center">
                    Harita görüntüsü yüklenemedi
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tarama devam edebilir
                  </p>
                </div>
              )}

              <Button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                variant="outline"
                className="w-full"
              >
                {gettingLocation && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Konumu Güncelle
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-900 font-medium">Konum Belirleyin</p>
                <p className="text-sm text-gray-600 mt-1">
                  Tarama başlatmak için konumunuzu almalısınız
                </p>
              </div>
              <Button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                {gettingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                Konumu Al
              </Button>
            </div>
          )}
        </Card>

        {/* Tarama Butonu */}
        <Button
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
          disabled={!location}
          onClick={() => navigate('/')}
        >
          <Camera className="w-5 h-5 mr-2" />
          Yeni Tarama Başlat
        </Button>

        {/* Sonuçları Göster Butonu */}
        {hasAvailableResults && !showResults && (
          <Button
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
            onClick={handleShowResults}
          >
            <FileText className="w-5 h-5 mr-2" />
            Son Tarama Sonuçlarını Göster
          </Button>
        )}

        {/* Tarama Sonuçları - Detaylı Sistem */}
        {comprehensiveResult && showResults && (
          <Card className="p-6 space-y-6 border-green-200 bg-green-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tarama Sonuçları</h2>
              <p className="text-sm text-gray-600">Tarama sonrasında elde edilen tüm sistem verilerinin detaylı analizi</p>
            </div>

            {/* Özet Bilgiler */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm text-gray-600">Genel Anomali Skoru</p>
                <p className="text-3xl font-bold text-blue-600">
                  {comprehensiveResult.overallAnomalyScore.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm text-gray-600">Tarama Süresi</p>
                <p className="text-3xl font-bold text-purple-600">
                  {(comprehensiveResult.duration / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm text-gray-600">Önerilen Aksiyon</p>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{comprehensiveResult.recommendedAction}</p>
              </div>
            </div>

            {/* Tabbed Navigation */}
            <div className="border-b border-gray-300 overflow-x-auto">
              <div className="flex gap-2">
                {[
                  { id: 'overview', label: '📊 Genel', icon: '📊' },
                  { id: 'treasures', label: '💎 Hazineler', icon: '💎' },
                  { id: 'minerals', label: '💠 Madenler', icon: '💠' },
                  { id: 'structures', label: '🏛️ Yapılar', icon: '🏛️' },
                  { id: 'rooms', label: '🚪 Odalar & Tüneller', icon: '🚪' },
                  { id: 'doors', label: '🔐 Kapılar', icon: '🔐' },
                  { id: 'progression', label: '📈 İlerleme', icon: '📈' },
                  { id: 'water', label: '💧 Su Kanalları', icon: '💧' },
                  { id: 'traps', label: '⚠️ Tuzaklar', icon: '⚠️' },
                  { id: 'spiritual', label: '✨ Manevi Enerji', icon: '✨' },
                  { id: 'systems', label: '🔬 Sistemler', icon: '🔬' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-green-600 text-green-700 bg-white'
                        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {/* Genel Bakış */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {getFeaturesList().map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => handleFeatureClick(feature.id)}
                        className={`border rounded-lg overflow-hidden transition-all text-left hover:shadow-lg ${
                          selectedFeature === feature.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
                        } hover:border-blue-400 bg-white`}
                      >
                        <div className="p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg ${feature.color}`}>
                              <feature.icon className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">{feature.name}</h4>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{feature.description}</p>
                          {showResults && (
                            <>
                              {!feature.available && (
                                <p className="text-xs text-gray-600 mt-1 font-medium">Veri Yok</p>
                              )}
                              {feature.available && (
                                <p className="text-xs text-green-600 mt-1 font-medium">Veriler Mevcut</p>
                              )}
                            </>
                          )}
                        </div>

                        {selectedFeature === feature.id && feature.available && (
                          <div className="bg-gray-50 border-t border-gray-200 p-3 max-h-64 overflow-y-auto">
                            {renderFeatureDetail(feature.id)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hazineler */}
              {activeTab === 'treasures' && <TreasureCatalogDetail treasureCatalog={comprehensiveResult.features.treasureCatalog} />}

              {/* Madenler */}
              {activeTab === 'minerals' && <MineralDepositsDetail valuableMineral={comprehensiveResult.features.valuableMineral} />}

              {/* Yer Altı Yapıları */}
              {activeTab === 'structures' && <UndergroundStructuresDetail undergroundStructures={comprehensiveResult.features.undergroundStructures} />}

              {/* Odalar & Tüneller */}
              {activeTab === 'rooms' && <RoomsAndTunnelsDetail roomsAndTunnels={comprehensiveResult.features.roomsAndTunnels} />}

              {/* Kapılar & Giriş */}
              {activeTab === 'doors' && <DoorsAndEntrancesDetail doorsAndEntrances={comprehensiveResult.features.doorsAndEntrances} />}

              {/* İlerleme Haritası */}
              {activeTab === 'progression' && <ProgressionMapDetail progressionMap={comprehensiveResult.features.progressionMap} />}

              {/* Su Kanalları */}
              {activeTab === 'water' && <WaterCanalsDetail waterCanals={comprehensiveResult.features.waterCanals} />}

              {/* Tuzaklar & Güvenlik */}
              {activeTab === 'traps' && <TrapsAndSecurityDetail trapsAndSecurity={comprehensiveResult.features.trapsAndSecurity} />}

              {/* Manevi Enerji */}
              {activeTab === 'spiritual' && <SpiritualEnergyDetail spiritualEnergyDetection={comprehensiveResult.features.spiritualEnergyDetection} />}

              {/* Sistemler (Eski Özellikler) */}
              {activeTab === 'systems' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {getFeaturesList().map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => handleFeatureClick(feature.id)}
                      className={`border rounded-lg overflow-hidden transition-all text-left hover:shadow-lg ${
                        selectedFeature === feature.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      } hover:border-blue-400 bg-white`}
                    >
                      <div className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className={`p-2 rounded-lg ${feature.color}`}>
                            <feature.icon className="w-5 h-5" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">{feature.name}</h4>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{feature.description}</p>
                        {showResults && (
                          <>
                            {!feature.available && (
                              <p className="text-xs text-gray-600 mt-1 font-medium">Veri Yok</p>
                            )}
                            {feature.available && (
                              <p className="text-xs text-green-600 mt-1 font-medium">Veriler Mevcut</p>
                            )}
                          </>
                        )}
                      </div>

                      {selectedFeature === feature.id && feature.available && (
                        <div className="bg-gray-50 border-t border-gray-200 p-3 max-h-64 overflow-y-auto">
                          {renderFeatureDetail(feature.id)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Yeni Tarama Butonu */}
            <div className="flex gap-4 pt-4 border-t border-green-200">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate('/')}
              >
                <Camera className="w-4 h-4 mr-2" />
                Yeni Tarama Başlat
              </Button>
              <Button
                variant="outline"
                className="border-green-300"
                onClick={() => {
                  setComprehensiveResult(null);
                  setShowResults(false);
                  sessionStorage.removeItem('lastComprehensiveScanResult');
                  setHasAvailableResults(false);
                }}
              >
                Sonuçları Temizle
              </Button>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
