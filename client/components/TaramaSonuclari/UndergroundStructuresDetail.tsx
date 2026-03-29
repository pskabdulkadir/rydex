import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Structure {
  id: number;
  type: string;
  depth: number;
  area: number;
  age: number;
  condition: number;
  materialComposition: string;
  estimatedRooms: number;
  coordinates: { latitude: number; longitude: number };
}

interface UndergroundStructuresDetailProps {
  undergroundStructures?: {
    structureCount: number;
    structures: Structure[];
  };
}

export default function UndergroundStructuresDetail({
  undergroundStructures,
}: UndergroundStructuresDetailProps) {
  const navigate = useNavigate();

  if (!undergroundStructures || undergroundStructures.structures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Yapı verisi bulunamadı</p>
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

      <div className="bg-gradient-to-br from-slate-100 to-gray-100 p-4 rounded-lg border border-slate-300">
        <p className="text-sm text-gray-600">Tespit Edilen Yapılar</p>
        <p className="text-3xl font-bold text-slate-700">{undergroundStructures.structureCount}</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Yapı Detayları</h4>
        {undergroundStructures.structures.map((structure) => (
          <div key={structure.id} className="bg-slate-50 border border-slate-300 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <h5 className="font-bold text-sm text-gray-900">{structure.type}</h5>
                </div>
                <p className="text-xs text-gray-600">Yapı Arkeolojik Yapı</p>
              </div>
              <span className="text-xs bg-slate-200 text-slate-900 px-2 py-1 rounded font-semibold">
                {structure.age.toLocaleString()}+ yıl
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-white p-2 rounded border border-slate-200">
                <p className="text-gray-600">Derinlik</p>
                <p className="font-bold text-gray-900">{structure.depth.toFixed(0)}m</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <p className="text-gray-600">Alan</p>
                <p className="font-bold text-gray-900">{structure.area.toFixed(0)}m²</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <p className="text-gray-600">Malzeme</p>
                <p className="font-bold text-gray-900">{structure.materialComposition}</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <p className="text-gray-600">Oda Sayısı</p>
                <p className="font-bold text-gray-900">{structure.estimatedRooms}+</p>
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200 mb-2">
              <p className="text-xs text-gray-600 mb-1">Yapısal Durum</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      structure.condition > 70
                        ? 'bg-green-500'
                        : structure.condition > 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${structure.condition}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700">{structure.condition.toFixed(0)}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-100 to-gray-100 p-2 rounded border border-slate-200">
              <p className="text-xs text-gray-600 mb-1">Koordinatlar</p>
              <p className="text-xs font-mono text-gray-800">
                {structure.coordinates.latitude.toFixed(6)}, {structure.coordinates.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
