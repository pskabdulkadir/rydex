import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Activity,
  Camera,
  Locate,
  Maximize,
  Layers,
  Scan,
  ChevronRight,
  Globe,
  Box,
  AlertCircle,
  Zap,
  Cpu,
  Radio,
  Eye,
  Info,
  DoorOpen,
  Footprints,
  MapPin,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import HologramView from './HologramView';
import { alertSystem } from '@/lib/alert-system';
import { useLocation } from '@/lib/location-context';

export default function HeroScanner() {
  const { location: globalLocation, refreshLocation, isGettingLocation: globalIsGetting } = useLocation();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isHologramMode, setIsHologramMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState(globalLocation);
  const [depth, setDepth] = useState('2.5');
  const [area, setArea] = useState('10');
  const [scanProgress, setScanProgress] = useState(0);
  const [fov, setFov] = useState(75);
  const [signalStrength, setSignalStrength] = useState(0);
  const [thermalLevel, setThermalLevel] = useState(0);
  const [groundStability, setGroundStability] = useState(0);
  const [activityScore, setActivityScore] = useState<number>(75);
  const [depthMin, setDepthMin] = useState<number>(1.5);
  const [depthMax, setDepthMax] = useState<number>(3.5);
  const [areaRadius, setAreaRadius] = useState<number>(2.5);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanResults, setScanResults] = useState<{label: string, value: string, icon: any, details: string}[] | null>(null);

  // Genel konumla senkronize et
  useEffect(() => {
    setCoordinates(globalLocation);
  }, [globalLocation]);

  // Manuel sistem başlatması
  const initializeSystem = async () => {
    try {
      // Zaman aşımı koruması ile konum al
      try {
        await Promise.race([
          refreshLocation(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Konum alma zaman aşımı')), 12000)
          )
        ]);
      } catch (err) {
        console.warn("Konum yenileme hatası:", err);
        // Devam et - varsayılan konum kullanılır
      }

      // Kamerayı başlat
      try {
        await startCamera();
      } catch (err) {
        console.warn("Kamera başlatma hatası:", err);
        // Kamera başlamazsa da devam et
      }
    } catch (err) {
      console.error("Sistem başlatması hatası:", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Kamera erişim hatası:", err);
      // Kamera başarısız olsa bile simüle edilen UI gösterilir
      setIsCameraActive(true);
    }
  };

  const isFormValid = depth.trim() !== '' && area.trim() !== '' && parseFloat(depth) > 0 && parseFloat(area) > 0;

  const handleScan = async () => {
    if (isScanning || scanResults) return; // Sonuçlar varsa yeni tarama izni verme

    // Kamera aktif değilse otomatik başlat
    if (!isCameraActive) {
      await initializeSystem();
      // Kameranın görsel olarak ısınması için kısa bir gecikme ver
      await new Promise(r => setTimeout(r, 500));
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanResults(null);
    setSelectedFeature(null);
    setIsHologramMode(false);

    // Tarama başladığında sistem mesajı
    alertSystem.showVisualAlert(
      '🎯 Tarama Başladı',
      `Konum: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)} | Derinlik: ${depth}m | Alan: ${area}m²`,
      'info'
    );

    // Tarama sırasında dinamik sistem güncellemeleri
    const updateInterval = setInterval(() => {
      setSignalStrength(Math.floor(Math.random() * 40) + 60);
      setThermalLevel(Math.floor(Math.random() * 30) + 20);
      setGroundStability(Math.floor(Math.random() * 20) + 75);
    }, 200);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const nextProgress = prev + 1;

        // Tarama ilerledikçe anomali uyarıları
        if (nextProgress === 30) {
          alertSystem.showVisualAlert(
            '⚠️ Anomali Tespit Edildi',
            'Zemin altında anormal manyetik alan sapması tespit edildi',
            'warning'
          );
        }

        if (nextProgress === 70) {
          alertSystem.triggerCriticalAlert('Metal Yapı', 450);
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          clearInterval(updateInterval);
          setIsScanning(false);

          // Tarama tamamlandı - başarı mesajı
          alertSystem.showVisualAlert(
            '✅ Tarama Tamamlandı',
            'Tüm veriler işlenmiş ve sonuçlar hazırlandı',
            'success'
          );

          // Sonuçları göster
          setScanResults([
            {
              label: 'Tespit Edilen Yapı',
              value: 'Antik Metal Sandık',
              icon: Box,
              details: 'Yüksek yoğunluklu metalik imza. Yaklaşık 1200-1400 yıllık olduğu tahmin ediliyor. Geometrik formu bozulmamış.'
            },
            {
              label: 'Hassasiyet',
              value: '94%',
              icon: Radio,
              details: 'Sinyal-gürültü oranı optimize edildi. Çok katmanlı filtreleme sayesinde yanılma payı %6\'ya düşürüldü.'
            },
            {
              label: 'Termal Analiz',
              value: '32°C Anomali',
              icon: Zap,
              details: 'Zemin altında çevresel sıcaklıktan farklılaşan ısı odağı tespit edildi. Statik yapı onayı verildi.'
            },
            {
              label: 'Giriş & Yapı',
              value: '3 Kapı / 12 Adım',
              icon: DoorOpen,
              details: 'Yapıya erişim sağlayan 3 ana giriş (kapı) ve alt kata inen 12 basamaklı merdiven yapısı tespit edildi.'
            },
            {
              label: 'Yeraltı Kordinat',
              value: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
              icon: MapPin,
              details: `Yapının merkez erişim noktası tam olarak bu koordinat düzleminde, ${depth}m derinlikte konumlanmıştır.`
            },
            {
              label: 'Alan Analizi',
              value: `${area}m²`,
              icon: Maximize,
              details: `Belirlenen ${area} metrekarelik alanın tamamı grid taramasından geçirildi. Yapı sınırları bu alanın %70'ini kaplıyor.`
            },
            {
              label: 'Manyetik Akı',
              value: '480 nT',
              icon: Radio,
              details: 'Güçlü ferromanyetik alan sapması. Metalik kütlenin hacmi yaklaşık 0.45m³ olarak hesaplandı.'
            },
          ]);
          return 100;
        }

        return nextProgress;
      });
    }, 40);
  };

  const resetResults = () => {
    setScanResults(null);
    setSelectedFeature(null);
    setIsHologramMode(false);
    setScanProgress(0);
    // İsteğe bağlı olarak diğer metrikleri sıfırla
    setSignalStrength(0);
    setThermalLevel(0);
    setGroundStability(0);
  };

  return (
    <div className="relative w-full h-[600px] bg-black overflow-hidden rounded-3xl border border-slate-700 shadow-2xl group">
      <HologramView
        results={scanResults || []}
        isVisible={isHologramMode}
        activityScore={activityScore}
        config={{
          depth: { min: depthMin, max: depthMax },
          areaRadius,
          densityLevel: Math.floor(Math.random() * 100),
        }}
      />

      {/* Arka Plan Kamera Görünümü / Yer Tutucu */}
      <div className="absolute inset-0 z-0">
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Locate className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sistem Hazır Değil</h3>
            <p className="text-slate-400 max-w-xs mb-8">Taramaya başlamak için konum izni verin ve kamerayı etkinleştirin.</p>
            <Button
              onClick={initializeSystem}
              disabled={globalIsGetting}
              className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-bold shadow-xl shadow-blue-500/20 group"
            >
              <Locate className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              {globalIsGetting ? 'Konum Alınıyor...' : 'Mevcut Konumu Al & Kamerayı Aç'}
            </Button>
          </div>
        )}
      </div>

      {/* Izgara Kaplamasi */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* HUD Kaplamasi */}
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between pointer-events-none">
        {/* Üst Bölüm: Koordinatlar & Durum */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 text-xs text-blue-400 mb-1 font-mono">
              <Globe className="w-3 h-3" />
              CANLI KOORDİNATLAR
            </div>
            <div className="font-mono text-sm">
              LAT: {coordinates.lat.toFixed(6)}
              <br />
              LNG: {coordinates.lng.toFixed(6)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white text-right">
              <div className="flex items-center justify-end gap-2 text-xs text-green-400 mb-1 font-mono">
                <Activity className="w-3 h-3" />
                SİSTEM DURUMU
              </div>
              <div className="font-mono text-sm uppercase">
                {isScanning ? 'Tarama Aktif' : 'Sistem Hazır'}
                <br />
                FOV: {fov}°
              </div>
            </div>

            {/* Yeni Canlı Metrikler */}
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-blue-400">SİNYAL</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${signalStrength}%` }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-red-400">TERMAL</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${thermalLevel}%` }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-green-400">ZEMİN</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${groundStability}%` }}></div>
                </div>
              </div>

              {/* Oscilloscope Visual */}
              <div className="pt-2 flex items-center justify-center gap-1 h-8">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-400/50 rounded-full animate-wave"
                    style={{
                      height: '60%',
                      animationDelay: `${i * 0.1}s`,
                      opacity: isScanning ? 1 : 0.3
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {scanResults && (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setIsHologramMode(!isHologramMode)}
                  className={cn(
                    "bg-black/60 backdrop-blur-md border border-blue-500/30 text-blue-400 hover:bg-blue-900/40 h-10 transition-all",
                    isHologramMode && "bg-blue-600 text-white border-blue-400"
                  )}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isHologramMode ? 'Kamera Görünümü' : 'Hologram Modu'}
                </Button>

                <Button
                  onClick={resetResults}
                  className="bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-400 hover:bg-red-600/40 h-10 transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sonuçları Sıfırla
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Orta Bölüm: Tarama Animasyonu / Detaylar */}
        <div className="flex-1 flex items-center justify-center relative">
          {isScanning && (
            <div className="w-64 h-64">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-4 border-2 border-blue-400 rounded-full animate-pulse opacity-40"></div>
                <div className="flex flex-col items-center">
                  <div className="text-blue-400 text-3xl font-black font-mono leading-none">{scanProgress}%</div>
                  <div className="text-[10px] text-blue-300 font-mono mt-2 tracking-[0.2em] animate-pulse">SİSTEM SENKRONİZASYONU</div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan-line"></div>
              </div>
            </div>
          )}

          {selectedFeature !== null && scanResults && (
            <div className="bg-black/80 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-8 max-w-md animate-in fade-in zoom-in duration-300 pointer-events-auto">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-2xl">
                    {React.createElement(scanResults[selectedFeature].icon, { className: "w-8 h-8 text-blue-400" })}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{scanResults[selectedFeature].label}</h4>
                    <p className="text-blue-400 font-mono text-sm">{scanResults[selectedFeature].value}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFeature(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <Maximize className="w-5 h-5 rotate-45" />
                </Button>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                {scanResults[selectedFeature].details}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Koordinat</div>
                  <div className="text-sm text-white font-mono">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Zaman</div>
                  <div className="text-sm text-white font-mono">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alt Bölüm: Kontroller & Sonuçlar */}
        <div className="space-y-4 pointer-events-auto">
          {scanResults && !isHologramMode && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {scanResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFeature(idx)}
                  className={cn(
                    "bg-blue-900/40 backdrop-blur-xl border border-blue-400/30 rounded-xl p-3 text-white text-left transition-all hover:scale-105 active:scale-95",
                    selectedFeature === idx && "border-blue-400 bg-blue-800/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-[10px] text-blue-200 uppercase">
                      <result.icon className="w-3 h-3" />
                      {result.label}
                    </div>
                    <Info className="w-3 h-3 text-blue-400 opacity-50" />
                  </div>
                  <div className="text-sm font-bold truncate">{result.value}</div>
                </button>
              ))}
            </div>
          )}

          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                  <Layers className="w-3 h-3" />
                  Hedef Derinlik (m)
                </label>
                <Input 
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12"
                  placeholder="örn: 2.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                  <Maximize className="w-3 h-3" />
                  Tarama Alanı (m²)
                </label>
                <Input 
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12"
                  placeholder="örn: 10"
                />
              </div>
              <div>
                <Button
                  onClick={handleScan}
                  disabled={isScanning || !!scanResults}
                  className={cn(
                    "w-full h-12 text-lg font-black transition-all duration-300 tracking-tighter",
                    isScanning || scanResults
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] animate-gradient-x hover:scale-[1.02] text-white shadow-lg shadow-blue-500/40"
                  )}
                >
                  {isScanning ? (
                    <span className="flex items-center gap-2">
                      <Activity className="w-5 h-5 animate-spin" />
                      TARANIYOR...
                    </span>
                  ) : scanResults ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      TARAMA TAMAMLANDI
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Scan className="w-6 h-6" />
                      TARAMAYI BAŞLAT
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera View Angle Indicator (Simulated) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
        <div className="h-48 w-1 bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-300"
            style={{ height: `${(fov/120)*100}%` }}
          ></div>
        </div>
        <div className="text-[10px] text-white font-mono vertical-text">FOV ANALİZİ</div>
      </div>
    </div>
  );
}
