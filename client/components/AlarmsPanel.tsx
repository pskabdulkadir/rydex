import React, { useState, useEffect } from 'react';
import { useLocation } from '@/lib/location-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Bell,
  AlertTriangle,
  Zap,
  Volume2,
  Smartphone,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Alarm {
  id: string;
  type: 'kritik' | 'yüksek' | 'orta' | 'düşük';
  title: string;
  message: string;
  timestamp: number;
  location: string;
  magneticStrength: number;
  isRead: boolean;
}

interface AlarmsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlarm: (alarmId: string) => void;
  onClearAllAlarms: () => void;
}

const getDefaultAlarms = (lat: number, lng: number): Alarm[] => [
  {
    id: '1',
    type: 'kritik',
    title: 'Metal Yapı Tespit Edildi',
    message: 'Antik metal sandık benzeri yüksek magnetik imza algılandı',
    timestamp: Date.now() - 5 * 60000,
    location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    magneticStrength: 450,
    isRead: false,
  },
  {
    id: '2',
    type: 'yüksek',
    title: 'Anormal Zemin Sapması',
    message: 'Zemin stabilitesinde beklenmeyen düşüş tespit edildi',
    timestamp: Date.now() - 15 * 60000,
    location: `${(lat + 0.0003).toFixed(4)}, ${(lng + 0.0006).toFixed(4)}`,
    magneticStrength: 280,
    isRead: false,
  },
  {
    id: '3',
    type: 'orta',
    title: 'Bitki Anomalisi',
    message: 'Bölgedeki bitki örtüsünde stres belirtileri algılandı',
    timestamp: Date.now() - 30 * 60000,
    location: `${(lat - 0.0004).toFixed(4)}, ${(lng - 0.0004).toFixed(4)}`,
    magneticStrength: 120,
    isRead: true,
  },
  {
    id: '4',
    type: 'düşük',
    title: 'Sinyal Varyasyonu',
    message: 'Cihaz sinyalinde normal dalgalanma tespit edildi',
    timestamp: Date.now() - 45 * 60000,
    location: `${(lat - 0.0002).toFixed(4)}, ${(lng - 0.0002).toFixed(4)}`,
    magneticStrength: 85,
    isRead: true,
  },
];

export default function AlarmsPanel({
  isOpen,
  onClose,
  onAcknowledgeAlarm,
  onClearAllAlarms,
}: AlarmsPanelProps) {
  const { location } = useLocation();
  const [alarms, setAlarms] = useState<Alarm[]>(() => getDefaultAlarms(location.lat, location.lng));
  const [filterType, setFilterType] = useState<'tümü' | 'okunmayan' | 'okunan'>('tümü');
  const [alertSoundFreq, setAlertSoundFreq] = useState(1000);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update alarms when location changes
  useEffect(() => {
    setAlarms(getDefaultAlarms(location.lat, location.lng));
  }, [location]);

  const filteredAlarms = alarms.filter((alarm) => {
    if (filterType === 'okunmayan') return !alarm.isRead;
    if (filterType === 'okunan') return alarm.isRead;
    return true;
  });

  const handleAcknowledgeAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === alarmId ? { ...a, isRead: true } : a
      )
    );
    onAcknowledgeAlarm(alarmId);
  };

  const handleClearAll = () => {
    setAlarms([]);
    setShowDeleteConfirm(false);
    onClearAllAlarms();
  };

  const getAlarmColor = (type: Alarm['type']) => {
    switch (type) {
      case 'kritik':
        return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'yüksek':
        return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'orta':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'düşük':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      default:
        return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  };

  const getAlarmIcon = (type: Alarm['type']) => {
    switch (type) {
      case 'kritik':
        return '🚨';
      case 'yüksek':
        return '⚠️';
      case 'orta':
        return '⚡';
      case 'düşük':
        return 'ℹ️';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes}dk önce`;
    if (hours < 24) return `${hours}s önce`;
    return `${days}g önce`;
  };

  const unreadCount = alarms.filter((a) => !a.isRead).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#020617] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <Bell className="w-6 h-6 text-red-400" />
            ALARMLAR & UYARILAR
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white ml-auto">
                {unreadCount} yeni
              </Badge>
            )}
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-2">
            Sistem tarafından tetiklenen tüm alarmları ve uyarıları buradan yönetin.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* İstatistikler */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-400">
                {alarms.filter((a) => a.type === 'kritik').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Kritik</div>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-orange-400">
                {alarms.filter((a) => a.type === 'yüksek').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Yüksek</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-yellow-400">
                {alarms.filter((a) => a.type === 'orta').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Orta</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-blue-400">
                {alarms.filter((a) => a.type === 'düşük').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Düşük</div>
            </div>
          </div>

          {/* Filtreler */}
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              Filtre
            </label>
            <div className="flex gap-2">
              {(['tümü', 'okunmayan', 'okunan'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-bold transition-all',
                    filterType === filter
                      ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  )}
                >
                  {filter === 'tümü' && 'Tüm Alarmlar'}
                  {filter === 'okunmayan' && `Okunmayan (${alarms.filter((a) => !a.isRead).length})`}
                  {filter === 'okunan' && `Okunan (${alarms.filter((a) => a.isRead).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Ses Ayarı */}
          <div className="space-y-4 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              Ses Uyarısı Frekansı
            </label>
            <div className="flex items-center gap-4">
              <Slider
                min={500}
                max={2000}
                step={100}
                value={[alertSoundFreq]}
                onValueChange={(value) => setAlertSoundFreq(value[0])}
                className="flex-1"
              />
              <span className="text-sm font-bold text-blue-400 min-w-[60px]">{alertSoundFreq}Hz</span>
            </div>
            <p className="text-xs text-slate-400">
              Uyarı sesinin frekansını özelleştirin. {alertSoundFreq < 1000 ? 'Düşük (gece)' : 'Yüksek (gündüz)'} ses seviyesi için uygun.
            </p>
          </div>

          {/* Alarmlar Listesi */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300">
              ALARM TARİHÇESİ ({filteredAlarms.length})
            </h3>

            {filteredAlarms.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 text-sm">Alarm bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={cn(
                      'border rounded-xl p-4 transition-all',
                      alarm.isRead ? 'opacity-60' : 'opacity-100',
                      getAlarmColor(alarm.type)
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{getAlarmIcon(alarm.type)}</span>
                          <div>
                            <h4 className="font-bold text-white">{alarm.title}</h4>
                            <p className="text-xs opacity-75">{alarm.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs opacity-70 mt-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(alarm.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {alarm.magneticStrength} µT
                          </span>
                          <span className="flex items-center gap-1">
                            📍 {alarm.location}
                          </span>
                        </div>
                      </div>

                      {!alarm.isRead && (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledgeAlarm(alarm.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 flex-shrink-0"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Onayla
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İstatistik Özeti */}
          {alarms.length > 0 && (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase">ÖZET</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <p>Toplam Alarm: {alarms.length}</p>
                <p>Okunmayan: <span className="text-red-400 font-bold">{alarms.filter((a) => !a.isRead).length}</span></p>
                <p>En Yeni: {formatTime(alarms[0]?.timestamp || 0)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          {alarms.length > 0 && (
            <>
              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tümünü Temizle
                </Button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleClearAll}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Evet, Sil
                  </Button>
                </div>
              )}
            </>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
