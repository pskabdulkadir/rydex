import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  MapPin,
  Zap,
  Calendar,
  Layers,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useLocation } from '@/lib/location-context';

interface SmartFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: SmartFilterOptions) => void;
  currentLocation?: { lat: number; lng: number };
}

export interface SmartFilterOptions {
  depthMin: number;
  depthMax: number;
  anomalyLevel: 'düşük' | 'orta' | 'yüksek' | 'tümü';
  dateRange: 'bugün' | 'hafta' | 'ay' | 'tümü';
  locationRadius: number; // km
  enableLocationFilter: boolean;
}

const DEFAULT_FILTERS: SmartFilterOptions = {
  depthMin: 0,
  depthMax: 10,
  anomalyLevel: 'tümü',
  dateRange: 'tümü',
  locationRadius: 5,
  enableLocationFilter: false,
};

export default function SmartFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  currentLocation: propLocation,
}: SmartFilterModalProps) {
  const { location: globalLocation } = useLocation();
  const currentLocation = propLocation || globalLocation;
  const [filters, setFilters] = useState<SmartFilterOptions>(DEFAULT_FILTERS);
  const [isApplying, setIsApplying] = useState(false);

  const anomalyLevels = [
    { value: 'tümü' as const, label: 'Tüm Seviyeleri', color: 'bg-slate-600' },
    { value: 'düşük' as const, label: 'Düşük', color: 'bg-green-600' },
    { value: 'orta' as const, label: 'Orta', color: 'bg-amber-600' },
    { value: 'yüksek' as const, label: 'Yüksek', color: 'bg-red-600' },
  ];

  const dateRanges = [
    { value: 'bugün' as const, label: '📅 Bugün' },
    { value: 'hafta' as const, label: '📆 Geçen Hafta' },
    { value: 'ay' as const, label: '📊 Geçen Ay' },
    { value: 'tümü' as const, label: '📚 Tüm Veriler' },
  ];

  const handleApplyFilter = async () => {
    setIsApplying(true);
    await new Promise((r) => setTimeout(r, 300));
    onApplyFilter(filters);
    setIsApplying(false);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'düşük':
        return 'border-green-500/50 bg-green-500/10 text-green-400';
      case 'orta':
        return 'border-amber-500/50 bg-amber-500/10 text-amber-400';
      case 'yüksek':
        return 'border-red-500/50 bg-red-500/10 text-red-400';
      default:
        return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#020617] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-400" />
            AKILLI FİLTRE - DEŞİFRE MOD
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-2">
            Derinlik, konum ve anomali türüne göre verilerinizi filtreleyin. Tüm filtreler eş zamanlı olarak uygulanır.
          </p>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Derinlik Aralığı Filtresi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Derinlik Aralığı (m)
              </label>
              <span className="text-xs bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1 text-blue-400">
                {filters.depthMin}m - {filters.depthMax}m
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-2 block">Minimum Derinlik</label>
                  <Input
                    type="number"
                    min="0"
                    max={filters.depthMax}
                    value={filters.depthMin}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        depthMin: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="bg-white/5 border-white/10 text-white h-10"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-2 block">Maksimum Derinlik</label>
                  <Input
                    type="number"
                    min={filters.depthMin}
                    max="50"
                    value={filters.depthMax}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        depthMax: Math.min(50, Number(e.target.value)),
                      }))
                    }
                    className="bg-white/5 border-white/10 text-white h-10"
                  />
                </div>
              </div>
              <Slider
                min={0}
                max={50}
                step={0.5}
                value={[filters.depthMin, filters.depthMax]}
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    depthMin: value[0],
                    depthMax: value[1],
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Anomali Seviyesi Filtresi */}
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Anomali Seviyesi
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {anomalyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() =>
                    setFilters((f) => ({ ...f, anomalyLevel: level.value }))
                  }
                  className={cn(
                    'p-3 rounded-xl border transition-all',
                    filters.anomalyLevel === level.value
                      ? 'border-blue-500 bg-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className={cn('text-xs font-bold block', {
                    'text-white': filters.anomalyLevel === level.value,
                    'text-slate-400': filters.anomalyLevel !== level.value,
                  })}>
                    {level.label}
                  </span>
                  {filters.anomalyLevel === level.value && (
                    <ChevronRight className="w-3 h-3 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tarih Aralığı Filtresi */}
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              Tarih Aralığı
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() =>
                    setFilters((f) => ({ ...f, dateRange: range.value }))
                  }
                  className={cn(
                    'p-3 rounded-xl border transition-all text-left',
                    filters.dateRange === range.value
                      ? 'border-green-500 bg-green-600/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className={cn('text-xs font-bold', {
                    'text-white': filters.dateRange === range.value,
                    'text-slate-400': filters.dateRange !== range.value,
                  })}>
                    {range.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Konum Bazlı Filtre */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Konum Çapı Filtresi
              </label>
              {currentLocation ? (
                <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400 text-xs">
                  <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Aktif Konum
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-slate-500/10 border-slate-500/30 text-slate-400 text-xs">
                  Konum verisi alınamıyor
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableLocation"
                  checked={filters.enableLocationFilter}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      enableLocationFilter: e.target.checked,
                    }))
                  }
                  disabled={!currentLocation}
                  className="w-4 h-4 rounded border border-white/20 accent-blue-600"
                />
                <label
                  htmlFor="enableLocation"
                  className={cn('text-sm font-bold', 
                    !currentLocation ? 'text-slate-500 cursor-not-allowed' : 'text-white cursor-pointer'
                  )}
                >
                  Geçerli konumdan filtrele
                </label>
              </div>

              {filters.enableLocationFilter && currentLocation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400">Çap Mesafesi: {filters.locationRadius} km</label>
                    <span className="text-xs bg-purple-600/20 border border-purple-500/30 rounded px-2 py-1 text-purple-400">
                      {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </span>
                  </div>
                  <Slider
                    min={0.5}
                    max={50}
                    step={0.5}
                    value={[filters.locationRadius]}
                    onValueChange={(value) =>
                      setFilters((f) => ({ ...f, locationRadius: value[0] }))
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Filtre Özeti */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">UYGULANACAK FİLTRELER</h4>
            <div className="text-sm text-slate-300 space-y-1">
              <p>
                <span className="text-blue-400">Derinlik:</span> {filters.depthMin}m - {filters.depthMax}m
              </p>
              <p>
                <span className="text-blue-400">Anomali:</span>{' '}
                <span className={cn('font-bold', getLevelColor(filters.anomalyLevel))}>
                  {anomalyLevels.find((a) => a.value === filters.anomalyLevel)?.label}
                </span>
              </p>
              <p>
                <span className="text-blue-400">Tarih:</span>{' '}
                {dateRanges.find((d) => d.value === filters.dateRange)?.label}
              </p>
              {filters.enableLocationFilter && currentLocation && (
                <p>
                  <span className="text-blue-400">Konum:</span> {filters.locationRadius} km çapında
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-white/20 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sıfırla
          </Button>
          <Button
            onClick={handleApplyFilter}
            disabled={isApplying}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uygulanıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                FİLTRELEMEYİ UYGULA
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
