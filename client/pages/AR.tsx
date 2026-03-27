import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";

export default function AR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Kamera erişim hatası:", err);
        setHasPermission(false);
      }
    };

    getCamera();

    return () => {
      // Stream'i temizle
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link to="/dashboard">
          <Button variant="secondary" size="icon" className="rounded-full opacity-80 hover:opacity-100">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Camera View */}
      {hasPermission === null && (
        <div className="flex h-full items-center justify-center text-white">
          <p>Kamera izni isteniyor...</p>
        </div>
      )}
      
      {hasPermission === false && (
        <div className="flex h-full flex-col items-center justify-center text-white gap-4 p-4 text-center">
          <Camera className="h-16 w-16 text-red-500" />
          <h2 className="text-xl font-bold">Kamera Erişimi Reddedildi</h2>
          <p>AR deneyimi için kamera izni gereklidir. Lütfen tarayıcı ayarlarından izin verin.</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Overlay UI */}
      {hasPermission && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50">
          <div className="bg-black/50 text-white px-6 py-3 rounded-full backdrop-blur-sm">
            <p className="text-sm font-medium">Hazine aranıyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}
