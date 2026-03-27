import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function PaymentExpired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Alert box */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 shadow-2xl">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg animate-pulse"></div>
              <div className="relative bg-red-500/10 border border-red-500/50 rounded-full p-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-red-400 mb-2">
            Erişim Süresi Bitmiş
          </h1>

          {/* Subtitle */}
          <p className="text-center text-slate-400 mb-6">
            Paketinizin erişim süresi sona ermiştir. 
            Hizmetleri kullanmaya devam etmek için lütfen yeni bir paket satın alınız.
          </p>

          {/* Status info */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Clock className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-red-400 mb-1">Neler oldu?</p>
              <p>Three.js render döngüsü temizlendi ve veritabanı bağlantıları kesildi.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Primary button - New package */}
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
            >
              <RefreshCw className="w-5 h-5" />
              Yeni Paket Satın Al
            </button>

            {/* Secondary button - Home */}
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 font-semibold py-3 rounded-lg transition-all duration-200 border border-slate-600/30"
            >
              Ana Sayfaya Dön
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-6 pt-6 border-t border-slate-700/30 text-center text-xs text-slate-500">
            <p>Sorularınız mı var? <span className="text-blue-400 cursor-pointer hover:text-blue-300">Destek temas</span></p>
          </div>
        </div>

        {/* Cyberpunk accent */}
        <div className="mt-6 text-center">
          <div className="inline-block px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 font-mono">
              GEOSCAN-X Premium Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
