import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Zap, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Trap {
  id: number;
  type: string;
  location: string;
  danger: number;
  triggering: string;
  active: boolean;
  deactivationMethod: string;
  casualties: number;
}

interface TrapsAndSecurityDetailProps {
  trapsAndSecurity?: {
    trapCount: number;
    securityLevel: number;
    traps: Trap[];
    securityMeasures: string[];
    recommendations: string[];
  };
}

export default function TrapsAndSecurityDetail({
  trapsAndSecurity,
}: TrapsAndSecurityDetailProps) {
  const navigate = useNavigate();
  const [expandedTrap, setExpandedTrap] = useState<number | null>(null);

  if (!trapsAndSecurity || trapsAndSecurity.traps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Tuzak ve güvenlik verisi bulunamadı</p>
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
        <div className="bg-gradient-to-br from-red-100 to-orange-100 p-4 rounded-lg border border-red-300">
          <p className="text-sm text-gray-600">Tespit Tuzak</p>
          <p className="text-3xl font-bold text-red-700">{trapsAndSecurity.trapCount}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-lg border border-yellow-300">
          <p className="text-sm text-gray-600">Güvenlik Seviyesi</p>
          <p className="text-2xl font-bold text-orange-700">{trapsAndSecurity.securityLevel.toFixed(0)}%</p>
        </div>
      </div>

      {/* Güvenlik Önlemleri */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 text-sm">Güvenlik Önlemleri</h4>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 space-y-2">
          {trapsAndSecurity.securityMeasures.map((measure, index) => (
            <div key={index} className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">{measure}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Öneriler */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 text-sm">Alınması Gereken Güvenlik Önerileri</h4>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-3 space-y-2">
          {trapsAndSecurity.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tuzaklar */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Tespit Edilen Tuzaklar ({trapsAndSecurity.traps.length})</h4>
        <div className="space-y-2">
          {trapsAndSecurity.traps.map((trap) => (
            <div key={trap.id} className="bg-red-50 border border-red-200 rounded-lg">
              <button
                onClick={() => setExpandedTrap(expandedTrap === trap.id ? null : trap.id)}
                className="w-full p-3 text-left hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h5 className="font-bold text-sm text-gray-900">{trap.type}</h5>
                    </div>
                    <p className="text-xs text-gray-600">{trap.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    trap.active
                      ? 'bg-red-200 text-red-900'
                      : 'bg-green-200 text-green-900'
                  }`}>
                    {trap.active ? 'Aktif' : 'İnaktif'}
                  </span>
                </div>
              </button>

              {expandedTrap === trap.id && (
                <div className="border-t border-red-200 p-3 bg-white space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 p-2 rounded border border-red-100">
                      <p className="text-gray-600">Tehlike Seviyesi</p>
                      <p className="font-bold text-red-700">{trap.danger.toFixed(0)}%</p>
                      <div className="flex-1 bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-red-600 h-1 rounded-full"
                          style={{ width: `${trap.danger}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-100">
                      <p className="text-gray-600">Geçmiş Kayıplar</p>
                      <p className="font-bold text-red-700">{trap.casualties}</p>
                    </div>
                  </div>

                  <div className="border-t border-red-200 pt-2">
                    <p className="text-xs text-gray-600 mb-1">Tetikleme Yöntemi</p>
                    <p className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded inline-block font-semibold">
                      {trap.triggering}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Deaktivation Yöntemi</p>
                    <p className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block font-semibold">
                      {trap.deactivationMethod}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
