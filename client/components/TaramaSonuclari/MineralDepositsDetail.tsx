import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, TrendingUp, Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Mineral {
  id: number;
  name: string;
  type: string;
  purity: number;
  concentration: number;
  depth: number;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  rarity: string;
  extractionDifficulty: number;
}

interface MineralDepositsDetailProps {
  valuableMineral?: {
    mineralCount: number;
    totalMineralValue: number;
    minerals: Mineral[];
  };
}

export default function MineralDepositsDetail({ valuableMineral }: MineralDepositsDetailProps) {
  const navigate = useNavigate();

  if (!valuableMineral || valuableMineral.minerals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Gem className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Maden verisi bulunamadı</p>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Çok Nadir':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Nadir':
        return 'bg-pink-100 text-pink-700 border-pink-300';
      case 'Ender':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
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
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg border border-purple-300">
          <p className="text-sm text-gray-600">Madenler</p>
          <p className="text-2xl font-bold text-purple-700">{valuableMineral.mineralCount}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-4 rounded-lg border border-pink-300">
          <p className="text-sm text-gray-600">Toplam Değer</p>
          <p className="text-xl font-bold text-pink-700">
            ${(valuableMineral.totalMineralValue / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Tespit Edilen Madenler</h4>
        {valuableMineral.minerals.map((mineral) => (
          <div key={mineral.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gem className="w-4 h-4 text-purple-600" />
                  <h5 className="font-bold text-sm text-gray-900">{mineral.name}</h5>
                </div>
                <p className="text-xs text-gray-600">{mineral.type}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-semibold border ${getRarityColor(mineral.rarity)}`}>
                {mineral.rarity}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-gray-600">Saflık</p>
                <p className="font-bold text-gray-900">{mineral.purity.toFixed(0)}%</p>
              </div>
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-gray-600">Miktar</p>
                <p className="font-bold text-gray-900">{mineral.quantity.toFixed(0)}kg</p>
              </div>
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-gray-600">Derinlik</p>
                <p className="font-bold text-gray-900">{mineral.depth.toFixed(0)}m</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-gray-600">Birim Fiyat</p>
                <p className="font-bold text-purple-700">${mineral.pricePerUnit.toFixed(0)}</p>
              </div>
              <div className="bg-white p-2 rounded border border-purple-100">
                <p className="text-gray-600">Toplam Değer</p>
                <p className="font-bold text-pink-700">${(mineral.totalValue / 1000).toFixed(0)}k</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Çıkarma Zorluk: {mineral.extractionDifficulty.toFixed(0)}%</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${mineral.concentration}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700">{mineral.concentration.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
