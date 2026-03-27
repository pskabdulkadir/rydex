import React, { useEffect, useState } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import { useNetwork } from '@/lib/network-context';

export default function OfflineScreen() {
  const { isOnline, isCheckingConnection } = useNetwork();

  // İnternet varsa ekranı gösterme
  if (isOnline) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center pointer-events-auto" style={{ zIndex: 999999 }}>
      <div className="text-center max-w-md px-6">
        {/* İcon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <WifiOff className="w-20 h-20 text-red-500" />
            <div className="absolute inset-0 animate-pulse">
              <WifiOff className="w-20 h-20 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-bold text-white mb-4">
          İnternet Bağlantısı Gerekli
        </h1>

        {/* Açıklama */}
        <p className="text-slate-300 mb-8 text-lg">
          Bu uygulamayı kullanmak için aktif bir internet bağlantısı gereklidir.
        </p>

        {/* Yükleme Göstergesi */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-blue-400 font-medium">Bağlantı Bekleniyor...</span>
        </div>

        {/* Durum Bilgisi */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-300">
            Wi-Fi veya mobil veri ağına bağlanın ve sayfayı yenileyin.
          </p>
        </div>

        {/* Ping Kontrolü */}
        {isCheckingConnection && (
          <div className="mt-8 text-xs text-slate-400">
            Bağlantı kontrol ediliyor...
          </div>
        )}
      </div>
    </div>
  );
}
