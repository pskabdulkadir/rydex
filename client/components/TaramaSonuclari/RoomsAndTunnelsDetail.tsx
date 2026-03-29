import React, { useState } from 'react';
import { DoorOpen, ArrowRight, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: number;
  name: string;
  floor: number;
  area: number;
  height: number;
  contents: string;
  accessDifficulty: number;
  treasureValue: number;
}

interface Tunnel {
  id: number;
  startRoom: number;
  endRoom: number;
  length: number;
  width: number;
  height: number;
  condition: number;
  hasTraps: boolean;
  hasWater: boolean;
}

interface RoomsAndTunnelsDetailProps {
  roomsAndTunnels?: {
    totalRooms: number;
    totalTunnels: number;
    rooms: Room[];
    tunnels: Tunnel[];
  };
}

export default function RoomsAndTunnelsDetail({
  roomsAndTunnels,
}: RoomsAndTunnelsDetailProps) {
  const navigate = useNavigate();
  const [expandedRoom, setExpandedRoom] = useState<number | null>(null);
  const [expandedTunnel, setExpandedTunnel] = useState<number | null>(null);

  if (!roomsAndTunnels || (roomsAndTunnels.rooms.length === 0 && roomsAndTunnels.tunnels.length === 0)) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Oda ve tünel verisi bulunamadı</p>
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
        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-4 rounded-lg border border-indigo-300">
          <p className="text-sm text-gray-600">Odalar</p>
          <p className="text-3xl font-bold text-indigo-700">{roomsAndTunnels.totalRooms}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-100 to-blue-100 p-4 rounded-lg border border-cyan-300">
          <p className="text-sm text-gray-600">Tüneller</p>
          <p className="text-3xl font-bold text-cyan-700">{roomsAndTunnels.totalTunnels}</p>
        </div>
      </div>

      {/* Odalar */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Odalar ({roomsAndTunnels.rooms.length})</h4>
        {roomsAndTunnels.rooms.map((room) => (
          <div key={room.id} className="bg-indigo-50 border border-indigo-200 rounded-lg">
            <button
              onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
              className="w-full p-3 text-left hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <DoorOpen className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-bold text-sm text-gray-900">{room.name}</h5>
                  </div>
                  <p className="text-xs text-gray-600">{room.contents}</p>
                </div>
                <span className="text-xs bg-indigo-200 text-indigo-900 px-2 py-1 rounded font-semibold">
                  {room.area.toFixed(0)}m²
                </span>
              </div>
            </button>

            {expandedRoom === room.id && (
              <div className="border-t border-indigo-200 p-3 bg-white space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                    <p className="text-gray-600">Kat</p>
                    <p className="font-bold">{room.floor}</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                    <p className="text-gray-600">Yükseklik</p>
                    <p className="font-bold">{room.height.toFixed(1)}m</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                    <p className="text-gray-600">Erişim Zorluk</p>
                    <p className="font-bold">{room.accessDifficulty.toFixed(0)}%</p>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                    <p className="text-gray-600">Hazine Değeri</p>
                    <p className="font-bold text-indigo-700">${(room.treasureValue / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tüneller */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Tüneller ({roomsAndTunnels.tunnels.length})</h4>
        {roomsAndTunnels.tunnels.map((tunnel) => (
          <div key={tunnel.id} className="bg-cyan-50 border border-cyan-200 rounded-lg">
            <button
              onClick={() => setExpandedTunnel(expandedTunnel === tunnel.id ? null : tunnel.id)}
              className="w-full p-3 text-left hover:bg-cyan-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="w-4 h-4 text-cyan-600 rotate-90" />
                    <h5 className="font-bold text-sm text-gray-900">
                      Oda {tunnel.startRoom} → Oda {tunnel.endRoom}
                    </h5>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600">
                    {tunnel.hasTraps && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">⚠️ Tuzak</span>}
                    {tunnel.hasWater && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">💧 Su</span>}
                  </div>
                </div>
                <span className="text-xs bg-cyan-200 text-cyan-900 px-2 py-1 rounded font-semibold">
                  {tunnel.length.toFixed(0)}m
                </span>
              </div>
            </button>

            {expandedTunnel === tunnel.id && (
              <div className="border-t border-cyan-200 p-3 bg-white space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-cyan-50 p-2 rounded border border-cyan-100">
                    <p className="text-gray-600">Genişlik</p>
                    <p className="font-bold">{tunnel.width.toFixed(1)}m</p>
                  </div>
                  <div className="bg-cyan-50 p-2 rounded border border-cyan-100">
                    <p className="text-gray-600">Yükseklik</p>
                    <p className="font-bold">{tunnel.height.toFixed(1)}m</p>
                  </div>
                  <div className="bg-cyan-50 p-2 rounded border border-cyan-100">
                    <p className="text-gray-600">Durum</p>
                    <p className="font-bold">{tunnel.condition.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
