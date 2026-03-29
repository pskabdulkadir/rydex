import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface DemoStatus {
  isActive: boolean;
  timeRemaining: number; // milliseconds
  minutesRemaining: number;
  secondsRemaining: number;
  percentageRemaining: number;
}

/**
 * Demo modu kontrol hook'u
 * - 3 dakikalık deneme süresi kontrol eder
 * - Süre bitince /pricing sayfasına yönlendirir
 * - Kalan süreyi takip eder
 */
export function useDemo() {
  const navigate = useNavigate();
  const [demoStatus, setDemoStatus] = useState<DemoStatus>({
    isActive: false,
    timeRemaining: 0,
    minutesRemaining: 0,
    secondsRemaining: 0,
    percentageRemaining: 0
  });

  useEffect(() => {
    // Demo modunu kontrol et
    const demoMode = localStorage.getItem('demoMode');
    const demoStartTime = localStorage.getItem('demoStartTime');
    const demoExpireTime = localStorage.getItem('demoExpireTime');

    if (!demoMode || !demoStartTime || !demoExpireTime) {
      setDemoStatus(prev => ({ ...prev, isActive: false }));
      return;
    }

    // ==========================================
    // ⏱️  DEMO TIMER - KENDİ BAĞIMSIZ SÜRÜ
    // ==========================================
    const interval = setInterval(() => {
      const now = Date.now();
      const expireTime = parseInt(demoExpireTime);
      const timeRemaining = Math.max(0, expireTime - now);

      if (timeRemaining <= 0) {
        // Demo süresi bitmiş - tam kontrol demo mode'un
        console.error('❌ DEMO SÜRESI DOLDU!');

        // localStorage'ı temizle - SADECE DEMO VERİLERİNİ
        localStorage.removeItem('demoMode');
        localStorage.removeItem('demoStartTime');
        localStorage.removeItem('demoExpireTime');

        // subscription'a dokunma - eğer varsa devam etsin

        clearInterval(interval);

        toast.error('⏰ Demo süresi dolmuştur. Lütfen paket satın alın.', {
          description: 'Paket satın alma sayfasına yönlendiriliyorsunuz...',
          duration: 3000
        });

        // HER DURUMDA pricing'e yönlendir (subscription varsa da varsa da)
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 1500);

        return;
      }

      // Kalan süreyi hesapla
      const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));
      const secondsRemaining = Math.floor((timeRemaining % (60 * 1000)) / 1000);
      const startTime = parseInt(demoStartTime);
      const totalDuration = expireTime - startTime;
      const percentageRemaining = (timeRemaining / totalDuration) * 100;

      setDemoStatus({
        isActive: true,
        timeRemaining,
        minutesRemaining,
        secondsRemaining,
        percentageRemaining
      });

      // Uyarı mesajları
      if (minutesRemaining === 2 && secondsRemaining === 0) {
        console.warn('⏰ 2 DAKIKA KALDI!');
        toast.warning('⏰ Demo süresi: 2 dakika kalmıştır');
      }

      if (minutesRemaining === 1 && secondsRemaining === 0) {
        console.warn('⏰ 1 DAKIKA KALDI!');
        toast.warning('⏰ Demo süresi: 1 dakika kalmıştır');
      }

      if (minutesRemaining === 0 && secondsRemaining === 30) {
        console.warn('⏰ 30 SANİYE KALDI!');
        toast.error('🔴 Demo süresi: 30 saniye kalmıştır!');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  /**
   * Demo modunu başlat (3 dakika)
   */
  const startDemo = (durationMinutes = 3) => {
    const startTime = Date.now();
    const expireTime = startTime + (durationMinutes * 60 * 1000);

    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoStartTime', startTime.toString());
    localStorage.setItem('demoExpireTime', expireTime.toString());

    console.log('✅ DEMO MODU BAŞLATILDI');
    console.log(`   Başlangıç: ${new Date(startTime).toLocaleTimeString('tr-TR')}`);
    console.log(`   Bitiş: ${new Date(expireTime).toLocaleTimeString('tr-TR')}`);
    console.log(`   Süre: ${durationMinutes} dakika`);

    setDemoStatus({
      isActive: true,
      timeRemaining: durationMinutes * 60 * 1000,
      minutesRemaining: durationMinutes,
      secondsRemaining: 0,
      percentageRemaining: 100
    });
  };

  /**
   * Demo modunu durdur
   */
  const stopDemo = () => {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoStartTime');
    localStorage.removeItem('demoExpireTime');

    setDemoStatus({
      isActive: false,
      timeRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      percentageRemaining: 0
    });

    console.log('⏹️  Demo modu durduruldu');
  };

  return {
    demoStatus,
    startDemo,
    stopDemo,
    isDemo: demoStatus.isActive
  };
}
