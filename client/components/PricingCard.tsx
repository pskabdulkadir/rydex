import React from 'react';
import { Package } from '@shared/packages';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  package: Package;
  onSelect: (packageId: string) => void;
  isPopular?: boolean;
}

export function PricingCard({ package: pkg, onSelect, isPopular = false }: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden transition-all duration-300',
        isPopular
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 transform scale-105'
          : 'bg-slate-900/50 border border-slate-700/50 hover:border-amber-500/30'
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-center py-2 text-sm font-bold">
          ⭐ POPULAR
        </div>
      )}

      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none',
          isPopular ? 'from-amber-500 to-orange-500' : 'from-amber-400 to-orange-400'
        )}
      ></div>

      <div className={cn('relative z-10 p-8', isPopular ? 'pt-16' : '')}>
        {/* Package name */}
        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>

        {/* Duration */}
        <p className="text-sm text-slate-400 mb-4">{pkg.duration}</p>

        {/* Price */}
        <div className="mb-6">
          {pkg.requiresEscrow ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-amber-400 italic">
                Lütfen fiyat bilgisi alınız
              </p>
              <p className="text-xs text-slate-400">
                Emanet Süreci protokolü ile müzakere edilir
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  {pkg.price.toLocaleString('tr-TR')}
                </span>
                <span className="text-slate-400 ml-2">₺</span>
              </div>
              {!pkg.isLifetime && (
                <p className="text-xs text-slate-500 mt-1">Paket başına</p>
              )}
            </>
          )}
        </div>

        {/* Technical access */}
        <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Teknik Erişim:</p>
          <p className="text-sm font-semibold text-amber-400">{pkg.technicalAccess}</p>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          {pkg.features.slice(0, 5).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
          
          {/* More features indicator */}
          {pkg.features.length > 5 && (
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-400">+{pkg.features.length - 5} daha fazla özellik</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(pkg.id)}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
            isPopular
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 border border-slate-600/30'
          )}
        >
          {pkg.isLifetime ? '🔐 Master Lisans Al' : `Başla (${pkg.duration})`}
        </button>

        {/* Master license badge */}
        {pkg.requiresEscrow && (
          <p className="text-xs text-center text-amber-400 mt-4 flex items-center justify-center gap-1">
            <span>🔒</span>
            Emanet Süreci Uygulanacak
          </p>
        )}
      </div>
    </div>
  );
}
