import React, { useState } from 'react';
import { Sparkles, Heart, AlertCircle, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Anomaly {
  id: number;
  type: string;
  intensity: number;
  location: string;
  effect: string;
}

interface SpiritualEnergyDetailProps {
  spiritualEnergyDetection?: {
    energyLevel: number;
    chakraPoints: number;
    energyType: string;
    spiritualSignature: number;
    anomalies: Anomaly[];
    recommendations: string[];
    compatibility: number;
  };
}

export default function SpiritualEnergyDetail({
  spiritualEnergyDetection,
}: SpiritualEnergyDetailProps) {
  const navigate = useNavigate();
  const [expandedAnomaly, setExpandedAnomaly] = useState<number | null>(null);

  if (!spiritualEnergyDetection || spiritualEnergyDetection.anomalies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Manevi enerji verisi bulunamadı</p>
      </div>
    );
  }

  const getEnergyTypeColor = (type: string) => {
    switch (type) {
      case 'Pozitif':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Negatif':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Nötr':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case 'Koruma Enerjisi':
        return 'bg-blue-100 border-blue-300';
      case 'Lanet':
        return 'bg-red-100 border-red-300';
      case 'Kutsal Alan':
        return 'bg-yellow-100 border-yellow-300';
      case 'Negatif Alan':
        return 'bg-red-100 border-red-300';
      case 'Güç Noktası':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
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

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-3 rounded-lg border border-violet-300">
          <p className="text-xs text-gray-600">Enerji Seviyesi</p>
          <p className="text-2xl font-bold text-violet-700">{spiritualEnergyDetection.energyLevel.toFixed(0)}%</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-100 to-violet-100 p-3 rounded-lg border border-indigo-300">
          <p className="text-xs text-gray-600">Çakra Noktaları</p>
          <p className="text-2xl font-bold text-indigo-700">{spiritualEnergyDetection.chakraPoints}</p>
        </div>
        <div className={`p-3 rounded-lg border ${getEnergyTypeColor(spiritualEnergyDetection.energyType)}`}>
          <p className="text-xs text-gray-600">Enerji Türü</p>
          <p className="text-sm font-bold">{spiritualEnergyDetection.energyType}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-4 rounded-lg border border-pink-300">
          <p className="text-sm text-gray-600">Manevi İmza</p>
          <p className="text-2xl font-bold text-pink-700">{spiritualEnergyDetection.spiritualSignature.toFixed(0)}%</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-100 to-blue-100 p-4 rounded-lg border border-cyan-300">
          <p className="text-sm text-gray-600">Uyumluluk</p>
          <p className="text-2xl font-bold text-cyan-700">{spiritualEnergyDetection.compatibility.toFixed(0)}%</p>
        </div>
      </div>

      {/* Anomaliler */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Manevi Anomaliler</h4>
        <div className="space-y-2">
          {spiritualEnergyDetection.anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`border rounded-lg ${getAnomalyColor(anomaly.type)}`}
            >
              <button
                onClick={() => setExpandedAnomaly(expandedAnomaly === anomaly.id ? null : anomaly.id)}
                className="w-full p-3 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <h5 className="font-bold text-sm text-gray-900">{anomaly.type}</h5>
                    </div>
                    <p className="text-xs text-gray-600">{anomaly.location}</p>
                  </div>
                  <span className="text-xs bg-white/50 px-2 py-1 rounded font-semibold">
                    {anomaly.intensity.toFixed(0)}%
                  </span>
                </div>
              </button>

              {expandedAnomaly === anomaly.id && (
                <div className="border-t p-3 bg-white/50">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Etki</p>
                      <p className="text-xs bg-white px-2 py-1 rounded font-semibold text-gray-900">
                        {anomaly.effect}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Yoğunluk</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${anomaly.intensity}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {anomaly.intensity.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Öneriler */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 text-sm">Manevi Rehberlik Önerileri</h4>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-lg p-3 space-y-2">
          {spiritualEnergyDetection.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Uyarı */}
      {spiritualEnergyDetection.energyType === 'Negatif' && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-900">Uyarı</p>
            <p className="text-xs text-red-700 mt-1">
              Bu alanda negatif enerji tespit edilmiştir. Girmeden önce profesyonel rehberlik alınız.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
