"use client";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Loader, Play, AlertCircle, CheckCircle, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "@/lib/location-context";
import ManualWorldLocationModal from "@/components/ManualWorldLocationModal";
import MapContainerComponent from "@/components/MapContainer";

interface Detection {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  magnitude?: number;
  accuracy?: number;
  confidence?: number;
  magneticField?: number;
  resourceType?: string;
  type?: string;
}

interface ScanFormData {
  latitude: string;
  longitude: string;
  depth: string;
  area: string;
}

export default function MapPage() {
  const { location } = useLocation();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([location.lat, location.lng]);

  // Manuel tarama form state'leri
  const [scanFormData, setScanFormData] = useState<ScanFormData>({
    latitude: location.lat.toString(),
    longitude: location.lng.toString(),
    depth: "10",
    area: "100",
  });
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showWorldLocationModal, setShowWorldLocationModal] = useState(false);

  useEffect(() => {
    setUserLocation([location.lat, location.lng]);
    setScanFormData(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
    }));
  }, [location]);

  // Manuel tarama başlat
  const handleStartScan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setScanLoading(true);
    setScanError(null);
    setScanSuccess(false);

    try {
      const lat = parseFloat(scanFormData.latitude);
      const lng = parseFloat(scanFormData.longitude);
      const depth = parseFloat(scanFormData.depth);
      const area = parseFloat(scanFormData.area);

      if (isNaN(lat) || isNaN(lng) || isNaN(depth) || isNaN(area)) {
        throw new Error("Tüm alanlar geçerli sayı olmalıdır");
      }

      if (depth < 0 || area < 0) {
        throw new Error("Derinlik ve alan negatif olamaz");
      }

      const response = await fetch("/api/manual-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          depth,
          area,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Tarama başlatılırken hata oluştu");
      }

      const data = await response.json();

      if (data.success && data.scan.detections) {
        // Yeni tespitleri mevcut tespitlere ekle
        setDetections(prev => [...prev, ...data.scan.detections]);
        setScanSuccess(true);

        // 3 saniye sonra success mesajını gizle
        setTimeout(() => setScanSuccess(false), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata oluştu";
      setScanError(errorMessage);
      console.error("Tarama hatası:", error);
    } finally {
      setScanLoading(false);
    }
  };

  const handleFormChange = (field: keyof ScanFormData, value: string) => {
    setScanFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorldLocationConfirm = (params: {
    latitude: number;
    longitude: number;
    depth: number;
    area: number;
  }) => {
    setScanFormData({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      depth: params.depth.toString(),
      area: params.area.toString(),
    });
    setUserLocation([params.latitude, params.longitude]);
    setShowWorldLocationModal(false);
  };

  useEffect(() => {
    // Tespit edilen anomalileri yükle
    const loadDetections = async () => {
      try {
        const response = await fetch("/api/detections");
        const data = await response.json();
        // response.json() objektif structure check
        if (data.detections) {
          setDetections(data.detections);
        } else if (Array.isArray(data)) {
          setDetections(data);
        }
      } catch (error) {
        console.error("Tespitler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDetections();
    const interval = setInterval(loadDetections, 5000); // 5 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  // Harita merkez konumu
  const mapCenter: [number, number] = userLocation || [39.9334, 32.8597]; // Ankara koordinatları

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 z-20">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Hazine Haritası</h1>
        <div className="ml-auto text-sm text-slate-600">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Yükleniyor...
            </div>
          ) : (
            <span>{detections.length} tespit bulundu</span>
          )}
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Map Container */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-lg shadow-sm">
          <MapContainerComponent
            center={mapCenter}
            zoom={13}
            userLocation={userLocation}
            detections={detections}
          />
        </div>

        {/* Manuel Tarama Formu */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Manuel Tarama
            </h2>

            <form onSubmit={handleStartScan} className="space-y-4">
              {/* Dünya Konumu Butonu */}
              <Button
                type="button"
                onClick={() => setShowWorldLocationModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4"
              >
                <Globe className="w-4 h-4 mr-2" />
                Dünya Genelinden Konum Seç
              </Button>

              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Boylam (Latitude)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={scanFormData.latitude}
                  onChange={(e) => handleFormChange("latitude", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="39.9334"
                  disabled={scanLoading}
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meridyen (Longitude)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={scanFormData.longitude}
                  onChange={(e) => handleFormChange("longitude", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="32.8597"
                  disabled={scanLoading}
                />
              </div>

              {/* Derinlik */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Derinlik (metre)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={scanFormData.depth}
                  onChange={(e) => handleFormChange("depth", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  disabled={scanLoading}
                />
              </div>

              {/* Alan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alan (m²)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={scanFormData.area}
                  onChange={(e) => handleFormChange("area", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  disabled={scanLoading}
                />
              </div>

              {/* Error Message */}
              {scanError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-2 items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{scanError}</p>
                </div>
              )}

              {/* Success Message */}
              {scanSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex gap-2 items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">Tarama başarıyla tamamlandı!</p>
                </div>
              )}

              {/* Tarama Başlat Butonu */}
              <Button
                type="submit"
                disabled={scanLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                {scanLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Tarama Başlıyor...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Tarama Başlat
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Bilgi Paneli */}
          <div className="bg-white rounded-lg shadow-sm p-4 hidden lg:block">
            <h3 className="font-semibold mb-3 text-sm">Bilgiler</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-medium">Mevcut Konum:</span> {userLocation[0].toFixed(4)}°N, {userLocation[1].toFixed(4)}°E
              </p>
              <p>
                <span className="font-medium">Toplam Tespit:</span> {detections.length}
              </p>
              <div className="pt-2 border-t border-slate-200 mt-2">
                <p className="text-xs text-slate-500">
                  Harita, belirlediğiniz koordinatlar ve derinlik/alan parametrelerine göre analiz yaparak anomalileri tespit eder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dünya Konumu Modal */}
      <ManualWorldLocationModal
        isOpen={showWorldLocationModal}
        onClose={() => setShowWorldLocationModal(false)}
        onConfirm={handleWorldLocationConfirm}
      />
    </div>
  );
}
