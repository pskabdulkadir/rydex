import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { getActiveSubscription, hasAppAccess } from '@/lib/payment-verification';
import { toast } from 'sonner';

interface UseAppProps {
  userId?: string;
  showExtendButton?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * UseApp Component - Uygulamayı Kullan
 * Tüm üye panellerinde kullanılması için tasarlandı
 * Subscription durumu gösterir ve uygulamaya anında erişim sağlar
 */
export function UseApp({
  userId,
  showExtendButton = true,
  compact = false,
  className = '',
}: UseAppProps) {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Subscription'ı yükle
  useEffect(() => {
    const sub = getActiveSubscription();
    setSubscription(sub);
    
    if (userId && sub) {
      setHasAccess(hasAppAccess(userId));
    } else if (sub) {
      // userId yoksa localStorage'dan al
      const storedUserId = localStorage.getItem('userId');
      setHasAccess(hasAppAccess(storedUserId || ''));
    }

    setLoading(false);
  }, [userId]);

  // Kalan zamanı göster ve güncelleç
  useEffect(() => {
    if (!subscription) return;

    const updateTimeLeft = () => {
      const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
      const hoursRemaining = Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60)));

      if (daysRemaining > 0) {
        setTimeLeft(`${daysRemaining} gün kaldı`);
      } else {
        const minutesRemaining = Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60)));
        setTimeLeft(`${minutesRemaining} dakika kaldı`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Her dakika güncelle

    return () => clearInterval(interval);
  }, [subscription]);

  const handleLaunchApp = () => {
    if (!hasAccess) {
      toast.error('Uygulamaya erişim hakkınız bulunmamaktadır.');
      return;
    }

    // Sistem başlatıldı olarak işaretle
    localStorage.setItem('systemInitialized', 'true');
    
    // Tarama sayfasına git (uygulamanın ana sayfası)
    navigate('/');
    
    toast.success('🚀 Uygulama başlatılıyor...');
  };

  const handleExtendSubscription = () => {
    navigate('/pricing');
    toast.info('Paket uzatma sayfasına yönlendiriliyorsunuz...');
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse h-40 bg-slate-700 rounded-lg" />
      </div>
    );
  }

  // Aktif subscription yoksa
  if (!subscription || !hasAccess) {
    return (
      <Card className={`bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-full flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Aktif Paket Yok</h3>
            <p className="text-slate-300 text-sm mb-4">
              Uygulamayı kullanmak için bir paket satın almanız gerekmektedir.
            </p>
            <Button
              onClick={handleExtendSubscription}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              📦 Paket Satın Al
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Compact mod (sidebar ve özet gösterimler için)
  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold text-sm">Aktif Paket</span>
          </div>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            ✓ Aktif
          </span>
        </div>
        <div className="space-y-2 mb-3">
          <div className="text-sm">
            <p className="text-slate-400">Plan</p>
            <p className="text-white font-semibold">{subscription.plan.toUpperCase()}</p>
          </div>
          <div className="text-sm">
            <p className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Kalan Süre
            </p>
            <p className="text-white font-semibold">{timeLeft}</p>
          </div>
        </div>
        <Button
          onClick={handleLaunchApp}
          size="sm"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm"
        >
          <Zap className="w-4 h-4 mr-2" />
          Uygulamayı Aç
        </Button>
      </Card>
    );
  }

  // Tam mod (üye panelinde gösterim)
  return (
    <Card className={`bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">🎉 Uygulamayı Kullan</h3>
          <p className="text-slate-300">
            Satın aldığınız paketi hemen kullanmaya başlayabilirsiniz.
          </p>
        </div>
        <div className="p-3 bg-green-500/20 rounded-full flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-green-900/30 rounded-lg p-4 mb-6 border border-green-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan */}
          <div>
            <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Aktif Plan</p>
            <p className="text-white font-bold text-lg">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
            </p>
          </div>

          {/* Price */}
          <div>
            <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Ödenen Tutar</p>
            <p className="text-yellow-400 font-bold text-lg">
              {subscription.amount.toLocaleString('tr-TR')} ₺
            </p>
          </div>

          {/* Time Remaining */}
          <div>
            <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Kalan Süre</p>
            <p className="text-green-400 font-bold text-lg flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {subscription.daysRemaining} gün
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Kullanım Süresi</span>
            <span className="text-xs text-slate-300 font-semibold">
              {Math.round((subscription.daysRemaining / 30) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (subscription.daysRemaining / 30) * 100)}%`,
              }}
            />
          </div>
          {subscription.endDate && (
            <p className="text-xs text-slate-400 mt-2">
              Bitiş: {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-white font-semibold text-sm">Sınırsız Tarama</p>
            <p className="text-slate-400 text-xs">Istediğiniz kadar tarama yapın</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-white font-semibold text-sm">Premium Analitikler</p>
            <p className="text-slate-400 text-xs">Detaylı raporlar alın</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-white font-semibold text-sm">Öncelikli Destek</p>
            <p className="text-slate-400 text-xs">7/24 destek hattı</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <p className="text-white font-semibold text-sm">İleri Raporlar</p>
            <p className="text-slate-400 text-xs">PDF ve excel raporları</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleLaunchApp}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 text-lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          🚀 Uygulamayı Şimdi Aç
          <ArrowRight className="w-5 h-5 ml-auto" />
        </Button>

        {showExtendButton && subscription.daysRemaining < 7 && (
          <Button
            onClick={handleExtendSubscription}
            variant="outline"
            className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            ⏱️ Süreyi Uzat
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/30 rounded-lg text-sm text-slate-300">
        <p className="font-semibold text-slate-200 mb-2">💡 İpucu:</p>
        <p>
          Paketinizin bitiminden <span className="text-orange-400 font-semibold">7 gün önce</span> uyarı alacaksınız.
          Kesintisiz hizmet için zamanında yenileme yapınız.
        </p>
      </div>
    </Card>
  );
}

export default UseApp;
