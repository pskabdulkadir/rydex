import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface CameraFeedProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function CameraFeed({ onClose, isOpen }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        // Arka kameraya erişim için constraints
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' }, // Arka kamera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          toast.success('Kamera açıldı');
        }
      } catch (error: any) {
        console.error('Kamera açma hatası:', error);
        let errorMsg = 'Kamera açılamadı';
        
        if (error.name === 'NotAllowedError') {
          errorMsg = 'Kamera izni reddedildi. Lütfen ayarlardan izin verin.';
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'Cihazda kamera bulunamadı';
        } else if (error.name === 'NotReadableError') {
          errorMsg = 'Kamera başka bir uygulama tarafından kullanılıyor';
        }
        
        toast.error(errorMsg);
      }
    };

    startCamera();

    return () => {
      // Kamerayı kapat
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Kamera Görünümü</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kamera Feed */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center">
                <p className="mb-4">Kamera başlatılıyor...</p>
              </div>
            </div>
          )}

          {/* Kamera durumu göstergesi */}
          {isCameraActive && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Canlı
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
