import React, { useState, useRef, useEffect } from 'react';
import {
  Camera as CameraIcon,
  X,
  Play,
  Square,
  Download,
  MapPin,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Radio,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCameraWithPermission, captureFrame, CameraRecorder } from '@/lib/use-camera';
import { useLocation } from '@/lib/location-context';
import { useCameraSync } from '@/lib/use-camera-sync';
import { PageLayout } from '@/components/PageLayout';

interface CapturedImage {
  id: string;
  dataUrl: string;
  timestamp: number;
  location?: { lat: number; lng: number };
  metadata?: any;
}

interface RecordingSession {
  id: string;
  startTime: number;
  duration: number;
  location?: { lat: number; lng: number };
}

export default function Camera() {
  const {
    videoRef,
    stream,
    isLoading,
    error,
    isPermissionGranted,
    startCamera,
    stopCamera,
    requestPermission,
  } = useCameraWithPermission();

  const { location, refreshLocation } = useLocation();
  const { syncCameraLocation, syncStats, manualSync } = useCameraSync({
    autoSync: true,
    analyzeFrames: true,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [recordingSessions, setRecordingSessions] = useState<RecordingSession[]>([]);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const recorderRef = useRef<CameraRecorder | null>(null);
  const recordStartTimeRef = useRef<number | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Kamerayı sistem başladığında aç
  useEffect(() => {
    const initCamera = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission && !stream) {
        try {
          await startCamera();
        } catch (err) {
          console.error('Kamera başlatılamadı:', err);
        }
      }
    };

    initCamera();
  }, []);

  // Konum al
  useEffect(() => {
    refreshLocation();
  }, []);

  // Kamera akışını senkronize et (stream başladığında)
  useEffect(() => {
    if (stream && videoRef.current && !syncIntervalRef.current) {
      syncIntervalRef.current = setInterval(async () => {
        try {
          await syncCameraLocation(videoRef.current!);
        } catch (err) {
          console.error('Senkronizasyon hatası:', err);
        }
      }, 10000); // 10 saniyede bir

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
      };
    }
  }, [stream, syncCameraLocation]);

  // Fotoğraf çek
  const handleCapture = () => {
    if (!videoRef.current) return;

    const captured = captureFrame(videoRef.current);
    if (!captured) {
      toast.error('Fotoğraf çekme başarısız');
      return;
    }

    const newImage: CapturedImage = {
      id: Date.now().toString(),
      dataUrl: captured.dataUrl,
      timestamp: Date.now(),
      location,
      metadata: {
        zoom,
        brightness,
      },
    };

    setCapturedImages((prev) => [newImage, ...prev]);
    toast.success('Fotoğraf çekildi', {
      description: location
        ? `Konum: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
        : 'Konum belirlenemedi',
    });
  };

  // Video kayıt başla
  const handleStartRecording = async () => {
    if (!stream) {
      toast.error('Kamera akışı bulunamadı');
      return;
    }

    if (!recorderRef.current) {
      recorderRef.current = new CameraRecorder();
    }

    const success = recorderRef.current.startRecording(stream);
    if (success) {
      recordStartTimeRef.current = Date.now();
      setIsRecording(true);
      toast.success('Kayıt başladı');
    } else {
      toast.error('Kayıt başlatılamadı');
    }
  };

  // Video kayıt durdur
  const handleStopRecording = async () => {
    if (!recorderRef.current) return;

    const blob = await recorderRef.current.stopRecording();
    setIsRecording(false);

    if (!blob) {
      toast.error('Kayıt kaydedilemedi');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    const session: RecordingSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      duration: recordStartTimeRef.current ? Date.now() - recordStartTimeRef.current : 0,
      location,
    };

    setRecordingSessions((prev) => [session, ...prev]);
    toast.success('Kayıt indirildi');
  };

  // Fotoğraf indir
  const handleDownloadImage = (image: CapturedImage) => {
    const a = document.createElement('a');
    a.href = image.dataUrl;
    a.download = `photo-${image.id}.jpg`;
    a.click();
  };

  // Kamera izni sorunu varsa
  if (!isPermissionGranted && error) {
    return (
      <PageLayout title="Kamera İzni">
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white text-center">
                Kamera İzni Gerekli
              </h1>
              <p className="text-slate-400 text-center text-sm">{error}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-medium">
                <strong>Çözüm:</strong> Tarayıcı ayarlarına gidip kamera izinlerini etkinleştirin ve sayfayı yenileyin.
              </p>
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
            >
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Kamera" backLink="/dashboard">
      <div className="min-h-screen bg-[#020617] text-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* İçerik Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ana Kamera */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Container */}
              <div className="relative bg-black rounded-3xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-black flex items-center justify-center relative">
                  {isLoading ? (
                    <div className="space-y-4 text-center">
                      <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto" />
                      <p className="text-slate-400">Kamera yükleniyor...</p>
                    </div>
                  ) : stream ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        style={{
                          filter: `brightness(${brightness}) scale(${zoom})`,
                          transition: 'filter 0.1s',
                        }}
                      />

                      {/* Scan Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan-line" />
                      </div>

                      {/* Kamera Durumu */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-red-400 uppercase">
                          CANLI ARKA KAMERA
                        </span>
                      </div>

                      {/* Kayıt Durumu */}
                      {isRecording && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 px-3 py-2 rounded-lg backdrop-blur-sm animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full" />
                          <span className="text-xs font-bold text-white uppercase">
                            KAYIT AKTIF
                          </span>
                        </div>
                      )}

                      {/* Konum */}
                      {location && (
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                          <div className="text-[10px] font-mono text-blue-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Zoom ve Brightness Göstergesi */}
                      <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm space-y-1">
                        <div className="text-[10px] font-mono text-green-400">
                          Zoom: {zoom.toFixed(2)}x
                        </div>
                        <div className="text-[10px] font-mono text-yellow-400">
                          Brightness: {(brightness * 100).toFixed(0)}%
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 text-center">
                      <CameraIcon className="w-16 h-16 text-slate-600 mx-auto" />
                      <p className="text-slate-400">Kamera başlatılamadı</p>
                      <Button
                        onClick={() => startCamera()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Tekrar Dene
                      </Button>
                    </div>
                  )}
                </div>

                {/* Kontrol Buttonu */}
                {stream && (
                  <div className="bg-slate-950/50 border-t border-white/5 p-4 flex justify-between items-center">
                    <div className="text-xs text-slate-400 font-mono">
                      {new Date().toLocaleTimeString('tr-TR')}
                    </div>
                  </div>
                )}
              </div>

              {/* Ayarlar Panel */}
              {showSettings && stream && (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-blue-400" />
                    Kamera Ayarları
                  </h3>

                  {/* Zoom Kontrolü */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-white">Zoom</label>
                      <span className="text-sm text-blue-400 font-mono">{zoom.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Brightness Kontrolü */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-white">Parlaklık</label>
                      <span className="text-sm text-yellow-400 font-mono">
                        {(brightness * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={brightness}
                      onChange={(e) => setBrightness(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    className="w-full border-white/10 text-white"
                  >
                    Kapat
                  </Button>
                </div>
              )}

              {/* Kontrol Butonları */}
              {stream && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleCapture}
                    className="bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold flex items-center justify-center gap-2"
                  >
                    <CameraIcon className="w-5 h-5" />
                    Fotoğraf Çek
                  </Button>

                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10 h-14 text-lg font-bold"
                  >
                    <SettingsIcon className="w-5 h-5" />
                  </Button>

                  {!isRecording ? (
                    <Button
                      onClick={handleStartRecording}
                      className="col-span-2 bg-red-600 hover:bg-red-700 h-14 text-lg font-bold flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Video Kaydını Başlat
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopRecording}
                      className="col-span-2 bg-red-600 hover:bg-red-700 h-14 text-lg font-bold flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Square className="w-5 h-5" />
                      Kaydı Durdur
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Galeri ve Bilgi */}
            <div className="space-y-6">
              {/* Sistem Durumu */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white">Sistem Durumu</h3>

                {/* Kamera Durumu */}
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-white">Kamera</p>
                    <p className="text-xs text-slate-400">
                      {stream ? 'Arka Kamera Aktif' : 'İnaktif'}
                    </p>
                  </div>
                </div>

                {/* Konum Durumu */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 mt-1.5 rounded-full ${
                      location ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Konum</p>
                    <p className="text-xs text-slate-400">
                      {location
                        ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                        : 'Alınıyor...'}
                    </p>
                  </div>
                </div>

                {/* Kayıt Durumu */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 mt-1.5 rounded-full ${
                      isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Kayıt</p>
                    <p className="text-xs text-slate-400">
                      {isRecording ? 'Kayıt Aktif' : 'Hazır'}
                    </p>
                  </div>
                </div>

                {/* Senkronizasyon Durumu */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 mt-1.5 rounded-full ${
                      syncStats.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">Senkronizasyon</p>
                    <p className="text-xs text-slate-400">
                      {syncStats.isOnline ? 'Bağlı' : 'Çevrimdışı'} ({syncStats.bufferedItems} buffer)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={refreshLocation}
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/10 text-xs"
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    Konumu Yenile
                  </Button>
                  <Button
                    onClick={manualSync}
                    variant="outline"
                    className="w-full border-white/10 text-blue-400 hover:bg-blue-600/10 text-xs"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Şimdi Senkronize Et
                  </Button>
                </div>
              </div>

              {/* Fotoğraf Galerisi */}
              {capturedImages.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CameraIcon className="w-5 h-5 text-blue-400" />
                    Çekilen Fotoğraflar ({capturedImages.length})
                  </h3>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {capturedImages.slice(0, 5).map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img)}
                        className="w-full text-left p-3 bg-white/5 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all group"
                      >
                        <div className="flex gap-3 items-center">
                          <img
                            src={img.dataUrl}
                            alt="Captured"
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-slate-400">
                              {new Date(img.timestamp).toLocaleTimeString('tr-TR')}
                            </p>
                            {img.location && (
                              <p className="text-[10px] text-blue-400 truncate">
                                {img.location.lat.toFixed(4)}, {img.location.lng.toFixed(4)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Kayıt Seansları */}
              {recordingSessions.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Kayıt Seansları ({recordingSessions.length})
                  </h3>

                  <div className="space-y-2">
                    {recordingSessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex justify-between text-slate-400">
                          <span className="font-mono">
                            {new Date(session.startTime).toLocaleTimeString('tr-TR')}
                          </span>
                          <span className="text-amber-400">
                            {(session.duration / 1000).toFixed(1)}s
                          </span>
                        </div>
                        {session.location && (
                          <p className="text-blue-400 truncate">
                            {session.location.lat.toFixed(4)}, {session.location.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fotoğraf Detay Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedImage.dataUrl}
                    alt="Full"
                    className="w-full h-auto"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 border-t border-white/5">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Saat</p>
                    <p className="text-sm text-white font-mono">
                      {new Date(selectedImage.timestamp).toLocaleString('tr-TR')}
                    </p>
                  </div>

                  {selectedImage.location && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">Konum</p>
                      <p className="text-sm text-blue-400 font-mono">
                        {selectedImage.location.lat.toFixed(6)}, {selectedImage.location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleDownloadImage(selectedImage)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes scan-line {
              0% { top: 0%; opacity: 0; }
              5% { opacity: 1; }
              95% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            .animate-scan-line {
              animation: scan-line 3s linear infinite;
            }
          `,
        }} />
      </div>
    </PageLayout>
  );
}
