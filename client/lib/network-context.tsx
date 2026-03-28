import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface NetworkContextType {
  isOnline: boolean;
  isCheckingConnection: boolean;
  connectionChanged: boolean;
  wasOnline: boolean;
  forceCheckConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionChanged, setConnectionChanged] = useState(false);
  const [wasOnline, setWasOnline] = useState(navigator.onLine);

  const forceCheckConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      // navigator.onLine API'sini kullan (Express server'a bağımlı değil)
      const currentOnlineStatus = navigator.onLine;

      // Durumu değiştiyse ve önceki durumdan farklıysa
      if (currentOnlineStatus !== isOnline) {
        setWasOnline(isOnline);
        setIsOnline(currentOnlineStatus);
        setConnectionChanged(true);

        if (currentOnlineStatus) {
          console.log('✅ İnternet bağlantısı sağlandı');
        } else {
          console.log('❌ İnternet bağlantısı kesildi');
        }
      }
    } catch (error) {
      console.warn('⚠️ Bağlantı kontrolü hatası:', error);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setWasOnline(isOnline);
      setIsOnline(true);
      setConnectionChanged(true);
      console.log('✅ İnternet bağlantısı sağlandı');
    };

    const handleOffline = () => {
      setWasOnline(isOnline);
      setIsOnline(false);
      setConnectionChanged(true);
      console.log('❌ İnternet bağlantısı kesildi');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  // connectionChanged flag'ini sıfırla (bir kere tetikle)
  useEffect(() => {
    if (connectionChanged) {
      const timer = setTimeout(() => {
        setConnectionChanged(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [connectionChanged]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isCheckingConnection,
        connectionChanged,
        wasOnline,
        forceCheckConnection
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
