import React, { useState } from 'react';
import { Lock, Unlock, MapPin, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Door {
  id: number;
  location: string;
  type: string;
  width: number;
  height: number;
  strength: number;
  isLocked: boolean;
  lockType: string;
  openingMethod: string;
  material: string;
}

interface Entrance {
  id: number;
  name: string;
  coordinates: { latitude: number; longitude: number };
  depth: number;
  condition: number;
  accessibility: number;
}

interface DoorsAndEntrancesDetailProps {
  doorsAndEntrances?: {
    totalDoors: number;
    mainEntrances: number;
    doors: Door[];
    entrances: Entrance[];
  };
}

export default function DoorsAndEntrancesDetail({
  doorsAndEntrances,
}: DoorsAndEntrancesDetailProps) {
  const navigate = useNavigate();
  const [expandedDoor, setExpandedDoor] = useState<number | null>(null);

  if (!doorsAndEntrances || (doorsAndEntrances.doors.length === 0 && doorsAndEntrances.entrances.length === 0)) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Kapı ve giriş verisi bulunamadı</p>
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
        <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-lg border border-orange-300">
          <p className="text-sm text-gray-600">Kapılar</p>
          <p className="text-3xl font-bold text-orange-700">{doorsAndEntrances.totalDoors}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg border border-green-300">
          <p className="text-sm text-gray-600">Ana Giriş</p>
          <p className="text-3xl font-bold text-green-700">{doorsAndEntrances.mainEntrances}</p>
        </div>
      </div>

      {/* Giriş Noktaları */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Ana Giriş Noktaları</h4>
        {doorsAndEntrances.entrances.map((entrance) => (
          <div key={entrance.id} className="bg-green-50 border border-green-300 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <h5 className="font-bold text-sm text-gray-900">{entrance.name}</h5>
                </div>
                <p className="text-xs font-mono text-gray-600">
                  {entrance.coordinates.latitude.toFixed(5)}, {entrance.coordinates.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-green-200">
                <p className="text-gray-600">Derinlik</p>
                <p className="font-bold text-gray-900">{entrance.depth.toFixed(0)}m</p>
              </div>
              <div className="bg-white p-2 rounded border border-green-200">
                <p className="text-gray-600">Durum</p>
                <p className="font-bold text-gray-900">{entrance.condition.toFixed(0)}%</p>
              </div>
              <div className="bg-white p-2 rounded border border-green-200">
                <p className="text-gray-600">Erişim</p>
                <p className="font-bold text-gray-900">{entrance.accessibility.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kapılar */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Kapılar ({doorsAndEntrances.doors.length})</h4>
        {doorsAndEntrances.doors.map((door) => (
          <div key={door.id} className="bg-orange-50 border border-orange-200 rounded-lg">
            <button
              onClick={() => setExpandedDoor(expandedDoor === door.id ? null : door.id)}
              className="w-full p-3 text-left hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {door.isLocked ? (
                      <Lock className="w-4 h-4 text-red-600" />
                    ) : (
                      <Unlock className="w-4 h-4 text-green-600" />
                    )}
                    <h5 className="font-bold text-sm text-gray-900">{door.type}</h5>
                  </div>
                  <p className="text-xs text-gray-600">{door.location}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                  door.isLocked
                    ? 'bg-red-200 text-red-900'
                    : 'bg-green-200 text-green-900'
                }`}>
                  {door.isLocked ? 'Kilitli' : 'Açık'}
                </span>
              </div>
            </button>

            {expandedDoor === door.id && (
              <div className="border-t border-orange-200 p-3 bg-white space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-orange-50 p-2 rounded border border-orange-100">
                    <p className="text-gray-600">Genişlik</p>
                    <p className="font-bold">{door.width.toFixed(1)}m</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-100">
                    <p className="text-gray-600">Yükseklik</p>
                    <p className="font-bold">{door.height.toFixed(1)}m</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-100">
                    <p className="text-gray-600">Malzeme</p>
                    <p className="font-bold">{door.material}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-orange-100">
                    <p className="text-gray-600">Güç</p>
                    <p className="font-bold">{door.strength.toFixed(0)}%</p>
                  </div>
                </div>

                {door.isLocked && (
                  <>
                    <div className="border-t border-orange-200 pt-2">
                      <p className="text-xs text-gray-600 mb-1">Kilit Tipi</p>
                      <p className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block font-semibold">
                        {door.lockType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Açılış Yöntemi</p>
                      <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block font-semibold">
                        {door.openingMethod}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
