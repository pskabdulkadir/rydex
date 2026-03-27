import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessControl, isAccessExpired } from '@/lib/types/access-control';

/**
 * Smart Lock Hook
 * 
 * Her 10 saniyede bir access_control'ü kontrol eder
 * Eğer süre bitişse, Three.js temizlenir ve kullanıcı payment-expired sayfasına yönlendirilir
 */
export function useSmartLock(accessControl: AccessControl | null) {
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const watcherIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Three.js temizlik fonksiyonu
  const cleanupThreeJS = useCallback(() => {
    try {
      // Global THREE scene bulunsun
      if ((window as any).__threeScene) {
        // Render döngüsünü durdur
        if ((window as any).__animationFrameId) {
          cancelAnimationFrame((window as any).__animationFrameId);
        }

        // Geometri ve materyalleri temizle
        (window as any).__threeScene.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });

        // Renderer temizle
        if ((window as any).__threeRenderer) {
          (window as any).__threeRenderer.dispose();
        }

        console.log('✓ Three.js tamamen temizlendi');
      }
    } catch (error) {
      console.error('Three.js temizlik hatası:', error);
    }
  }, []);

  // Access Control Watcher
  const checkAccess = useCallback(() => {
    if (!accessControl) {
      console.warn('⚠ Access control bulunamadı');
      return;
    }

    const now = Date.now();
    const remaining = accessControl.expiryTimestamp - now;

    // Zaman kaldı mı kontrol et
    setTimeRemaining(Math.max(0, remaining));

    if (remaining <= 0) {
      // Süresi bitmiş!
      console.log('🔴 ERİŞİM SÜRESI BİTMİŞ!');
      console.log(`Bitmesi gereken zaman: ${new Date(accessControl.expiryTimestamp).toLocaleString('tr-TR')}`);
      
      // Three.js temizle
      cleanupThreeJS();
      
      // Veritabanı bağlantısını kopar
      try {
        // İndexedDB'i temizle (opsiyonel)
        if (window.indexedDB) {
          // Modern browsers - database() metodu varsa
          if ((window.indexedDB as any).databases) {
            (window.indexedDB as any).databases().then((dbs: any[]) => {
              dbs.forEach(db => {
                window.indexedDB!.deleteDatabase(db.name);
              });
            }).catch(e => console.warn('Database listing hatası:', e));
          }
        }
      } catch (error) {
        console.warn('IndexedDB temizlik hatası:', error);
      }
      
      // Durumu güncelle
      setIsExpired(true);
      
      // Watcher'ı durdur
      if (watcherIntervalRef.current) {
        clearInterval(watcherIntervalRef.current);
      }
      
      // Login sayfasına yönlendir
      setTimeout(() => {
        navigate('/payment-expired', { replace: true });
      }, 500);
    }
  }, [accessControl, cleanupThreeJS, navigate]);

  // Watcher'ı başlat (her 10 saniye)
  useEffect(() => {
    if (!accessControl) return;

    // İlk kontrol
    checkAccess();

    // 10 saniyede bir kontrol
    watcherIntervalRef.current = setInterval(() => {
      checkAccess();
    }, 10000); // 10 saniye

    return () => {
      if (watcherIntervalRef.current) {
        clearInterval(watcherIntervalRef.current);
      }
    };
  }, [accessControl, checkAccess]);

  // İyi şekilde kur
  useEffect(() => {
    // Window global değişkenlerini oluştur (Three.js kodu kullanacak)
    if (!window.__threeScene) {
      (window as any).__threeScene = null;
    }
    if (!window.__threeRenderer) {
      (window as any).__threeRenderer = null;
    }
  }, []);

  return {
    isExpired,
    timeRemaining,
    isActive: accessControl ? !isExpired : false,
    accessLevel: accessControl?.accessLevel || 0,
    packageId: accessControl?.packageId || null
  };
}

// Window tipi genişleme
declare global {
  interface Window {
    __threeScene?: any;
    __threeRenderer?: any;
    __animationFrameId?: number;
  }
}
