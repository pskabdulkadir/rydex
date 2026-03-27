import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Compass, Zap, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MagneticReading, CalibrationData } from "@shared/magnetometer";
import {
  NoiseFilter,
  getRealMagneticData,
  CalibrationManager,
  loadCalibrationData,
  saveCalibrationData,
} from "@/lib/magnetometer-utils";
import { TreasureDetector } from "@/lib/treasure-detector";
import { alertSystem } from "@/lib/alert-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Magnetometer() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [currentReading, setCurrentReading] = useState<MagneticReading | null>(null);
  const [readings, setReadings] = useState<MagneticReading[]>([]);
  const [noiseFilter] = useState(new NoiseFilter(0.15));
  const [calibrationManager] = useState(new CalibrationManager());
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(100);
  const [treasureDetector] = useState(new TreasureDetector());

  // Kalibrasyon verisini yükle
  useEffect(() => {
    const stored = loadCalibrationData();
    if (stored) {
      calibrationManager.setCalibrationData(stored);
      setCalibrationData(stored);
    }
  }, []);

  // Gerçek sensör verisi alma
  useEffect(() => {
    if (!isRunning && !isCalibrating) return;

    const interval = setInterval(async () => {
      try {
        const rawData = await getRealMagneticData();

        // Gürültü filtresi uygula
        const filteredTotal = noiseFilter.filter(rawData.total);

        const filteredReading: MagneticReading = {
          ...rawData,
          total: parseFloat(filteredTotal.toFixed(2)),
        };

        if (isCalibrating) {
          calibrationManager.addReading(filteredReading.total);
          setCalibrationProgress((prev) => Math.min(prev + 1, 100));

          if (calibrationProgress >= 99) {
            const newCalibration = calibrationManager.completeCalibration();
            setCalibrationData(newCalibration);
            saveCalibrationData(newCalibration);
            setIsCalibrating(false);
            setCalibrationProgress(0);
            alertSystem.showVisualAlert(
              "✅ Kalibrasyon Tamamlandı",
              `Başlangıç değeri: ${newCalibration.baseline.toFixed(2)} µT`,
              "success"
            );
          }
        } else {
          setCurrentReading(filteredReading);
          setReadings((prev) => [...prev.slice(-99), filteredReading]);

          // Anomali tespiti
          if (calibrationData) {
            if (filteredReading.total > alertThreshold) {
              alertSystem.triggerAlert(filteredReading.total, alertThreshold);
            }
          }
        }
      } catch (error) {
        console.error("Magnetometer hatası:", error);
      }
    }, 500); // 500ms aralıkta ölçüm

    return () => clearInterval(interval);
  }, [isRunning, isCalibrating, calibrationProgress, alertThreshold, calibrationData]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleCalibration = () => {
    calibrationManager.startCalibration();
    setIsCalibrating(true);
    setCalibrationProgress(0);
  };

  const getDangerLevel = (value: number | null) => {
    if (!value) return { label: "Standby", color: "bg-gray-500" };
    if (value > alertThreshold * 1.5) return { label: "KRITIK", color: "bg-red-600" };
    if (value > alertThreshold) return { label: "UYARI", color: "bg-orange-500" };
    if (value > 70) return { label: "NORMAL", color: "bg-yellow-500" };
    return { label: "SADELİK", color: "bg-green-500" };
  };

  const level = getDangerLevel(currentReading?.total || null);
  const trend = readings.length > 0 ? treasureDetector.analyzeTrend(readings) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Compass className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Manyetik Alan Ölçüm</h1>
            </div>
            <p className="text-gray-400">Gerçek zamanlı magnetometer sensör analizi</p>
          </div>
        </div>

        {/* Yasal Disclaimer */}
        <Alert className="mb-6 border-yellow-600 bg-yellow-950">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            ⚠️ Bu uygulama yalnızca manyetik alan ölçümü ve eğitim amaçlıdır. Yer altı tespit veya
            define bulma garantisi vermez.
          </AlertDescription>
        </Alert>

        {/* Ana Ölçüm Kartı */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Canlı Ölçüm</CardTitle>
              <div className={`px-3 py-1 rounded-full text-white font-bold ${level.color}`}>
                {level.label}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Büyük Gösterge */}
            <div className="bg-slate-900 rounded-lg p-8 mb-6 border border-slate-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Toplam Manyetik Alan</p>
                <p className="text-6xl font-bold text-blue-400">
                  {currentReading?.total.toFixed(1) || "0.0"}
                </p>
                <p className="text-gray-500 text-lg">µT (mikrotesla)</p>
              </div>
            </div>

            {/* XYZ Eksenleri */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <p className="text-gray-400 text-sm">X Ekseni</p>
                <p className="text-2xl font-bold text-red-400">
                  {currentReading?.x.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <p className="text-gray-400 text-sm">Y Ekseni</p>
                <p className="text-2xl font-bold text-green-400">
                  {currentReading?.y.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <p className="text-gray-400 text-sm">Z Ekseni</p>
                <p className="text-2xl font-bold text-blue-400">
                  {currentReading?.z.toFixed(1) || "0.0"}
                </p>
              </div>
            </div>

            {/* Kontrol Butonları */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleStartStop}
                size="lg"
                className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isRunning ? "DURDUR" : "BAŞLAT"}
              </Button>

              <Button
                onClick={handleCalibration}
                disabled={isCalibrating || !isRunning}
                variant="outline"
                size="lg"
              >
                {isCalibrating ? `Kalibrasyon... ${calibrationProgress}%` : "Kalibrasyon Yap"}
              </Button>
            </div>

            {/* Kalibrasyon Durumu */}
            {calibrationData && (
              <div className="bg-slate-900 p-4 rounded border border-green-700">
                <p className="text-green-400 text-sm font-bold">✅ Kalibrasyon Aktif</p>
                <p className="text-gray-400 text-xs">
                  Başlangıç: {calibrationData.baseline.toFixed(2)} µT
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ayarlar ve Trend Analizi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Eşik Ayarı */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Uyarı Eşiği</CardTitle>
              <CardDescription>Anomali uyarısı tetikleme seviyesi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={[alertThreshold]}
                  onValueChange={(value) => setAlertThreshold(value[0])}
                  min={50}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-2xl font-bold text-yellow-400">{alertThreshold} µT</p>
              </div>
            </CardContent>
          </Card>

          {/* Trend Analizi */}
          {trend && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trend Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Trend</p>
                    <p className="text-lg font-bold text-blue-400">
                      {trend.trend === "increasing"
                        ? "📈 Yükseliş"
                        : trend.trend === "decreasing"
                          ? "📉 Düşüş"
                          : "➡️ Stabil"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-gray-400 text-xs">Ortalama</p>
                      <p className="font-bold text-green-400">{trend.average.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Max</p>
                      <p className="font-bold text-red-400">{trend.max.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Min</p>
                      <p className="font-bold text-blue-400">{trend.min.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigasyon */}
        <Tabs defaultValue="graph" className="mb-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="graph">Grafik</TabsTrigger>
            <TabsTrigger value="detections">Tespitler</TabsTrigger>
            <TabsTrigger value="map">Harita</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="mt-0">
            <Button
              onClick={() => navigate("/magnetometer/graph")}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Grafik Sayfasına Git
            </Button>
          </TabsContent>

          <TabsContent value="detections" className="mt-0">
            <Button
              onClick={() => navigate("/magnetometer/detections")}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Tespit Edilen Kaynakları Gör
            </Button>
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <Button
              onClick={() => navigate("/magnetometer/map")}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              Harita Üzerinde Görüntüle
            </Button>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Button
              onClick={() => navigate("/magnetometer/history")}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Ölçüm Geçmişini Gör
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
