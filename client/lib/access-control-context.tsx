import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessControl, ACCESS_LEVELS } from './types/access-control';
import { useSmartLock } from './hooks/use-smart-lock';

interface AccessControlContextType {
  accessControl: AccessControl | null;
  isLoading: boolean;
  isExpired: boolean;
  timeRemaining: number | null;
  refreshAccess: () => Promise<void>;
  updateAccess: (accessControl: AccessControl) => void;
  hasFeature: (featureName: keyof AccessControl['features']) => boolean;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

interface AccessControlProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function AccessControlProvider({ children, userId }: AccessControlProviderProps) {
  const [accessControl, setAccessControl] = useState<AccessControl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);

  // Smart Lock hook'u kullan
  const smartLock = useSmartLock(accessControl);

  // Subscription'ı kontrol et
  useEffect(() => {
    const savedSub = localStorage.getItem('subscription');
    if (savedSub) {
      try {
        const sub = JSON.parse(savedSub);
        const daysRemaining = Math.max(0, Math.ceil((sub.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
        setHasValidSubscription(daysRemaining > 0);
      } catch (e) {
        setHasValidSubscription(false);
      }
    }
  }, []);

  // Firestore veya localStorage'dan access_control'ü getir
  const refreshAccess = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Önce localStorage'dan al (Ödeme sonrası kaydedilir)
      const cachedAccess = localStorage.getItem('access_control');
      if (cachedAccess) {
        try {
          const parsed = JSON.parse(cachedAccess);
          setAccessControl(parsed as AccessControl);
          console.log('✅ Access Control localStorage\'dan yüklendi', parsed);
          return;
        } catch (e) {
          console.warn('⚠ localStorage access control parse hatası:', e);
        }
      }

      // TODO: Firebase Firestore'dan getir (gelecek implementasyon)
      // const docRef = doc(db, 'access_control', userId);
      // const docSnap = await getDoc(docRef);
      // if (docSnap.exists()) {
      //   const data = docSnap.data() as AccessControl;
      //   setAccessControl(data);
      //   // Firestore'dan aldığımız veriyi de localStorage'a cache'leyelim
      //   localStorage.setItem('access_control', JSON.stringify(data));
      // }
    } catch (error) {
      console.error('Access control getme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Component mount olduğunda access'i getir
  useEffect(() => {
    refreshAccess();
  }, [userId]);

  const updateAccess = (newAccessControl: AccessControl) => {
    setAccessControl(newAccessControl);
  };

  // Özelliği kontrol et
  const hasFeature = (featureName: keyof AccessControl['features']): boolean => {
    if (!accessControl || smartLock.isExpired) {
      return false;
    }
    return accessControl.features[featureName] === true;
  };

  return (
    <AccessControlContext.Provider
      value={{
        accessControl,
        isLoading,
        isExpired: smartLock.isExpired,
        timeRemaining: smartLock.timeRemaining,
        refreshAccess,
        updateAccess,
        hasFeature
      }}
    >
      {children}
    </AccessControlContext.Provider>
  );
}

/**
 * Access Control Context'i kullan
 */
export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl, AccessControlProvider içinde kullanılmalıdır');
  }
  return context;
}

/**
 * Belirli bir özelliğin erişilip erişilemediğini kontrol et
 */
export function useHasFeature(featureName: keyof AccessControl['features']) {
  const { hasFeature } = useAccessControl();
  return hasFeature(featureName);
}

/**
 * Access level kontrol et
 */
export function useAccessLevel() {
  const { accessControl } = useAccessControl();
  return accessControl?.accessLevel || ACCESS_LEVELS.NONE;
}
