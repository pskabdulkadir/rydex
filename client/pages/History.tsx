import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Download, Trash2 } from "lucide-react";
import { MagneticReading } from "@shared/magnetometer";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<MagneticReading[]>([]);
  const [selectedRange, setSelectedRange] = useState<"all" | "hour" | "day">("all");

  // LocalStorage'dan verileri yükle
  useEffect(() => {
    const stored = localStorage.getItem("magnetometer_history");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const filterByTime = (): MagneticReading[] => {
    const now = Date.now();
    switch (selectedRange) {
      case "hour":
        return history.filter((r) => now - r.timestamp < 3600000);
      case "day":
        return history.filter((r) => now - r.timestamp < 86400000);
      default:
        return history;
    }
  };

  const filtered = filterByTime();

  const stats = filtered.length > 0 ? {
    average: (filtered.reduce((a, b) => a + b.total, 0) / filtered.length).toFixed(2),
    max: Math.max(...filtered.map((d) => d.total)).toFixed(2),
    min: Math.min(...filtered.map((d) => d.total)).toFixed(2),
    count: filtered.length,
  } : { average: "0", max: "0", min: "0", count: 0 };

  const handleExport = () => {
    const csv = [
      ["Zaman", "X (µT)", "Y (µT)", "Z (µT)", "Toplam (µT)"],
      ...filtered.map((r) => [
        new Date(r.timestamp).toLocaleString("tr-TR"),
        r.x.toFixed(2),
        r.y.toFixed(2),
        r.z.toFixed(2),
        r.total.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `magnetometer_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleClear = () => {
    if (confirm("Tüm geçmiş kayıtlarını silmek istediğinize emin misiniz?")) {
      setHistory([]);
      localStorage.removeItem("magnetometer_history");
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Ölçüm Geçmişi</h1>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Kayıtlar</p>
              <p className="text-2xl font-bold text-blue-400">{stats.count}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Ortalama</p>
              <p className="text-2xl font-bold text-green-400">{stats.average}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Maksimum</p>
              <p className="text-2xl font-bold text-red-400">{stats.max}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">Minimum</p>
              <p className="text-2xl font-bold text-blue-400">{stats.min}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-xs mb-1">µT Birimi</p>
              <p className="text-xs font-bold text-gray-400 mt-2">Mikrotesla</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            onClick={() => setSelectedRange("all")}
            variant={selectedRange === "all" ? "default" : "outline"}
            size="sm"
          >
            Tümü
          </Button>
          <Button
            onClick={() => setSelectedRange("day")}
            variant={selectedRange === "day" ? "default" : "outline"}
            size="sm"
          >
            Son 24 Saat
          </Button>
          <Button
            onClick={() => setSelectedRange("hour")}
            variant={selectedRange === "hour" ? "default" : "outline"}
            size="sm"
          >
            Son Saat
          </Button>

          {filtered.length > 0 && (
            <>
              <div className="flex-1" />
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV İndir
              </Button>
              <Button
                onClick={handleClear}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Temizle
              </Button>
            </>
          )}
        </div>

        {/* Kayıtlar Tablosu */}
        {filtered.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-400">Henüz kayıt yok.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-3 font-semibold text-gray-300">Zaman</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-300">X (µT)</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-300">Y (µT)</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-300">Z (µT)</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-300">Toplam (µT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .slice()
                      .reverse()
                      .slice(0, 50)
                      .map((record, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-700 hover:bg-slate-700 transition"
                        >
                          <td className="py-2 px-3 text-gray-400">
                            {new Date(record.timestamp).toLocaleString("tr-TR")}
                          </td>
                          <td className="text-right py-2 px-3 text-red-400 font-mono">
                            {record.x.toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-3 text-green-400 font-mono">
                            {record.y.toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-3 text-blue-400 font-mono">
                            {record.z.toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-3 text-yellow-400 font-bold font-mono">
                            {record.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > 50 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Son 50 kayıt gösteriliyor (toplam {filtered.length})
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
