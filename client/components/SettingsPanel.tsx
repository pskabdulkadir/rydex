import React, { useState } from 'react';
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
  Settings,
  Radio,
  Zap,
  Maximize,
  Volume2,
  Smartphone,
  Save,
  RotateCcw,
} from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: SystemSettings) => void;
}

export interface SystemSettings {
  alertThreshold: number; // µT
  gridSize: number; // meters
  depthSensitivity: 'düşük' | 'orta' | 'yüksek';
  audioAlerts: boolean;
  vibrationAlerts: boolean;
  anomalyColor: 'sıcak' | 'soğuk' | 'spektrum';
  cameraResolution: '720p' | '1080p' | '4k';
  autoSync: boolean;
  dataRetention: number; // days
}

const DEFAULT_SETTINGS: SystemSettings = {
  alertThreshold: 100,
  gridSize: 5,
  depthSensitivity: 'orta',
  audioAlerts: true,
  vibrationAlerts: true,
  anomalyColor: 'spektrum',
  cameraResolution: '1080p',
  autoSync: true,
  dataRetention: 90,
};

export default function SettingsPanel({
  isOpen,
  onClose,
  onSaveSettings,
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSaveSettings(settings);
    setIsSaving(false);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#020617] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            SİSTEM KONFİGÜRASYONU
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-2">
            Sistem ayarlarını ve performans parametrelerini özelleştirin.
          </p>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Alert Threshold */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                Alarm Eşik Değeri (µT)
              </label>
              <span className="text-xs bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1 text-blue-400">
                {settings.alertThreshold} µT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manyetik alan bu değeri aştığında sistem otomatik uyarı tetikler.
            </p>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[settings.alertThreshold]}
              onValueChange={(value) =>
                setSettings((s) => ({ ...s, alertThreshold: value[0] }))
              }
              className="w-full"
            />
          </div>

          {/* Grid Size */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold flex items-center gap-2">
                <Maximize className="w-4 h-4 text-purple-400" />
                Grid Boyutu (metre)
              </label>
              <span className="text-xs bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1 text-purple-400">
                {settings.gridSize}m × {settings.gridSize}m
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Alan taramasında kullanılacak ızgara hücresi boyutu. Düşük değer = daha detaylı tarama.
            </p>
            <Slider
              min={1}
              max={20}
              step={0.5}
              value={[settings.gridSize]}
              onValueChange={(value) =>
                setSettings((s) => ({ ...s, gridSize: value[0] }))
              }
              className="w-full"
            />
          </div>

          {/* Depth Sensitivity */}
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Derinlik Sensitivitesi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['düşük', 'orta', 'yüksek'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setSettings((s) => ({ ...s, depthSensitivity: level }))
                  }
                  className={cn(
                    'p-3 rounded-xl border transition-all text-center',
                    settings.depthSensitivity === level
                      ? 'border-amber-500 bg-amber-600/20 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className={cn('text-sm font-bold', {
                    'text-white': settings.depthSensitivity === level,
                    'text-slate-400': settings.depthSensitivity !== level,
                  })}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {settings.depthSensitivity === 'düşük' && 'Daha geniş derinlik aralığında tarama, daha hızlı işlem'}
              {settings.depthSensitivity === 'orta' && 'Dengeli tarama ve hız. Önerilen ayar.'}
              {settings.depthSensitivity === 'yüksek' && 'Dar derinlik aralığında yüksek hassasiyet, daha yavaş işlem'}
            </p>
          </div>

          {/* Audio & Vibration Alerts */}
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-400" />
              Uyarı Modu
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <input
                  type="checkbox"
                  id="audioAlerts"
                  checked={settings.audioAlerts}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      audioAlerts: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border border-white/20 accent-green-600"
                />
                <label htmlFor="audioAlerts" className="text-sm font-bold text-white cursor-pointer flex-1">
                  Ses Uyarılarını Etkinleştir
                </label>
                <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400 text-xs">
                  {settings.audioAlerts ? 'AÇIK' : 'KAPALI'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <input
                  type="checkbox"
                  id="vibrationAlerts"
                  checked={settings.vibrationAlerts}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      vibrationAlerts: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border border-white/20 accent-blue-600"
                />
                <label htmlFor="vibrationAlerts" className="text-sm font-bold text-white cursor-pointer flex-1">
                  Titreşim Uyarılarını Etkinleştir
                </label>
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 text-xs">
                  {settings.vibrationAlerts ? 'AÇIK' : 'KAPALI'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Anomaly Color Scheme */}
          <div className="space-y-4">
            <label className="text-sm font-bold">Anomali Renk Şeması</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sıcak', 'soğuk', 'spektrum'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() =>
                    setSettings((s) => ({ ...s, anomalyColor: scheme }))
                  }
                  className={cn(
                    'p-3 rounded-xl border transition-all text-center',
                    settings.anomalyColor === scheme
                      ? 'border-purple-500 bg-purple-600/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className={cn('text-sm font-bold', {
                    'text-white': settings.anomalyColor === scheme,
                    'text-slate-400': settings.anomalyColor !== scheme,
                  })}>
                    {scheme === 'sıcak' && '🔥'}
                    {scheme === 'soğuk' && '❄️'}
                    {scheme === 'spektrum' && '🌈'}
                    {' '}
                    {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Resolution */}
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Kamera Çözünürlüğü
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '4k'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      cameraResolution: res,
                    }))
                  }
                  className={cn(
                    'p-3 rounded-xl border transition-all text-center',
                    settings.cameraResolution === res
                      ? 'border-cyan-500 bg-cyan-600/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <span className={cn('text-sm font-bold', {
                    'text-white': settings.cameraResolution === res,
                    'text-slate-400': settings.cameraResolution !== res,
                  })}>
                    {res}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Sync */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="autoSync"
                checked={settings.autoSync}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    autoSync: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border border-white/20 accent-indigo-600"
              />
              <label htmlFor="autoSync" className="text-sm font-bold text-white cursor-pointer flex-1">
                Otomatik Senkronizasyon
              </label>
              <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
                {settings.autoSync ? 'AÇIK' : 'KAPALI'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Tarama verileri otomatik olarak buluta yedeklenecek.
            </p>
          </div>

          {/* Data Retention */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">Veri Saklama Süresi</label>
              <span className="text-xs bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1 text-red-400">
                {settings.dataRetention} gün
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bu süreyi aşan tarama verileri otomatik olarak silinecektir.
            </p>
            <Slider
              min={30}
              max={365}
              step={30}
              value={[settings.dataRetention]}
              onValueChange={(value) =>
                setSettings((s) => ({ ...s, dataRetention: value[0] }))
              }
              className="w-full"
            />
          </div>

          {/* Settings Summary */}
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AKTİF AYARLAR ÖZETİ</h4>
            <div className="text-sm text-slate-300 space-y-1">
              <p>
                <span className="text-indigo-400">Alert Eşik:</span> {settings.alertThreshold} µT
              </p>
              <p>
                <span className="text-indigo-400">Grid Boyutu:</span> {settings.gridSize}m × {settings.gridSize}m
              </p>
              <p>
                <span className="text-indigo-400">Derinlik Modu:</span> {settings.depthSensitivity}
              </p>
              <p>
                <span className="text-indigo-400">Uyarılar:</span>{' '}
                {settings.audioAlerts && 'Ses '}
                {settings.vibrationAlerts && 'Titreşim'}
                {!settings.audioAlerts && !settings.vibrationAlerts && 'Devre dışı'}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 border-white/20 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Varsayılan
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Kaydediliyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                KAYDET
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
