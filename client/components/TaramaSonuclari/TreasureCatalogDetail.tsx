import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, DollarSign, MapPin, CheckCircle, Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Treasure {
  id: number;
  name: string;
  type: string;
  depth: number;
  coordinates: { latitude: number; longitude: number };
  estimatedValue: number;
  confidence: number;
  material: string;
  weight: number;
  condition: string;
  discoveryProbability: number;
}

interface TreasureCatalogDetailProps {
  treasureCatalog?: {
    totalTreasures: number;
    estimatedTotalValue: number;
    treasures: Treasure[];
  };
}

export default function TreasureCatalogDetail({ treasureCatalog }: TreasureCatalogDetailProps) {
  const navigate = useNavigate();

  if (!treasureCatalog || treasureCatalog.treasures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Hazine verisi bulunamadı</p>
      </div>
    );
  }

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
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg border border-yellow-300">
          <p className="text-sm text-gray-600">Toplam Hazine</p>
          <p className="text-2xl font-bold text-yellow-700">{treasureCatalog.totalTreasures}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-4 rounded-lg border border-amber-300">
          <p className="text-sm text-gray-600">Tahmini Değer</p>
          <p className="text-xl font-bold text-amber-700">
            ${(treasureCatalog.estimatedTotalValue / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Tespit Edilen Hazineler</h4>
        {treasureCatalog.treasures.map((treasure) => (
          <div key={treasure.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h5 className="font-bold text-sm text-gray-900">{treasure.name}</h5>
                <p className="text-xs text-gray-600">{treasure.material} • {treasure.type}</p>
              </div>
              <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded font-semibold">
                {treasure.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-gray-600">Derinlik</p>
                <p className="font-bold text-gray-900">{treasure.depth.toFixed(1)}m</p>
              </div>
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-gray-600">Ağırlık</p>
                <p className="font-bold text-gray-900">{treasure.weight.toFixed(1)}kg</p>
              </div>
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-gray-600">Değeri</p>
                <p className="font-bold text-yellow-700">${(treasure.estimatedValue / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-white p-2 rounded border border-yellow-100">
                <p className="text-gray-600">Güven</p>
                <p className="font-bold text-gray-900">{treasure.confidence.toFixed(0)}%</p>
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-yellow-100">
              <p className="text-xs text-gray-600 mb-1">Konum</p>
              <p className="text-xs font-mono text-gray-800">
                {treasure.coordinates.latitude.toFixed(6)}, {treasure.coordinates.longitude.toFixed(6)}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${treasure.discoveryProbability}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700">
                {treasure.discoveryProbability.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
