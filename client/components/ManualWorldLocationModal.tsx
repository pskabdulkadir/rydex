import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Globe,
  Layers,
  Maximize,
  AlertCircle,
  CheckCircle,
  Map as MapIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import MapLocationPicker from '@/components/MapLocationPicker';

interface ManualWorldLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    latitude: number;
    longitude: number;
    depth: number;
    area: number;
  }) => void;
}

export default function ManualWorldLocationModal({
  isOpen,
  onClose,
  onConfirm,
}: ManualWorldLocationModalProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [depth, setDepth] = useState('2.5');
  const [area, setArea] = useState('10');

  const validateCoordinates = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Hata', { description: 'Geçerli enlem ve boylam girin' });
      return false;
    }

    if (lat < -90 || lat > 90) {
      toast.error('Hata', { description: 'Enlem -90 ile 90 arasında olmalı' });
      return false;
    }

    if (lng < -180 || lng > 180) {
      toast.error('Hata', { description: 'Boylam -180 ile 180 arasında olmalı' });
      return false;
    }

    if (!depth || parseFloat(depth) <= 0) {
      toast.error('Hata', { description: 'Geçerli derinlik girin' });
      return false;
    }

    if (!area || parseFloat(area) <= 0) {
      toast.error('Hata', { description: 'Geçerli metrekare girin' });
      return false;
    }

    return true;
  };

  const handleConfirm = () => {
    if (!validateCoordinates()) return;

    onConfirm({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      depth: parseFloat(depth),
      area: parseFloat(area),
    });

    // Formu sıfırla
    setLatitude('');
    setLongitude('');
    setDepth('2.5');
    setArea('10');
    onClose();
    toast.success('Konum ve parametreler başarıyla ayarlandı');
  };

  const handleClose = () => {
    setLatitude('');
    setLongitude('');
    setDepth('2.5');
    setArea('10');
    onClose();
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    toast.success(`Konum seçildi: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
  };

  const isFormValid =
    latitude &&
    longitude &&
    depth &&
    area &&
    parseFloat(latitude) >= -90 &&
    parseFloat(latitude) <= 90 &&
    parseFloat(longitude) >= -180 &&
    parseFloat(longitude) <= 180 &&
    parseFloat(depth) > 0 &&
    parseFloat(area) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-white text-gray-900 border border-gray-300 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            Dünya Haritasından Konum Seçimi
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Harita üzerinde herhangi bir yere tıklayarak konum seçin veya manuel olarak girin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Dünya Haritası */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-blue-600" />
              Dünya Haritası
            </label>
            <p className="text-xs text-gray-600">
              Harita üzerinde istediğiniz konuma tıklayın. Seçilen konum otomatik olarak aşağıya doldurulacak.
            </p>
            <div className="rounded-xl overflow-hidden border-2 border-gray-200 h-96 bg-gray-50">
              <MapLocationPicker
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>

          {/* Konum Bilgileri */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            {latitude && longitude ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Konum seçildi</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">ENLEM</p>
                    <p className="font-mono font-bold text-blue-700">
                      {parseFloat(latitude).toFixed(6)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">BOYLAM</p>
                    <p className="font-mono font-bold text-blue-700">
                      {parseFloat(longitude).toFixed(6)}°
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Lütfen harita üzerinde bir konuma tıklayın veya aşağıda manuel olarak girin
                </span>
              </div>
            )}
          </div>

          {/* Manuel Konum Girişi */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <label className="text-sm font-bold text-gray-700">
              Manuel Konum Girişi
            </label>

            {/* Enlem/Boylam Inputları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Enlem (-90 ile 90 arası)
                </label>
                <Input
                  type="number"
                  min="-90"
                  max="90"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="40.6016"
                  className="text-base"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Boylam (-180 ile 180 arası)
                </label>
                <Input
                  type="number"
                  min="-180"
                  max="180"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="34.4633"
                  className="text-base"
                />
              </div>
            </div>
          </div>

          {/* Tarama Parametreleri */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <label className="text-sm font-bold text-gray-700">
              Tarama Parametreleri
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Derinlik */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-purple-600" />
                  Derinlik (Metre)
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
                      placeholder="2.5"
                      className="text-base"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    m
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Taramanın yapılacağı toprak derinliğini belirtin (0-50m)
                </p>
              </div>

              {/* Alan */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Maximize className="w-3 h-3 text-green-600" />
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
                      placeholder="10"
                      className="text-base"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    m²
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Taranacak alan ölçüsünü belirtin (1-1000 m²)
                </p>
              </div>
            </div>
          </div>

          {/* Özet */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase">
              TARAMA PARAMETRELERİ ÖZETI
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 text-xs mb-1">ENLEM</p>
                <p className="font-mono font-bold text-gray-900">
                  {latitude ? parseFloat(latitude).toFixed(4) + '°' : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">BOYLAM</p>
                <p className="font-mono font-bold text-gray-900">
                  {longitude ? parseFloat(longitude).toFixed(4) + '°' : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">DERİNLİK</p>
                <p className="font-mono font-bold text-gray-900">
                  {depth ? parseFloat(depth).toFixed(1) + 'm' : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">ALAN</p>
                <p className="font-mono font-bold text-gray-900">
                  {area ? parseFloat(area).toFixed(0) + 'm²' : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Konumu Onayla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
