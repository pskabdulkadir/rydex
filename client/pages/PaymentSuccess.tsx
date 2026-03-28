import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import { launchAppAfterPayment } from '@/lib/web-to-app-bridge';
import { PACKAGE_TO_LEVEL } from '@/lib/types/access-control';
import { calculateExpiryTimestamp } from '@shared/packages';
import { getActiveSubscription } from '@/lib/payment-verification';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [subscription, setSubscription] = useState<any>(null);

  const orderId = searchParams.get('order_id');
  const packageId = searchParams.get('packageId');

  useEffect(() => {
    // Ödeme durumunu kontrol et
    const checkPaymentStatus = async () => {
      try {
        // Önce location state'ten subscription'ı kontrol et (Checkout'tan gelen)
        const state = location.state as { subscription?: any } | null;
        if (state?.subscription) {
          console.log('✅ Subscription state\'ten alındı:', state.subscription);
          setSubscription(state.subscription);
          setLoading(false);
          return;
        }

        // Sonra localStorage'dan kontrol et
        const activeSub = getActiveSubscription();
        if (activeSub) {
          console.log('✅ Subscription localStorage\'dan alındı:', activeSub);
          setSubscription(activeSub);
          setLoading(false);
          return;
        }

        // Son olarak API'den kontrol et (orderId varsa)
        if (!orderId && !packageId) {
          setLoading(false);
          return;
        }

        if (orderId) {
          const response = await fetch(`/api/payment/status/${orderId}`);
          const data = await response.json();

          if (data.success && data.status === 'completed') {
            // Ödeme başarılı - Subscription oluşturuldu
            console.log('✅ Ödeme başarılı:', data);

            // Session token'ı localStorage'a kaydet (Web-to-App bridge için)
            if (data.sessionToken) {
              localStorage.setItem('sessionToken', data.sessionToken);
            }

            setSubscription(data.subscription);
          }
        }
      } catch (error) {
        console.error('Ödeme durumu kontrol hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, packageId, location.state]);

  // Geri sayım - Member Panel'e yönlendir
  useEffect(() => {
    if (!loading) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Ödeme başarılı → Member Panel'e yönlendir
            navigate('/member-panel', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        {loading ? (
          // Loading State
          <div className="text-center">
            <div className="inline-block p-4 animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-2">Ödeme Doğrulanıyor...</h2>
            <p className="text-slate-400">Lütfen bekleyin. Paketiniz aktivitine ediliyor.</p>
          </div>
        ) : (
          // Success State
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 shadow-2xl text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg animate-pulse"></div>
                <div className="relative bg-green-500/10 border border-green-500/50 rounded-full p-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              Ödeme Başarılı!
            </h1>

            {/* Message */}
            <p className="text-slate-400 mb-6">
              Paketiniz başarıyla satın alındı. Erişim şu anda etkin.
            </p>

            {/* Benefits */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 mb-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">Sınırsız erişim aktif</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">Tüm özellikler açılmış</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">24/7 destek mevccut</span>
              </div>
            </div>

            {/* Order ID */}
            {orderId && (
              <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Sipariş Numarası:</p>
                <p className="text-sm font-mono text-slate-300 break-all">{orderId}</p>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => {
                // TODO: Gerçek userId, packageId ve expiryTimestamp'ı al
                const packageId = 'starter';
                const userId = 'demo-user';
                const accessLevel = PACKAGE_TO_LEVEL[packageId] || 1;
                const expiryTimestamp = calculateExpiryTimestamp(packageId);

                // Uygulamayı başlat
                launchAppAfterPayment(userId, packageId, accessLevel, expiryTimestamp);

                // Fallback: ana sayfaya geri dön
                setTimeout(() => {
                  navigate('/', { replace: true });
                }, 2000);
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/30 mb-4"
            >
              Uygulamayı Aç
            </button>

            {/* Auto redirect message */}
            <p className="text-xs text-slate-500">
              {countdown > 0 ? (
                <>
                  Otomatik olarak yönlendiriliyorsunuz...
                  <span className="text-slate-400 font-semibold ml-1">{countdown}s</span>
                </>
              ) : (
                'Yönlendiriliyorsunuz...'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
