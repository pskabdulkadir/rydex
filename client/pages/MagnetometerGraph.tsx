import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts";
import { MagneticReading } from "@shared/magnetometer";
import { getRealMagneticData, NoiseFilter } from "@/lib/magnetometer-utils";
import { ChevronLeft } from "lucide-react";

export default function MagnetometerGraph() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [noiseFilter] = useState(new NoiseFilter(0.15));

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      try {
        const rawData = await getRealMagneticData();
        const filteredTotal = noiseFilter.filter(rawData.total);

        setGraphData((prev) => {
          const newData = [
            ...prev,
            {
              time: new Date(rawData.timestamp).toLocaleTimeString(),
              total: parseFloat(filteredTotal.toFixed(2)),
              x: rawData.x,
              y: rawData.y,
              z: rawData.z,
              timestamp: rawData.timestamp,
            },
          ];
          return newData.slice(-100); // Son 100 veri noktasını tut
        });
      } catch (error) {
        console.error("Magnetometer hatası:", error);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

  const stats = graphData.length > 0 ? {
    average: (graphData.reduce((a, b) => a + b.total, 0) / graphData.length).toFixed(2),
    max: Math.max(...graphData.map((d) => d.total)).toFixed(2),
    min: Math.min(...graphData.map((d) => d.total)).toFixed(2),
  } : { average: "0", max: "0", min: "0" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold text-white">Grafik Analizi</h1>
        </div>

        {/* Kontrol Butonları */}
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            size="lg"
            className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isRunning ? "DURDUR" : "BAŞLAT"}
          </Button>
          <Button
            onClick={() => setGraphData([])}
            variant="outline"
            size="lg"
          >
            Temizle
          </Button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-1">Ortalama</p>
              <p className="text-2xl font-bold text-green-400">{stats.average} µT</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-1">Maksimum</p>
              <p className="text-2xl font-bold text-red-400">{stats.max} µT</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-sm mb-1">Minimum</p>
              <p className="text-2xl font-bold text-blue-400">{stats.min} µT</p>
            </CardContent>
          </Card>
        </div>

        {/* Grafik 1: Toplam Manyetik Alan */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Toplam Manyetik Alan (µT)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grafik 2: XYZ Eksenleri */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">XYZ Eksenleri Detaylı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Legend />
                <Line type="monotone" dataKey="x" stroke="#ef4444" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="y" stroke="#22c55e" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="z" stroke="#3b82f6" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grafik 3: Anomali Tespiti */}
        {graphData.length > 10 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Anomali Göstergesi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={graphData.map((d, i) => ({
                    ...d,
                    anomaly: i > 0 ? Math.abs(d.total - graphData[i - 1].total) : 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="anomaly"
                    stroke="#f97316"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
