import { useState, useMemo, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, Plus, Minus, Zap, ScanLine, Thermometer, Waves, BarChart,
  Download, BrainCircuit, SlidersHorizontal, Palette, Star, MapPin, FileText, History, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AreaHeatmap, { HeatmapCell, PaletteName } from '@/components/AreaHeatmap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type ScanType = 'magnetic' | 'thermal' | 'gpr';

export default function AreaScanner() {
  const [gridSize, setGridSize] = useState(8);
  const [intensity, setIntensity] = useState(50);
  const [scanType, setScanType] = useState<ScanType>('magnetic');
  const [threshold, setThreshold] = useState(0);
  const [pattern, setPattern] = useState('Yok');
  const [cellData, setCellData] = useState<HeatmapCell[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [palette, setPalette] = useState<PaletteName>('default');
  const [clusteringEnabled, setClusteringEnabled] = useState(false);

  const features = [
    { id: 'multi-layer', icon: ScanLine, title: "Çok Katmanlı Tarama", description: "Manyetik, termal ve GPR verilerini tek bir katmanda birleştirerek yüzey altı anomalilerini daha yüksek doğrulukla tespit eder." },
    { id: 'hotspot', icon: Star, title: "Otomatik Hotspot Tespiti", description: "Algoritma, tarama alanındaki en yüksek sinyal yoğunluğuna sahip noktaları (hotspot) otomatik olarak belirler ve işaretler." },
    { id: 'stats', icon: BarChart, title: "Detaylı İstatistik Paneli", description: "Tarama verilerine dair ortalama, medyan, standart sapma ve sinyal dağılımı gibi kritik istatistikleri anlık olarak sunar." },
    { id: 'ai', icon: BrainCircuit, title: "Yapay Zeka Desen Tanıma", description: "Tespit edilen anomalilerin geometrik şekillerini (küp, silindir, dağınık) analiz ederek olası yapı türünü tahmin eder." },
    { id: 'threshold', icon: SlidersHorizontal, title: "Dinamik Skor Eşiği", description: "Çevresel gürültüyü filtrelemek için sinyal eşik değerini gerçek zamanlı olarak ayarlamanıza olanak tanır." },
    { id: 'grid', icon: "■", title: "Ayarlanabilir Grid", description: "Tarama çözünürlüğünü artırmak veya azaltmak için grid boyutunu (4x4, 8x8, 16x16) ihtiyacınıza göre yapılandırın." },
    { id: 'density', icon: "●", title: "Yoğunluk Kontrolü", description: "Simülasyon veya sensör verilerinin yoğunluğunu değiştirerek tarama hassasiyetini optimize edin." },
    { id: 'palette', icon: Palette, title: "Renk Paleti Seçimi", description: "Veri görselleştirmesi için farklı renk haritaları (Termal, Gri Tonlama, Spektral) arasında geçiş yapın." },
    { id: 'clustering', icon: MapPin, title: "Anomali Kümeleme", description: "Dağınık sinyalleri analiz ederek birbirine yakın yüksek değerli noktaları tek bir yapı kümesi olarak gruplandırır." },
    { id: 'export', icon: Download, title: "Veri Dışa Aktarma", description: "Tarama sonuçlarını, koordinatları ve analiz verilerini CSV, JSON veya PDF formatında dışa aktarın." },
    { id: 'report', icon: FileText, title: "Özet Rapor Oluşturma", description: "Saha çalışması sonrası analizleriniz için otomatik olarak detaylı özet raporlar oluşturun." },
    { id: 'history', icon: History, title: "Tarihsel Veri Karşılaştırma", description: "Aynı bölgede yapılan eski taramalarla mevcut verileri kıyaslayarak değişimleri gözlemleyin." },
    { id: 'premium', icon: Lock, title: "Premium Özellikler", description: "Bulut depolama, ekip işbirliği, gelişmiş 3D modelleme ve sınırsız veri geçmişi gibi profesyonel özelliklere erişim." },
  ];

  // Generate heatmap cells with realistic distribution
  const cells = useMemo(() => {
    const cells: HeatmapCell[] = [];

    // Create a hotspot in the middle
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Score decreases with distance from center
        let baseScore = Math.max(0, 100 - distance * 15);

        // Apply intensity modifier
        let score = baseScore * (intensity / 100);

        // Adjust score based on scan type for more realistic simulation
        if (scanType === 'thermal') {
          score *= 0.8 + (Math.random() * 0.4); // Thermal is more noisy
          if (distance < 2) score += 15; // Central heat source
        } else if (scanType === 'gpr') {
          // GPR is better for structure edges, so we create a ring-like pattern
          const ringRadius = gridSize / 4;
          const ringEffect = 1 - Math.abs(distance - ringRadius) / ringRadius;
          score = Math.max(0, score * 0.5 + Math.max(0, ringEffect) * 70);
          score += (Math.random() - 0.5) * 30;
        }

        // Add some randomness
        const noise = (Math.random() - 0.5) * 20;
        score = Math.max(0, Math.min(100, score + noise));

        if (score > 5) {
          cells.push({
            x,
            y,
            score: Math.round(score),
          });
        }
      }
    }

    return cells;
  }, [gridSize, intensity, scanType]);

  const handleScan = () => {
    setIsScanning(true);
    setCellData(cells);

    // Simple pattern recognition
    const highScores = cells.filter(c => c.score > 75);
    if (highScores.length > 5) {
      setPattern('Geniş Küme (Geniş Anomali)');
    } else if (highScores.length > 2) {
      setPattern('Yoğun Merkez (Odaklanmış Sinyal)');
    } else {
      setPattern('Dağınık Sinyal (Belirsiz)');
    }

    setTimeout(() => setIsScanning(false), 1500);
  };

  const filteredCells = useMemo(() => {
    return cellData.filter(c => c.score >= threshold);
  }, [cellData, threshold]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredCells.length === 0) return { avg: 0, max: 0, min: 0, coverage: 0, hotspot: null };

    const scores = filteredCells.map((c) => c.score);
    const avg = Math.round(scores.reduce((a, b) => a + b) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const coverage = Math.round((filteredCells.length / (gridSize * gridSize)) * 100);
    const hotspot = filteredCells.reduce(
      (maxCell, currentCell) => currentCell.score > maxCell.score ? currentCell : maxCell,
      filteredCells[0]
    );

    return { avg, max, min, coverage, hotspot };
  }, [filteredCells, gridSize]);

  const handleExportCSV = () => {
    if (cellData.length === 0) return;
    
    const headers = ["x", "y", "score"];
    const rows = cellData.map(cell => [cell.x, cell.y, cell.score]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scan_data_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (cellData.length === 0) return;

    const jsonContent = JSON.stringify(cellData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `scan_data_${new Date().toISOString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-white">Alan Tarama & Heatmap</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Heatmap Display */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden min-h-[400px] lg:min-h-[600px]">
          {filteredCells.length > 0 ? (
            <AreaHeatmap cells={filteredCells} gridSize={gridSize} areaWidth={100} areaHeight={100} hotspot={stats.hotspot} palette={palette} clustering={clusteringEnabled} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <div className="text-center text-slate-400">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tarama yapmak için "Taramayı Başlat" düğmesine tıklayınız</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="w-full lg:w-80 space-y-4 overflow-y-auto lg:max-h-[calc(100vh-120px)]">
          {/* Scan Controls */}
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 p-4">
            <h3 className="font-semibold text-blue-100 mb-4">Tarama Kontrolleri</h3>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {isScanning ? 'Tarama Yapılıyor...' : 'Taramayı Başlat'}
            </Button>
            {filteredCells.length > 0 && (
              <Button
                onClick={() => setCellData([])}
                variant="outline"
                className="w-full mt-2 text-slate-300"
              >
                Temizle
              </Button>
            )}
          </Card>

          {/* Grid Configuration */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-4">Grid Ayarları</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-300 block mb-2">Tarama Türü</label>
                <Select value={scanType} onValueChange={(v: ScanType) => setScanType(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tarama türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="magnetic"><ScanLine className="w-4 h-4 inline-block mr-2" />Manyetik</SelectItem>
                    <SelectItem value="thermal"><Thermometer className="w-4 h-4 inline-block mr-2" />Termal</SelectItem>
                    <SelectItem value="gpr"><Waves className="w-4 h-4 inline-block mr-2" />GPR (Radar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-slate-300">Grid Boyutu</label>
                  <Badge variant="outline">{gridSize}×{gridSize}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setGridSize(Math.max(4, gridSize - 2))}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Küçült
                  </Button>
                  <Slider
                    value={[gridSize]}
                    onValueChange={(value) => setGridSize(value[0])}
                    min={4}
                    max={16}
                    step={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => setGridSize(Math.min(16, gridSize + 2))}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Büyüt
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-slate-300">Tarama Yoğunluğu</label>
                  <Badge variant="outline">{intensity}%</Badge>
                </div>
                <Slider
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-slate-300">Skor Eşiği</label>
                  <Badge variant="outline">{threshold}</Badge>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={(value) => setThreshold(value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Statistics */}
          {filteredCells.length > 0 && (
            <Card className="bg-slate-800 border-slate-700 p-4">
              <h3 className="font-semibold text-white mb-4">Tarama İstatistikleri</h3>

              <div className="space-y-3">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Ortalama Skor</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.avg}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Maksimum</div>
                    <div className="text-xl font-bold text-red-400">{stats.max}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Minimum</div>
                    <div className="text-xl font-bold text-blue-400">{stats.min}</div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Kaplama Oranı</div>
                  <div className="text-2xl font-bold text-green-400">{stats.coverage}%</div>
                </div>

                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Tespit Edilen Hücreler</div>
                  <div className="text-2xl font-bold text-white">
                    {filteredCells.length}/{gridSize * gridSize}
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-3 col-span-full">
                  <div className="text-sm text-slate-400 mb-1">AI Desen Tanıma</div>
                  <div className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" /> {pattern}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Features */}
          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700 p-4 text-green-100">
            <h3 className="font-semibold mb-3">Gelişmiş Alan Analizi Özellikleri</h3>
            <div className="grid grid-cols-2 gap-2">
              {features.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto py-2 px-2 justify-start text-left text-xs text-green-100 hover:text-white hover:bg-green-700/50 whitespace-normal"
                  onClick={() => setSelectedFeature(item)}
                >
                  <div className="flex items-center gap-2">
                    {typeof item.icon === 'string' ? <span>{item.icon}</span> : <item.icon className="w-3 h-3" />}
                    <span>{item.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </Card>

          {/* Color Legend */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3">Renk Ölçeği</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded" />
                <span className="text-slate-300">0–30: Düşük Aktivite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded" />
                <span className="text-slate-300">31–50: Orta Aktivite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded" />
                <span className="text-slate-300">51–80: Yüksek Aktivite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded" />
                <span className="text-slate-300">81–100: Yoğun Merkez</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedFeature} onOpenChange={(open) => !open && setSelectedFeature(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
          {selectedFeature && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-900/50 rounded-lg border border-green-700/50">
                    {typeof selectedFeature.icon === 'string' ? (
                      <span className="text-2xl">{selectedFeature.icon}</span>
                    ) : (
                      <selectedFeature.icon className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  {selectedFeature.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <div className="aspect-video w-full bg-slate-950 rounded-lg border border-slate-800 mb-4 flex items-center justify-center overflow-hidden relative group">
                   <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10" />
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                   
                   {typeof selectedFeature.icon === 'string' ? (
                      <span className="text-8xl opacity-20 group-hover:scale-110 transition-transform duration-500">{selectedFeature.icon}</span>
                    ) : (
                      <selectedFeature.icon className="w-24 h-24 text-slate-700 group-hover:text-green-500/50 transition-colors duration-500" />
                    )}
                   
                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
                </div>
                
                <DialogDescription className="text-slate-300 text-base leading-relaxed">
                  {selectedFeature.description}
                </DialogDescription>

                {selectedFeature.id === 'palette' && (
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="text-sm text-slate-400 mb-1">
                      Görselleştirme için bir renk paleti seçin.
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => { setPalette('default'); setSelectedFeature(null); }}
                        variant={palette === 'default' ? 'secondary' : 'outline'}
                        className="border-slate-600 hover:bg-slate-800 text-white"
                      >
                        Varsayılan
                      </Button>
                      <Button
                        onClick={() => { setPalette('thermal'); setSelectedFeature(null); }}
                        variant={palette === 'thermal' ? 'secondary' : 'outline'}
                        className="border-slate-600 hover:bg-slate-800 text-white"
                      >
                        Termal
                      </Button>
                      <Button
                        onClick={() => { setPalette('grayscale'); setSelectedFeature(null); }}
                        variant={palette === 'grayscale' ? 'secondary' : 'outline'}
                        className="border-slate-600 hover:bg-slate-800 text-white"
                      >
                        Gri Tonlama
                      </Button>
                      <Button
                        onClick={() => { setPalette('spectral'); setSelectedFeature(null); }}
                        variant={palette === 'spectral' ? 'secondary' : 'outline'}
                        className="border-slate-600 hover:bg-slate-800 text-white"
                      >
                        Spektral
                      </Button>
                    </div>
                  </div>
                )}

                {selectedFeature.id === 'clustering' && (
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="text-sm text-slate-400 mb-1">
                      Anomali kümeleme özelliğini açıp kapatın.
                    </div>
                    <Button
                      onClick={() => { setClusteringEnabled(!clusteringEnabled); setSelectedFeature(null); }}
                      className={`w-full ${clusteringEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                    >
                      {clusteringEnabled ? 'Kümelemeyi Kapat' : 'Kümelemeyi Aç'}
                    </Button>
                  </div>
                )}

                {selectedFeature.id === 'export' && (
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="text-sm text-slate-400 mb-1">
                      {cellData.length > 0 
                        ? `${cellData.length} veri noktası dışa aktarılmaya hazır.` 
                        : "Dışa aktarılacak veri bulunamadı. Lütfen önce tarama yapın."}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleExportCSV} 
                        disabled={cellData.length === 0}
                        variant="outline" 
                        className="flex-1 border-slate-600 hover:bg-slate-800 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        CSV İndir
                      </Button>
                      <Button 
                        onClick={handleExportJSON} 
                        disabled={cellData.length === 0}
                        variant="outline" 
                        className="flex-1 border-slate-600 hover:bg-slate-800 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        JSON İndir
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedFeature(null)} className="bg-green-600 hover:bg-green-700 text-white">
                  Kapat
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
