import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STRUCTURES, StructureType } from '@/lib/structures';
import { AlertCircle, Layers, Gauge, TrendingUp, Shield, MapPin, Navigation, Maximize, Scan, Zap, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocation } from '@/lib/location-context';

interface StructureDetailsModalProps {
  structureId: StructureType;
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: { lat: number; lng: number } | null;
  defaultDepth?: string;
  defaultArea?: string;
  onCameraOpen?: () => void;
}

export default function StructureDetailsModal({
  structureId,
  isOpen,
  onClose,
  defaultLocation,
  defaultDepth = '2.5',
  defaultArea = '10',
  onCameraOpen
}: StructureDetailsModalProps) {
  const { location: globalLocation, refreshLocation, isGettingLocation: globalIsGetting, error: globalError } = useLocation();
  const structure = STRUCTURES[structureId];
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(defaultLocation || globalLocation || null);
  const [depth, setDepth] = useState(defaultDepth);
  const [area, setArea] = useState(defaultArea);
  const [isScanning, setIsScanning] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocation(defaultLocation || globalLocation || null);
      setDepth(defaultDepth);
      setArea(defaultArea);
      setLocationError(globalError);
    }
  }, [isOpen, defaultLocation, defaultDepth, defaultArea, globalLocation, globalError]);

  if (!structure) return null;

  const handleGetCurrentLocation = async () => {
    try {
      await refreshLocation();
      toast.success('Konum Güncellendi');
    } catch (err) {
      toast.error('Konum Hatası', { description: String(err) });
    }
  };

  const isGettingLocation = globalIsGetting;

  const handleStartScan = async () => {
    if (!location) {
      toast.error('Hata', { description: 'Konum seçiniz' });
      return;
    }

    setIsScanning(true);
    // Simulate scan
    await new Promise((r) => setTimeout(r, 1000));

    toast.success('✅ Tarama Başladı', {
      description: `${structure.name} için tarama başlatıldı. Konum: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
    });

    setIsScanning(false);
    onClose();

    // Redirect to a dummy scanner page or handle navigation
    window.location.href = `/structure-scanner?id=${structureId}&lat=${location.lat}&lng=${location.lng}&depth=${depth}&area=${area}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#020617] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{structure.icon}</span>
            <div>
              <DialogTitle className="text-2xl font-black">{structure.name}</DialogTitle>
              <p className="text-sm text-slate-400 mt-1 uppercase font-bold tracking-widest">{structure.categoryName}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Scan Section */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-blue-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              ANLIK TARAMA PARAMETRELERİ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4 col-span-1 md:col-span-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Tarama Konumu
                </label>

                {/* Konum Bilgi Kartı */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  {location ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">ENLEM (LAT)</p>
                          <p className="text-lg font-mono font-bold text-blue-400">{location.lat.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold mb-1">BOYLAM (LNG)</p>
                          <p className="text-lg font-mono font-bold text-blue-400">{location.lng.toFixed(6)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-400 mt-3">
                        <CheckCircle className="w-3 h-3" />
                        Konum başarıyla alındı
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Konum henüz seçilmemiş</span>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {locationError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{locationError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold shadow-lg shadow-blue-500/20"
                  >
                    {isGettingLocation ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Konum Alınıyor...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        MEVCUT KONUMU AL
                      </span>
                    )}
                  </Button>
                  {onCameraOpen && (
                    <Button
                      variant="outline"
                      onClick={onCameraOpen}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 border-none"
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">HEDEF DERİNLİK (M)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    className="bg-slate-900 border-white/10 h-10 pl-10"
                  />
                  <Layers className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">METRE KARE (M²)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="bg-slate-900 border-white/10 h-10 pl-10"
                  />
                  <Maximize className="w-4 h-4 text-green-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartScan}
              disabled={isScanning || !location}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 font-black text-lg shadow-lg shadow-blue-500/20"
            >
              {isScanning ? 'TARAMA BAŞLATILIYOR...' : 'BU YAPIYI TARAMAYI BAŞLAT'}
            </Button>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-white">Açıklama</h3>
            <p className="text-slate-400 leading-relaxed">{structure.description}</p>
          </div>

          {/* Key Parameters */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Ana Parametreler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Derinlik Aralığı</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {structure.depthRangeMin}m - {structure.depthRangeMax}m
                </p>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Yoğunluk Seviyesi</span>
                </div>
                <p className="text-2xl font-black text-white">{structure.typicalDensity}%</p>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Aktivite Skoru</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Yoğunluğa ve derinliğe bağlı olarak değişir
                </p>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Stabilite</span>
                </div>
                <p className="text-2xl font-black text-white">{structure.typicalStability}%</p>
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-white">Tanımlayıcı Özellikler</h3>
            <ul className="space-y-2">
              {structure.characteristics.map((characteristic, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 font-black mt-1">✓</span>
                  <span className="text-slate-400">{characteristic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scoring Information */}
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white mb-2 uppercase text-xs">Puanlama Bilgisi</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bu yapı türü, çok katmanlı skor motoru tarafından değerlendirilir. Manyetik dalgalanma,
                  alan hareket stabilitesi, zaman faktörü, eğim uygunluğu ve alan tarama yoğunluğu gibi
                  faktörler göz önünde bulundurularak puanlandırılır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
