"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, MapPin, Loader } from "lucide-react";
import { useLocation } from "@/lib/location-context";
import DetectionMapContainer from "@/components/DetectionMapContainer";

interface Detection {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  magnitude: number;
  accuracy: number;
}

const getMarkerColor = (magnitude: number): string => {
  if (magnitude > 100) return "#FFD700";
  if (magnitude > 75) return "#FF6347";
  if (magnitude > 50) return "#FFA500";
  return "#87CEEB";
};

export default function DetectionMap() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([location.lat, location.lng]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserLocation([location.lat, location.lng]);
  }, [location]);

  useEffect(() => {
    // Tespitleri yükle
    const loadDetections = async () => {
      try {
        const response = await fetch("/api/detections");
        const data = await response.json();
        setDetections(data);
      } catch (error) {
        console.error("Tespitler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDetections();
    const interval = setInterval(loadDetections, 5000);
    return () => clearInterval(interval);
  }, []);

  const mapCenter: [number, number] = userLocation || [39.9334, 32.8597];

  const stats = {
    total: detections.length,
    highMagnitude: detections.filter((d) => d.magnitude > 100).length,
    mediumMagnitude: detections.filter((d) => d.magnitude > 50 && d.magnitude <= 100).length,
    lowMagnitude: detections.filter((d) => d.magnitude <= 50).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/magnetometer")}>
            <ChevronLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold text-white">Hazine Haritası</h1>
          <div className="ml-auto text-sm text-slate-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Yükleniyor...
              </div>
            ) : (
              <span>{stats.total} tespit</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* İstatistikler */}
          <div className="lg:col-span-1 space-y-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4">
                <p className="text-gray-400 text-xs mb-1">Toplam Tespit</p>
                <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4">
                <p className="text-yellow-400 text-sm font-bold">🔥 Yüksek Magnitude</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.highMagnitude}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4">
                <p className="text-orange-400 text-sm font-bold">⚠️ Orta Magnitude</p>
                <p className="text-2xl font-bold text-orange-400">{stats.mediumMagnitude}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4">
                <p className="text-blue-400 text-sm font-bold">💧 Düşük Magnitude</p>
                <p className="text-2xl font-bold text-blue-400">{stats.lowMagnitude}</p>
              </CardContent>
            </Card>
          </div>

          {/* Leaflet Harita */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700 h-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Tespit Edilen Anomaliler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: "500px", width: "100%" }}>
                  <DetectionMapContainer
                    center={mapCenter}
                    zoom={13}
                    userLocation={userLocation}
                    detections={detections}
                    selectedDetection={selectedDetection}
                    onDetectionSelect={setSelectedDetection}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seçili Tespit Detayları */}
        {selectedDetection && (
          <Card className="mt-6 bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: getMarkerColor(selectedDetection.magnitude) }}
                  >
                    🎯
                  </div>
                  <div>
                    <CardTitle className="text-white">Tespit Detayları</CardTitle>
                    <p className="text-gray-400 text-sm">
                      {new Date(selectedDetection.timestamp).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDetection(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Magnitude</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {selectedDetection.magnitude.toFixed(2)} μT
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Doğruluk</p>
                  <p className="text-2xl font-bold text-green-400">
                    ±{selectedDetection.accuracy.toFixed(1)}m
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Enlem</p>
                  <p className="text-sm font-mono text-gray-300">
                    {selectedDetection.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Boylam</p>
                  <p className="text-sm font-mono text-gray-300">
                    {selectedDetection.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
