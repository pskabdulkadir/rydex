import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Maximize,
  Layers,
  Zap,
  Navigation,
  Scan,
  CheckCircle,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from '@/lib/location-context';

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanType: 'structure-scanner' | '3d-viewer' | 'radar-scanner' | 'area-scanner' | null;
  title: string;
  description: string;
  icon: React.ReactNode;
  onStartScan: (params: ScanParameters) => void;
  onCameraOpen?: () => void;
  defaultLocation?: { lat: number; lng: number } | null;
}

export interface ScanParameters {
  latitude: number;
  longitude: number;
  depth: number;
  area: number;
  scanType: string;
}

const SCAN_TYPE_LABELS: Record<string, string> = {
  'structure-scanner': 'Çok Katmanlı Analiz Pro',
  '3d-viewer': '3D Modelleme',
  'radar-scanner': 'Radar Sistemi',
  'area-scanner': 'Grid Haritalama',
};

export default function QuickScanModal({
  isOpen,
  onClose,
  scanType,
  title,
  description,
  icon,
  onStartScan,
  onCameraOpen,
  defaultLocation,
}: QuickScanModalProps) {
  const { location: globalLocation, refreshLocation, isGettingLocation: globalIsGetting, error: globalError } = useLocation();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(defaultLocation || globalLocation || null);
  const [depth, setDepth] = useState('2.5');
  const [area, setArea] = useState('10');
  const [isScanning, setIsScanning] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sync with global location or prop
  useEffect(() => {
    if (isOpen) {
      setLocation(defaultLocation || globalLocation || null);
      setLocationError(globalError);
    }
  }, [isOpen, defaultLocation, globalLocation, globalError]);

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

    if (!depth || parseFloat(depth) <= 0) {
      toast.error('Hata', { description: 'Geçerli derinlik girin' });
      return;
    }

    if (!area || parseFloat(area) <= 0) {
      toast.error('Hata', { description: 'Geçerli metrekare girin' });
      return;
    }

    setIsScanning(true);

    // Tarama başlat
    await new Promise((r) => setTimeout(r, 500));

    onStartScan({
      latitude: location.lat,
      longitude: location.lng,
      depth: parseFloat(depth),
      area: parseFloat(area),
      scanType: SCAN_TYPE_LABELS[scanType || ''] || 'Tarama',
    });

    setIsScanning(false);
    onClose();
  };

  const isFormValid = location && depth && area && parseFloat(depth) > 0 && parseFloat(area) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#020617] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            {title}
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-2">{description}</p>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Konum Seçimi */}
          <div className="space-y-4">
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

            {/* Mevcut Konumu Al & Kamerayı Aç Buton Grubu */}
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

          {/* Derinlik Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Derinlik
            </label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="örn: 2.5"
                  className="bg-white/5 border-white/10 text-white h-12 text-lg"
                />
              </div>
              <div className="text-xs text-slate-400 font-bold bg-white/5 border border-white/10 rounded-lg px-3 py-3">
                METRE
              </div>
            </div>
            <p className="text-xs text-slate-400">Taramanın yapılacağı toprak derinliğini belirtin (0-50m)</p>
          </div>

          {/* Metrekare Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <Maximize className="w-4 h-4 text-green-400" />
              Metre Kare
            </label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="örn: 10"
                  className="bg-white/5 border-white/10 text-white h-12 text-lg"
                />
              </div>
              <div className="text-xs text-slate-400 font-bold bg-white/5 border border-white/10 rounded-lg px-3 py-3">
                M²
              </div>
            </div>
            <p className="text-xs text-slate-400">Taranacak alan ölçüsünü belirtin (1-1000 m²)</p>
          </div>

          {/* Özet */}
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">TARAMA PARAMETRELERİ</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Sistem</p>
                <p className="text-white font-bold">{title}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Konum Durumu</p>
                <Badge className={cn(
                  'w-fit',
                  location
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-600 text-slate-200'
                )}>
                  {location ? 'Hazır' : 'Seçilmemiş'}
                </Badge>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Derinlik</p>
                <p className="text-white font-bold">{depth || '—'}m</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Alan</p>
                <p className="text-white font-bold">{area || '—'}m²</p>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 text-sm text-indigo-300 space-y-2">
            <p className="font-bold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Tarama Nasıl Çalışır?
            </p>
            <ul className="text-xs space-y-1 ml-6 list-disc text-slate-400">
              <li>Mevcut konumunuzdan GPS verisi alınır</li>
              <li>Belirlediğiniz derinlikte ve alan boyutunda tarama yapılır</li>
              <li>Çok katmanlı sensör verileri birleştirilir</li>
              <li>Anomaliler ve yapılar otomatik tespit edilir</li>
            </ul>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 text-slate-400 hover:text-white"
          >
            İptal
          </Button>
          <Button
            onClick={handleStartScan}
            disabled={!isFormValid || isScanning}
            className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Başlatılıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                TARAMAYI BAŞLAT
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
