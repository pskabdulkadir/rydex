import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Zap, AlertCircle, Search, Filter, Star, BarChart3, Zap as ZapIcon, Wand2, Layers, Radio, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Viewer3D from '@/components/Viewer3D';
import StructureDetailedModal from '@/components/StructureDetailedModal';
import StatsAndAchievementsPanel from '@/components/StatsAndAchievementsPanel';
import StructureComparator from '@/components/StructureComparator';
import MagneticSimulator from '@/components/MagneticSimulator';
import AdvancedAnalyticsPanel from '@/components/AdvancedAnalyticsPanel';
import LayerVisualization from '@/components/LayerVisualization';
import MagneticFieldVisualization from '@/components/MagneticFieldVisualization';
import { Model3DConfig } from '@/lib/3d-models';
import { STRUCTURES, StructureType, StructureCategory, STRUCTURE_CATEGORIES } from '@/lib/structures';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/storage-manager';

export default function Viewer3DPage() {
  const navigate = useNavigate();
  const [selectedStructure, setSelectedStructure] = useState<StructureType>('metal-box');
  const [activityScore, setActivityScore] = useState(75);
  const [depthMin, setDepthMin] = useState(1.5);
  const [depthMax, setDepthMax] = useState(3.5);
  const [areaRadius, setAreaRadius] = useState(2.0);
  const [densityLevel, setDensityLevel] = useState(85);
  const [stabilityCoefficient, setStabilityCoefficient] = useState(75);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StructureCategory | 'all'>('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showComparator, setShowComparator] = useState(false);
  const [activePanel, setActivePanel] = useState<'structures' | 'stats' | 'simulator' | 'analytics' | 'layers' | 'magnetic'>('structures');
  const [isFav, setIsFav] = useState(isFavorite(selectedStructure));

  // Scan sonuçlarından parametreleri yükle
  useEffect(() => {
    try {
      const lastResult = sessionStorage.getItem('lastComprehensiveScanResult');
      if (lastResult) {
        const comprehensive = JSON.parse(lastResult);
        const viewer3DData = comprehensive.features?.viewer3D;

        if (viewer3DData) {
          // Depth bilgisini yükle
          if (viewer3DData.depth) {
            const depth = viewer3DData.depth;
            setDepthMin(Math.max(0.1, depth - 1));
            setDepthMax(Math.min(500, depth + 1));
          }

          // Area Radius bilgisini yükle
          if (viewer3DData.areaRadius) {
            setAreaRadius(viewer3DData.areaRadius);
          }
        }
      }
    } catch (error) {
      console.warn('Scan sonuçları yüklenemedi:', error);
    }
  }, []);

  const config: Model3DConfig = {
    activityScore,
    depth: { min: depthMin, max: depthMax },
    areaRadius,
    densityLevel,
    stabilityCoefficient,
    showHeatmap,
  } as any;

  const structure = STRUCTURES[selectedStructure];

  const allStructureTypes: StructureType[] = [
    'metal-box',
    'burial-chest',
    'treasure-cluster',
    'metal-mass',
    'underground-room',
    'tunnel-line',
    'void-anomaly',
    'storage-room',
    'sarcophagus',
    'ancient-room',
    'stone-tomb',
    'ancient-storage',
    'rectangular-form',
    'circular-room',
    'dense-cluster',
    'gold-vault',
    'coin-cache',
    'pottery-cluster',
    'temple-foundation',
    'fortress-wall',
    'water-cistern',
    'burial-chamber',
    'geometric-foundation',
    'ventilation-shaft',
    'crystal-chamber',
    'aqueduct-system',
    'metallic-deposit',
    'excavation-gallery',
    'sculptural-mass',
    'assembly-hall',
    'treasure-vault',
    'mine-shaft',
    'underground-garden',
    'divine-sanctuary',
    'cylindrical-tower',
    'ceremonial-pit',
    'library-chamber',
    'armory-vault',
    'workshop-complex',
  ];

  // Filtre ve arama
  const filteredStructures = useMemo(() => {
    return allStructureTypes.filter((type) => {
      const s = STRUCTURES[type];
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleStartScan = (structureId: StructureType) => {
    setSelectedStructure(structureId);
    navigate(`/app/structure-scanner?id=${structureId}&depth=${depthMin}&area=${areaRadius}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">3D Yeraltı Modelleme</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* 3D Viewer */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden min-h-[600px]">
          <Viewer3D config={config} structureType={selectedStructure} />
        </div>

        {/* Control Panel */}
        <div className="w-80 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Arama ve Filtreleme */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Ara & Filtrele
            </h3>

            {/* Arama Kutusu */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Yapı türü ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-700 text-white text-sm placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Kategori Filtreleri */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold">Kategoriler</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Tümü
                </button>
                {(Object.keys(STRUCTURE_CATEGORIES) as StructureCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {STRUCTURE_CATEGORIES[cat].name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700">
              📊 {filteredStructures.length} yapı bulundu
            </p>
          </Card>

          {/* Structure Selection */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3">Yapı Türü Seçimi</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredStructures.length > 0 ? (
                filteredStructures.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedStructure(type);
                      setShowDetailedModal(true);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedStructure === type
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{STRUCTURES[type].icon}</span>
                      <span className="text-sm font-medium">{STRUCTURES[type].name}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-sm">Sonuç bulunamadı</p>
                  <p className="text-xs mt-1">Arama veya filtre kriterlerini değiştirin</p>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700">
              💡 İpucu: Detaylı bilgileri görmek için yapı adına tıklayın
            </p>
          </Card>

          {/* Seçili Yapı Bilgisi */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3">Seçili Yapı Bilgisi</h3>
            <div className="space-y-3">
              <div>
                <div className="text-2xl mb-2">{structure.icon}</div>
                <h4 className="font-semibold text-white">{structure.name}</h4>
                <p className="text-xs text-slate-400">{structure.categoryName}</p>
              </div>
              <p className="text-sm text-slate-400">{structure.description}</p>

              {/* Heatmap Toggle */}
              <div className="flex items-center gap-3 bg-slate-900/50 rounded p-3 mt-2">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-bold">Enerji Haritası</p>
                  <p className="text-xs text-slate-500">Manyetik anomali görünümü</p>
                </div>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    showHeatmap ? 'bg-blue-600' : 'bg-slate-700'
                  } flex items-center ${showHeatmap ? 'justify-end' : 'justify-start'} p-0.5`}
                >
                  <div className="w-5 h-5 rounded-full bg-white" />
                </button>
              </div>

              <Button
                onClick={() => setShowDetailedModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold mt-2"
              >
                Tüm Detayları Gör →
              </Button>
            </div>
          </Card>

          {/* Parameters */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-4">Parametreler</h3>

            <div className="space-y-4">
              {/* Activity Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-300">Aktivite Skoru</label>
                  <Badge variant="outline">{activityScore}</Badge>
                </div>
                <Slider
                  value={[activityScore]}
                  onValueChange={(value) => setActivityScore(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Brightness ve pulse yoğunluğunu etkiler
                </p>
              </div>

              {/* Depth Range */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-300">Derinlik (Min)</label>
                  <Badge variant="outline">{depthMin.toFixed(1)}m</Badge>
                </div>
                <Slider
                  value={[depthMin]}
                  onValueChange={(value) => setDepthMin(value[0])}
                  min={0.1}
                  max={depthMax - 0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-300">Derinlik (Max)</label>
                  <Badge variant="outline">{depthMax.toFixed(1)}m</Badge>
                </div>
                <Slider
                  value={[depthMax]}
                  onValueChange={(value) => setDepthMax(value[0])}
                  min={depthMin + 0.5}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Area Radius */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-300">Alan Çapı</label>
                  <Badge variant="outline">{areaRadius.toFixed(2)}m</Badge>
                </div>
                <Slider
                  value={[areaRadius]}
                  onValueChange={(value) => setAreaRadius(value[0])}
                  min={0.5}
                  max={8}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Density Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-300">Yoğunluk Seviyesi</label>
                  <Badge variant="outline">{densityLevel}%</Badge>
                </div>
                <Slider
                  value={[densityLevel]}
                  onValueChange={(value) => setDensityLevel(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Stability */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-slate-300">Stabilite Katsayısı</label>
                  <Badge variant="outline">{stabilityCoefficient}%</Badge>
                </div>
                <Slider
                  value={[stabilityCoefficient]}
                  onValueChange={(value) => setStabilityCoefficient(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Advanced Analysis Tabs */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              İleri Analiz
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setActivePanel('analytics')}
                className={cn(
                  'px-3 py-2 rounded text-xs font-medium transition-all flex flex-col items-center gap-1',
                  activePanel === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                <Eye className="w-3 h-3" />
                Metrikler
              </button>
              <button
                onClick={() => setActivePanel('layers')}
                className={cn(
                  'px-3 py-2 rounded text-xs font-medium transition-all flex flex-col items-center gap-1',
                  activePanel === 'layers'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                <Layers className="w-3 h-3" />
                Katmanlar
              </button>
              <button
                onClick={() => setActivePanel('magnetic')}
                className={cn(
                  'px-3 py-2 rounded text-xs font-medium transition-all flex flex-col items-center gap-1',
                  activePanel === 'magnetic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                <Radio className="w-3 h-3" />
                Manyetik
              </button>
            </div>

            {/* Panel İçeriği */}
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {activePanel === 'analytics' && (
                <AdvancedAnalyticsPanel
                  activityScore={activityScore}
                  config={{
                    depth: { min: depthMin, max: depthMax },
                    areaRadius,
                    densityLevel,
                    stabilityCoefficient,
                  }}
                  showHeatmap={showHeatmap}
                />
              )}
              {activePanel === 'layers' && (
                <LayerVisualization
                  depthMin={depthMin}
                  depthMax={depthMax}
                  densityLevel={densityLevel}
                  activityScore={activityScore}
                />
              )}
              {activePanel === 'magnetic' && (
                <MagneticFieldVisualization
                  activityScore={activityScore}
                  areaRadius={areaRadius}
                  densityLevel={densityLevel}
                />
              )}
            </div>
          </Card>

          {/* Bilgi */}
          <Card className="bg-blue-900/30 border-blue-700 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-200 text-sm mb-1">3D Özellikler</h4>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>✓ Yarı saydam toprak katmanı</li>
                  <li>✓ Aktiviteye göre parlak ışıltı</li>
                  <li>✓ Derinliğe göre konumlandırma</li>
                  <li>✓ Pulse animasyonu</li>
                  <li>✓ Otomatik dönen sahne</li>
                  <li>✓ Gelişmiş Analitik Panelları</li>
                  <li>✓ Katman Görselleştirmesi</li>
                  <li>✓ Manyetik Alan Analizi</li>
                  <li>✓ Enerji Haritası Gösterimi</li>
                  <li>✓ 3D İzometrik Görünüş</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Detaylı Modal */}
        <StructureDetailedModal
          structure={structure}
          isOpen={showDetailedModal}
          onClose={() => setShowDetailedModal(false)}
          onStartScan={handleStartScan}
        />
      </div>
    </div>
  );
}
