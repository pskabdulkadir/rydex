import React from 'react';
import { Zap, AlertTriangle, Clock, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Stage {
  id: number;
  name: string;
  depth: number;
  difficulty: number;
  treasureValue: number;
  hazards: number;
  completion: number;
  estimatedTime: number;
  rewards: string;
}

interface ProgressionMapDetailProps {
  progressionMap?: {
    stages: Stage[];
    routeComplexity: number;
    estimatedExplorationTime: number;
  };
}

export default function ProgressionMapDetail({
  progressionMap,
}: ProgressionMapDetailProps) {
  const navigate = useNavigate();
  if (!progressionMap || progressionMap.stages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>İlerleme haritası verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Detaylı Arama Butonu */}
      <Button
        onClick={() => navigate('/application-features')}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-4 rounded-lg font-bold text-base shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
      >
        <Microscope className="w-5 h-5" />
        Detaylı Arama Başlat
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-rose-100 to-pink-100 p-4 rounded-lg border border-rose-300">
          <p className="text-sm text-gray-600">Rota Karmaşıklığı</p>
          <p className="text-2xl font-bold text-rose-700">{progressionMap.routeComplexity.toFixed(0)}%</p>
        </div>
        <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-4 rounded-lg border border-violet-300">
          <p className="text-sm text-gray-600">Tahmin Süresi</p>
          <p className="text-2xl font-bold text-violet-700">
            {Math.floor(progressionMap.estimatedExplorationTime / 60)}h {progressionMap.estimatedExplorationTime % 60}m
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Aşamalar ({progressionMap.stages.length})</h4>

        <div className="space-y-2">
          {progressionMap.stages.map((stage, index) => (
            <div key={stage.id} className="relative">
              {/* Bağlantı çizgisi */}
              {index < progressionMap.stages.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-6 bg-gradient-to-b from-rose-300 to-transparent" />
              )}

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-rose-200" />
                  </div>

                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-gray-900 mb-1">{stage.name}</h5>

                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className="bg-white p-2 rounded border border-rose-100">
                        <p className="text-gray-600">Derinlik</p>
                        <p className="font-bold text-gray-900">{stage.depth.toFixed(0)}m</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-rose-100">
                        <p className="text-gray-600">Zorluk</p>
                        <p className="font-bold text-gray-900">{stage.difficulty.toFixed(0)}%</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-rose-100">
                        <p className="text-gray-600">Hazine</p>
                        <p className="font-bold text-rose-700">${(stage.treasureValue / 1000).toFixed(0)}k</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-2 bg-white p-2 rounded border border-rose-100">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <div>
                          <p className="text-gray-600">Tehlike</p>
                          <p className="font-bold">{stage.hazards}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded border border-rose-100">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <div>
                          <p className="text-gray-600">Süre</p>
                          <p className="font-bold">{stage.estimatedTime.toFixed(0)}m</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded border border-rose-100 mb-2">
                      <p className="text-xs text-gray-600 mb-1">İlerleme</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-rose-400 to-pink-500 h-2 rounded-full"
                            style={{ width: `${stage.completion}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{stage.completion.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded p-2">
                      <p className="text-xs text-gray-600 mb-1">
                        <Zap className="w-3 h-3 inline mr-1 text-amber-600" />
                        Ödül
                      </p>
                      <p className="text-xs font-semibold text-amber-700">{stage.rewards}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
