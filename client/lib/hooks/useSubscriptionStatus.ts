import { useEffect, useState, useCallback } from 'react';
import { getActiveSubscription, hasAppAccess, getPendingPaymentCount } from '@/lib/payment-verification';
import { toast } from 'sonner';

interface SubscriptionStatus {
  isActive: boolean;
  daysRemaining: number;
  plan: string;
  amount: number;
  endDate: number;
  isExpiringSoon: boolean;
  hasAccess: boolean;
  pendingPayments: number;
}

/**
 * Subscription durumunu kontrol ve otomatik açılış sistemini yönet
 */
export function useSubscriptionStatus(userId?: string) {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    daysRemaining: 0,
    plan: 'free',
    amount: 0,
    endDate: 0,
    isExpiringSoon: false,
    hasAccess: false,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  const checkSubscriptionStatus = useCallback(() => {
    try {
      const subscription = getActiveSubscription();
      const userIdToCheck = userId || localStorage.getItem('userId') || '';
      const hasAccess = hasAppAccess(userIdToCheck);
      const pendingCount = getPendingPaymentCount();

      if (subscription) {
        const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
        const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

        setStatus({
          isActive: true,
          daysRemaining,
          plan: subscription.plan || 'free',
          amount: subscription.amount || 0,
          endDate: subscription.endDate,
          isExpiringSoon,
          hasAccess,
          pendingPayments: pendingCount
        });

        // Süresi doluşmak üzere mi kontrol et
        if (isExpiringSoon && daysRemaining === 7) {
          console.warn('⏰ Subscription süresi 7 güne kaldı!');
          toast.warning(`⏰ Aboneliğinizin süresi ${daysRemaining} gün kalmıştır!`, {
            description: 'Kesintisiz hizmet için lütfen yenileyin',
            duration: 5000
          });
        }

        // Haftaya bir gün kaldı
        if (daysRemaining === 1) {
          console.error('❌ Subscription süresi 1 gün kalmıştır!');
          toast.error('❌ Aboneliğinizin süresi YARINKI BİTECEK!', {
            description: 'Acil olarak yenileme yapınız',
            duration: 5000
          });
        }
      } else {
        setStatus({
          isActive: false,
          daysRemaining: 0,
          plan: 'free',
          amount: 0,
          endDate: 0,
          isExpiringSoon: false,
          hasAccess: false,
          pendingPayments: pendingCount
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Subscription kontrol hatası:', error);
      setLoading(false);
    }
  }, [userId]);

  // Componentler yüklendiğinde kontrol et
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Her 1 dakikada bir kontrol et
  useEffect(() => {
    const interval = setInterval(checkSubscriptionStatus, 60000);
    return () => clearInterval(interval);
  }, [checkSubscriptionStatus]);

  // localStorage değişimlerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      checkSubscriptionStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkSubscriptionStatus]);

  return {
    ...status,
    loading,
    refresh: checkSubscriptionStatus
  };
}

/**
 * Subscription otomatik açılış sistemini başlat
 */
export function useAutoOpenOnSubscription(onSubscriptionActive?: () => void) {
  const { isActive, hasAccess } = useSubscriptionStatus();

  useEffect(() => {
    if (isActive && hasAccess && onSubscriptionActive) {
      console.log('✅ Subscription aktif edildi! Uygulama otomatik açılıyor...');
      
      // 2 saniye sonra callback çağır
      const timeout = setTimeout(() => {
        onSubscriptionActive();
        toast.success('🚀 Uygulama açılıyor...');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isActive, hasAccess, onSubscriptionActive]);
}

/**
 * Subscription yenileme uyarı sistemini başlat
 */
export function useSubscriptionExpiryWarning() {
  const { isExpiringSoon, daysRemaining } = useSubscriptionStatus();

  useEffect(() => {
    if (isExpiringSoon && daysRemaining > 0) {
      const messages = [
        `Aboneliğinizin ${daysRemaining} günü kaldı`,
        'Kesintisiz hizmet için lütfen yenileyin',
        'Yenileme yapmazsanız erişim kaybı yaşayabilirsiniz'
      ];

      messages.forEach((msg, idx) => {
        setTimeout(() => {
          toast.warning(msg, {
            duration: 4000
          });
        }, idx * 5000);
      });
    }
  }, [isExpiringSoon, daysRemaining]);
}
