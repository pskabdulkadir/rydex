import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trash2, MapPin } from "lucide-react";
import {
  MagneticReading,
  TreasureResult,
  ResourceType,
  RESOURCE_DISPLAY_NAMES,
  RESOURCE_COLORS,
} from "@shared/magnetometer";
import {
  NoiseFilter,
  getRealMagneticData,
  CalibrationManager,
  loadCalibrationData,
} from "@/lib/magnetometer-utils";
import { TreasureDetector } from "@/lib/treasure-detector";
import { alertSystem } from "@/lib/alert-system";
import { useLocation } from "@/lib/location-context";

export default function Detections() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [isRunning, setIsRunning] = useState(false);
  const [detections, setDetections] = useState<TreasureResult[]>([]);
  const [readings, setReadings] = useState<MagneticReading[]>([]);
  const [noiseFilter] = useState(new NoiseFilter(0.15));
  const [calibrationManager] = useState(new CalibrationManager());
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [treasureDetector] = useState(new TreasureDetector());

  // Kalibrasyon verisini yükle
  useEffect(() => {
    const stored = loadCalibrationData();
    if (stored) {
      calibrationManager.setCalibrationData(stored);
      setCalibrationData(stored);
    }
  }, []);

  // Gerçek sensör verisi ve tespit
  useEffect(() => {
    if (!isRunning || !calibrationData) return;

    const interval = setInterval(async () => {
      try {
        const rawData = await getRealMagneticData();
        const filteredTotal = noiseFilter.filter(rawData.total);

        const filteredReading: MagneticReading = {
          ...rawData,
          total: parseFloat(filteredTotal.toFixed(2)),
        };

        setReadings((prev) => {
          const updated = [...prev.slice(-199), filteredReading];

          // Her 20 okumada bir tespit et
          if (updated.length % 20 === 0) {
            const newDetections = treasureDetector.detectResources(
              updated,
              calibrationData.baseline
            );

            newDetections.forEach((detection) => {
              if (detection.confidence > 50) {
                alertSystem.triggerCriticalAlert(
                  RESOURCE_DISPLAY_NAMES[detection.resourceType],
                  detection.magneticStrength
                );
              }
            });

            setDetections((prev) => {
              const detectionsWithLoc = newDetections.map(d => ({
                ...d,
                latitude: location.lat,
                longitude: location.lng
              }));
              const merged = [...prev, ...detectionsWithLoc];
              // Duplikaları kaldır
              const unique = Array.from(
                new Map(merged.map((d) => [d.id, d])).values()
              );
              return unique.sort((a, b) => b.timestamp - a.timestamp);
            });
          }

          return updated;
        });
      } catch (error) {
        console.error("Magnetometer hatası:", error);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, calibrationData]);

  const handleClearDetections = () => {
    setDetections([]);
  };

  const getResourceIcon = (type: ResourceType) => {
    const icons: Record<string, string> = {
      [ResourceType.ARTIFACT]: "💎",
      [ResourceType.MINERAL]: "⛏️",
      [ResourceType.UNDERGROUND_STRUCTURE]: "🏗️",
      [ResourceType.VALUABLE_MATERIAL]: "✨",
      [ResourceType.UNKNOWN]: "❓",
    };
    return icons[type] || "❓";
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {
      [ResourceType.ARTIFACT]: 0,
      [ResourceType.MINERAL]: 0,
      [ResourceType.UNDERGROUND_STRUCTURE]: 0,
      [ResourceType.VALUABLE_MATERIAL]: 0,
      [ResourceType.UNKNOWN]: 0,
    };

    detections.forEach((d) => {
      if (stats[d.resourceType] !== undefined) {
        stats[d.resourceType]++;
      }
    });

    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/magnetometer")}
          >
            <ChevronLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold text-white">Tespit Edilen Kaynaklar</h1>
        </div>

        {/* Kontrol Butonları */}
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            size="lg"
            className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            disabled={!calibrationData}
          >
            {isRunning ? "DURDUR" : calibrationData ? "BAŞLAT" : "Kalibrasyon Gerekli"}
          </Button>

          {detections.length > 0 && (
            <Button
              onClick={handleClearDetections}
              variant="destructive"
              size="lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Temizle
            </Button>
          )}
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Hazine</p>
              <p className="text-2xl font-bold text-yellow-400">{stats[ResourceType.ARTIFACT] || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Madeni</p>
              <p className="text-2xl font-bold text-cyan-400">{stats[ResourceType.MINERAL]}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Yer Altı</p>
              <p className="text-2xl font-bold text-gray-400">
                {stats[ResourceType.UNDERGROUND_STRUCTURE]}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Değerli</p>
              <p className="text-2xl font-bold text-red-400">
                {stats[ResourceType.VALUABLE_MATERIAL]}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Toplam</p>
              <p className="text-2xl font-bold text-blue-400">{detections.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tespitler Listesi */}
        {detections.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-400">Henüz kaynak tespit edilmedi.</p>
              <p className="text-gray-500 text-sm mt-2">Ölçüme başlamak için başlat butonuna tıklayın.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {detections.map((detection) => (
              <Card
                key={detection.id}
                className="bg-slate-800 border-slate-700 hover:border-slate-600 transition"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {getResourceIcon(detection.resourceType)}
                        </span>
                        <div>
                          <p className="text-white font-bold">
                            {RESOURCE_DISPLAY_NAMES[detection.resourceType]}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(detection.timestamp).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detaylar */}
                    <div className="text-right space-y-1">
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Manyetik Şiddet</p>
                        <p className="text-lg font-bold text-blue-400">
                          {detection.magneticStrength.toFixed(2)} µT
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Anomali</p>
                        <p className="text-sm font-bold text-orange-400">
                          {detection.anomalyLevel.toFixed(2)} µT
                        </p>
                      </div>
                      <Badge className="ml-auto block bg-blue-600">
                        {Math.round(detection.confidence)}% Güven
                      </Badge>
                    </div>
                  </div>

                  {/* Konum (eğer varsa) */}
                  {detection.latitude && detection.longitude && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-gray-400 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
