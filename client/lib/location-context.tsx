import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
  isGettingLocation: boolean;
  refreshLocation: () => Promise<void>;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Varsayılan koordinatlar (Yedek olarak İstanbul)
const DEFAULT_LOCATION: Location = { lat: 41.0082, lng: 28.9784 };

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<Location>(() => {
    const saved = localStorage.getItem('global_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocation = (newLoc: Location) => {
    setLocationState(newLoc);
    localStorage.setItem('global_location', JSON.stringify(newLoc));
  };

  const refreshLocation = async (): Promise<void> => {
    setIsGettingLocation(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Tarayıcı konum desteği sunmuyor.';
        setError(err);
        setIsGettingLocation(false);
        reject(err);
        return;
      }

      // Timeout süresini uzat ve highAccuracy'i devre dışı bırak
      const timeoutId = setTimeout(() => {
        setError('Konum alınamadı (zaman aşımı). Varsayılan konum kullanılıyor.');
        setIsGettingLocation(false);
        reject('Konum alma zaman aşımı');
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLoc);
          setIsGettingLocation(false);
          resolve();
        },
        (err) => {
          clearTimeout(timeoutId);
          const errorMsg = `Konum hatası: ${err.message || 'Bilinmeyen hata'}`;
          setError(errorMsg);
          setIsGettingLocation(false);
          // Hata olsa bile, mevcut konumu kullan
          resolve();
        },
        {
          enableHighAccuracy: false, // Düşük doğruluk, daha hızlı
          timeout: 15000,
          maximumAge: 30000 // 30 saniye kadar eski konum kabul et
        }
      );
    });
  };

  // Konumu otomatik olarak izle
  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocationState(newLoc);
          localStorage.setItem('global_location', JSON.stringify(newLoc));
        },
        (err) => {
          console.warn('Konum izleme hatası:', err);
        },
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, isGettingLocation, refreshLocation, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
