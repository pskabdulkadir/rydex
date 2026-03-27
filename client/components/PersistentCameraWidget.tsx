import React, { useEffect, useRef, useState } from 'react';
import { useCamera } from '@/lib/camera-context';
import { X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PersistentCameraWidget() {
  const { isCameraOpen, closeCamera, isScanning, startScanning, stopScanning } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');

  useEffect(() => {
    if (!isCameraOpen) {
      // Kamerayı kapat
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    // Kamerayı aç
    const initCamera = async () => {
      try {
        setCameraError('');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error: any) {
        let msg = 'Kamera açılamadı';
        if (error.name === 'NotAllowedError') {
          msg = 'Kamera izni reddedildi. Lütfen izin veriniz.';
        } else if (error.name === 'NotFoundError') {
          msg = 'Kamera cihazı bulunamadı.';
        } else if (error.name === 'NotReadableError') {
          msg = 'Kamera zaten kullanımda. Lütfen kapat.';
        }
        setCameraError(msg);
        toast.error(msg);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen]);

  if (!isCameraOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Kamera Akışı</h3>
          {isScanning && <p className="text-xs text-blue-100">Tarama devam ediyor...</p>}
        </div>
        <button
          onClick={closeCamera}
          className="hover:bg-blue-800 p-1 rounded transition-colors"
          aria-label="Kamerayı kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Kamera Video */}
      <div className="relative bg-black aspect-video">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-red-400">
              <p className="text-xs font-medium">{cameraError}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {isScanning && (
          <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse" />
        )}
      </div>

      {/* Kontroller */}
      <div className="p-3 space-y-2 bg-gray-50">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            disabled={!!cameraError || !stream}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9"
          >
            <Play className="w-4 h-4 mr-1" />
            Tarama Başlat
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm h-9"
          >
            <Square className="w-4 h-4 mr-1" />
            Taramayı Durdur
          </Button>
        )}
        <p className="text-xs text-gray-600 text-center">Kamerayı kapatmak için X'e tıklayınız</p>
      </div>
    </div>
  );
}
