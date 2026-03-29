import React, { useState } from 'react';
import { Waves, AlertTriangle, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Canal {
  id: number;
  name: string;
  length: number;
  width: number;
  depth: number;
  waterLevel: number;
  waterQuality: string;
  currentSpeed: number;
  purpose: string;
  hazards: string;
}

interface WaterCanalsDetailProps {
  waterCanals?: {
    canalCount: number;
    totalWaterVolume: number;
    canals: Canal[];
  };
}

export default function WaterCanalsDetail({
  waterCanals,
}: WaterCanalsDetailProps) {
  const navigate = useNavigate();
  const [expandedCanal, setExpandedCanal] = useState<number | null>(null);

  if (!waterCanals || waterCanals.canals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Waves className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Su kanalı verisi bulunamadı</p>
      </div>
    );
  }

  const getWaterQualityColor = (quality: string) => {
    switch (quality) {
      case 'Temiz':
        return 'bg-green-100 text-green-700';
      case 'Kirli':
        return 'bg-yellow-100 text-yellow-700';
      case 'Stagnant':
        return 'bg-orange-100 text-orange-700';
      case 'Toksik':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Detaylı Arama Butonu */}
      <Button
        onClick={() => navigate('/app/application-features')}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-4 rounded-lg font-bold text-base shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
      >
        <Microscope className="w-5 h-5" />
        Detaylı Arama Başlat
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-lg border border-blue-300">
          <p className="text-sm text-gray-600">Su Kanalları</p>
          <p className="text-3xl font-bold text-blue-700">{waterCanals.canalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-100 to-teal-100 p-4 rounded-lg border border-cyan-300">
          <p className="text-sm text-gray-600">Toplam Su</p>
          <p className="text-2xl font-bold text-cyan-700">
            {(waterCanals.totalWaterVolume / 1000).toFixed(0)}k m³
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Kanal Detayları</h4>
        {waterCanals.canals.map((canal) => (
          <div key={canal.id} className="bg-blue-50 border border-blue-200 rounded-lg">
            <button
              onClick={() => setExpandedCanal(expandedCanal === canal.id ? null : canal.id)}
              className="w-full p-3 text-left hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Waves className="w-4 h-4 text-blue-600" />
                    <h5 className="font-bold text-sm text-gray-900">{canal.name}</h5>
                  </div>
                  <p className="text-xs text-gray-600">{canal.purpose}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${getWaterQualityColor(canal.waterQuality)}`}>
                  {canal.waterQuality}
                </span>
              </div>
            </button>

            {expandedCanal === canal.id && (
              <div className="border-t border-blue-200 p-3 bg-white space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="text-gray-600">Uzunluk</p>
                    <p className="font-bold">{canal.length.toFixed(0)}m</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="text-gray-600">Genişlik</p>
                    <p className="font-bold">{canal.width.toFixed(1)}m</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="text-gray-600">Derinlik</p>
                    <p className="font-bold">{canal.depth.toFixed(1)}m</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="text-gray-600">Su Seviyesi</p>
                    <p className="font-bold">{canal.waterLevel.toFixed(0)}%</p>
                    <div className="flex-1 bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${canal.waterLevel}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <p className="text-gray-600">Akış Hızı</p>
                    <p className="font-bold">{canal.currentSpeed.toFixed(1)}m/s</p>
                  </div>
                </div>

                {canal.hazards && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-900">Tehlikeler</p>
                      <p className="text-xs text-red-700">{canal.hazards}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
