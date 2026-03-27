import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CameraContextType {
  isCameraOpen: boolean;
  openCamera: () => void;
  closeCamera: () => void;
  isScanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  hasLocation: boolean;
  setHasLocation: (has: boolean) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const openCamera = () => {
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setIsScanning(false);
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <CameraContext.Provider
      value={{
        isCameraOpen,
        openCamera,
        closeCamera,
        isScanning,
        startScanning,
        stopScanning,
        hasLocation,
        setHasLocation,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};
