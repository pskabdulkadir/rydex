import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Crown,
  Home,
  Droplets,
  DoorOpen,
  Gem,
  FileText,
  Layers,
  Volume2,
  Thermometer,
  Sparkles,
  BarChart3,
  GitBranch,
} from 'lucide-react';
import { ComprehensiveScanResult } from '@shared/api';

interface FeatureDetailProps {
  comprehensiveResult: ComprehensiveScanResult;
  featureId: string;
}

export function TreasureScanFeatureDetail({ comprehensiveResult, featureId }: FeatureDetailProps) {
  const features = comprehensiveResult.features as any;

  switch (featureId) {
    // Hazine Odaları
    case 'treasureChambers':
      if (!features.treasureChambers) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Tespit Durumu</p>
            <p className="font-bold">{features.treasureChambers.detected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Bulunan Oda Sayısı</p>
            <p className="font-bold">{features.treasureChambers.chambersFound}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Hacim</p>
            <p className="font-bold">{features.treasureChambers.totalVolume.toFixed(1)} m³</p>
          </div>
          <div>
            <p className="text-gray-600">Ortalama Derinlik</p>
            <p className="font-bold">{features.treasureChambers.averageDepth.toFixed(1)} m</p>
          </div>
          <div>
            <p className="text-gray-600">Tahmini Yaş</p>
            <p className="font-bold">{features.treasureChambers.estimatedAge} yıl</p>
          </div>
          <div>
            <p className="text-gray-600">İnşaat Tipi</p>
            <p className="font-bold">{features.treasureChambers.constructionType}</p>
          </div>
          <div>
            <p className="text-gray-600">Koruma Skoru</p>
            <p className="font-bold">{features.treasureChambers.preservationScore.toFixed(1)}%</p>
          </div>
          {features.treasureChambers.chambers.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Odalar</p>
              <div className="space-y-2 bg-gray-50 p-2 rounded max-h-48 overflow-y-auto">
                {features.treasureChambers.chambers.map((chamber: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-700 border-l-2 border-yellow-500 pl-2">
                    <p className="font-bold">{chamber.name}</p>
                    <p>Derinlik: {chamber.depth.toFixed(1)}m × Genişlik: {chamber.width.toFixed(1)}m</p>
                    <p>İçerik: {chamber.contents} | Durum: {chamber.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Yeraltı Yapıları
    case 'undergroundStructures':
      if (!features.undergroundStructures) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Tespit Durumu</p>
            <p className="font-bold">{features.undergroundStructures.structuresDetected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Yapı Sayısı</p>
            <p className="font-bold">{features.undergroundStructures.totalStructures}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-600">Duvarlar</p>
              <p className="font-bold">{features.undergroundStructures.types.walls}</p>
            </div>
            <div>
              <p className="text-gray-600">Sütunlar</p>
              <p className="font-bold">{features.undergroundStructures.types.pillars}</p>
            </div>
            <div>
              <p className="text-gray-600">Geçitler</p>
              <p className="font-bold">{features.undergroundStructures.types.passages}</p>
            </div>
            <div>
              <p className="text-gray-600">Tonozlar</p>
              <p className="font-bold">{features.undergroundStructures.types.vaults}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Genel Bütünlük</p>
            <p className="font-bold">{features.undergroundStructures.overallIntegrity.toFixed(1)}%</p>
          </div>
          {features.undergroundStructures.structures.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Detay</p>
              <div className="space-y-1 bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                {features.undergroundStructures.structures.map((struct: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-700">
                    {struct.type} ({struct.material}) - {struct.length.toFixed(0)}m, Bütünlük: {struct.integrity.toFixed(0)}%
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Su Kanalları
    case 'waterChannels':
      if (!features.waterChannels) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Tespit Durumu</p>
            <p className="font-bold">{features.waterChannels.detected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Kanal Sayısı</p>
            <p className="font-bold">{features.waterChannels.channelsFound}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Uzunluk</p>
            <p className="font-bold">{features.waterChannels.totalLength.toFixed(1)} m</p>
          </div>
          <div>
            <p className="text-gray-600">Su Varlığı</p>
            <p className="font-bold">{features.waterChannels.waterPresence ? 'Aktif' : 'Kurumuş'}</p>
          </div>
          <div>
            <p className="text-gray-600">Su Tipi</p>
            <p className="font-bold">{features.waterChannels.waterType}</p>
          </div>
          <div>
            <p className="text-gray-600">Akış Hızı</p>
            <p className="font-bold">{features.waterChannels.flowRate.toFixed(1)} L/dk</p>
          </div>
          {features.waterChannels.channels.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Kanal Bilgileri</p>
              <div className="space-y-1 bg-blue-50 p-2 rounded max-h-40 overflow-y-auto">
                {features.waterChannels.channels.map((ch: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-700">
                    Kanal {idx + 1}: {ch.direction} yönü, {ch.length.toFixed(0)}m, Akış: {ch.waterFlow.toFixed(0)}%
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Giriş Kapıları
    case 'entrances':
      if (!features.entrances) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Tespit Durumu</p>
            <p className="font-bold">{features.entrances.detected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Giriş Sayısı</p>
            <p className="font-bold">{features.entrances.entrancesFound}</p>
          </div>
          {features.entrances.mainEntranceCoords && (
            <div>
              <p className="text-gray-600">Ana Giriş Koordinatları</p>
              <p className="text-xs font-mono text-gray-700">
                {features.entrances.mainEntranceCoords.latitude.toFixed(6)}, {features.entrances.mainEntranceCoords.longitude.toFixed(6)}
              </p>
            </div>
          )}
          {features.entrances.entrances.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Giriş Detayları</p>
              <div className="space-y-2 bg-gray-50 p-2 rounded max-h-48 overflow-y-auto">
                {features.entrances.entrances.map((ent: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-700 border-l-2 border-green-500 pl-2">
                    <p className="font-bold">{ent.type}</p>
                    <p>{ent.width.toFixed(1)}m × {ent.height.toFixed(1)}m | Derinlik: {ent.depth.toFixed(2)}m</p>
                    <p>Durum: {ent.condition} {ent.sealed && '| Mühürlü'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Metal Yatakları
    case 'metalDeposits':
      if (!features.metalDeposits) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Tespit Durumu</p>
            <p className="font-bold">{features.metalDeposits.detected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Yatağa Sayısı</p>
            <p className="font-bold">{features.metalDeposits.depositsFound}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Tahmini Değer</p>
            <p className="font-bold text-green-600">
              ₺{(features.metalDeposits.totalEstimatedValue / 1000000).toFixed(1)}M
            </p>
          </div>
          {features.metalDeposits.deposits.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Metal Yatakları</p>
              <div className="space-y-2 bg-amber-50 p-2 rounded max-h-48 overflow-y-auto">
                {features.metalDeposits.deposits.map((dep: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-700 border-l-2 border-amber-500 pl-2">
                    <p className="font-bold">{dep.metal}</p>
                    <p>Miktar: {dep.quantity.toFixed(0)}kg | Saflık: %{dep.purity.toFixed(0)}</p>
                    <p>Derinlik: {dep.depth.toFixed(1)}m | Değer: ₺{(dep.value/1000).toFixed(0)}K</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // İçerik Analiz
    case 'contentAnalysis':
      if (!features.contentAnalysis) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Organik Madde</p>
            <p className="font-bold">{features.contentAnalysis.organicMatter.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Mineral İçeriği</p>
            <p className="font-bold">{features.contentAnalysis.mineralContent.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Metal İçeriği</p>
            <p className="font-bold">{features.contentAnalysis.metalContent.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Seramik Parçaları</p>
            <p className="font-bold">{features.contentAnalysis.ceramicFragments} adet</p>
          </div>
          <div>
            <p className="text-gray-600">Kemik Malzeme</p>
            <p className="font-bold">{features.contentAnalysis.boneMaterial} adet</p>
          </div>
          <div>
            <p className="text-gray-600">Tekstil Kalıntıları</p>
            <p className="font-bold">{features.contentAnalysis.textileRemains} adet</p>
          </div>
          <div>
            <p className="text-gray-600">Örnek Kalitesi</p>
            <p className="font-bold">{features.contentAnalysis.sampleQuality.toFixed(1)}%</p>
          </div>
          {features.contentAnalysis.artifacts.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Artefaktlar</p>
              <div className="space-y-1 bg-purple-50 p-2 rounded max-h-40 overflow-y-auto">
                {features.contentAnalysis.artifacts.map((art: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-700">
                    {art.type} ({art.era}) - Durum: {art.condition.toFixed(0)}%
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Jeoloji Analizi
    case 'geologyAnalysis':
      if (!features.geologyAnalysis) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Baskın Kayaç Tipi</p>
            <p className="font-bold">{features.geologyAnalysis.dominantRock}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600">Toprak Bileşimi</p>
            <div className="text-xs font-mono">
              <p>Kil: {features.geologyAnalysis.soilComposition.clay.toFixed(1)}%</p>
              <p>Silt: {features.geologyAnalysis.soilComposition.silt.toFixed(1)}%</p>
              <p>Kum: {features.geologyAnalysis.soilComposition.sand.toFixed(1)}%</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Mineral Yatakları</p>
            <p className="font-bold">{features.geologyAnalysis.mineralDeposits}</p>
          </div>
          <div>
            <p className="text-gray-600">Fay Aktivitesi</p>
            <p className="font-bold">{features.geologyAnalysis.faulting.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Kırılma Seviyesi</p>
            <p className="font-bold">{features.geologyAnalysis.fracturing.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Stabilite Derecelendirmesi</p>
            <p className="font-bold">{features.geologyAnalysis.stabilityRating.toFixed(1)}%</p>
          </div>
        </div>
      );

    // Ses Analizi
    case 'soundAnalysis':
      if (!features.soundAnalysis) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Boşluk Tespiti</p>
            <p className="font-bold">{features.soundAnalysis.voidDetected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Boşluk Hacmi</p>
            <p className="font-bold">{features.soundAnalysis.voidVolume.toFixed(0)} m³</p>
          </div>
          <div>
            <p className="text-gray-600">Rezonans Frekansı</p>
            <p className="font-bold">{features.soundAnalysis.resonanceFrequency.toFixed(0)} Hz</p>
          </div>
          <div>
            <p className="text-gray-600">Echo Gücü</p>
            <p className="font-bold">{features.soundAnalysis.echoPower.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Malzeme Yoğunluğu</p>
            <p className="font-bold">{features.soundAnalysis.materialDensity.toFixed(1)}%</p>
          </div>
          {features.soundAnalysis.anomalies.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Anomaliler</p>
              <div className="space-y-1 bg-indigo-50 p-2 rounded max-h-40 overflow-y-auto">
                {features.soundAnalysis.anomalies.map((anom: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-700">
                    {anom.frequency.toFixed(0)}Hz @ {anom.intensity.toFixed(0)}% yoğunluk
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Termal Haritalama
    case 'thermalMapping':
      if (!features.thermalMapping) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Ortalama Sıcaklık</p>
            <p className="font-bold">{features.thermalMapping.averageTemperature.toFixed(1)}°C</p>
          </div>
          <div>
            <p className="text-gray-600">Sıcaklık Değişkeni</p>
            <p className="font-bold">±{features.thermalMapping.temperatureVariance.toFixed(1)}°C</p>
          </div>
          <div>
            <p className="text-gray-600">Sıcak Noktalar</p>
            <p className="font-bold">{features.thermalMapping.hotSpots.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Jeotermal Aktivite</p>
            <p className="font-bold">{features.thermalMapping.geothermalActivity.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Anomali Skoru</p>
            <p className="font-bold">{features.thermalMapping.anomalyScore.toFixed(1)}%</p>
          </div>
          {features.thermalMapping.hotSpots.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Sıcak Bölgeler</p>
              <div className="space-y-1 bg-red-50 p-2 rounded max-h-40 overflow-y-auto">
                {features.thermalMapping.hotSpots.map((spot: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-700">
                    {spot.temperature.toFixed(1)}°C @ {spot.radius.toFixed(0)}m yarıçap
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Artefakt Tespiti
    case 'artifactDetection':
      if (!features.artifactDetection) return null;
      return (
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600">Tespit Durumu</p>
            <p className="font-bold">{features.artifactDetection.artifactsDetected ? 'Evet' : 'Hayır'}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Artefakt</p>
            <p className="font-bold">{features.artifactDetection.totalArtifacts}</p>
          </div>
          <div>
            <p className="text-gray-600">Toplam Tahmini Değer</p>
            <p className="font-bold text-purple-600">
              ₺{(features.artifactDetection.estimatedTotalValue / 1000000).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-gray-600">Arkeolojik Önemi</p>
            <p className="font-bold">{features.artifactDetection.archaeologicalSignificance.toFixed(1)}%</p>
          </div>
          {features.artifactDetection.artifacts.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">Bulunan Artefaktlar</p>
              <div className="space-y-2 bg-pink-50 p-2 rounded max-h-48 overflow-y-auto">
                {features.artifactDetection.artifacts.map((art: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-700 border-l-2 border-pink-500 pl-2">
                    <p className="font-bold">{art.name} ({art.material})</p>
                    <p>Dönem: {art.era} | Nadir Seviyesi: {art.rarity}/10</p>
                    <p>Değer: ₺{(art.estimatedValue/1000).toFixed(0)}K</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    // Harita Görseli
    case 'mapVisualization':
      if (!features.mapVisualization) return null;
      return (
        <div className="space-y-3">
          <div className="text-sm">
            <p className="text-gray-600">Grid Boyutu</p>
            <p className="font-bold">{features.mapVisualization.gridSize}x{features.mapVisualization.gridSize}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-600">Anomali Noktaları</p>
            <p className="font-bold">{features.mapVisualization.anomalyPoints.length}</p>
          </div>
          <svg width="100%" height="200" viewBox="0 0 100 100" className="bg-gray-100 rounded">
            {/* Grid */}
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={`grid-${i}`}>
                <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#ddd" strokeWidth="0.5" />
                <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#ddd" strokeWidth="0.5" />
              </g>
            ))}
            {/* Anomali Noktaları */}
            {features.mapVisualization.anomalyPoints.map((point: any, idx: number) => {
              const colors: { [key: string]: string } = {
                hazine: '#FFD700',
                yapı: '#A0522D',
                metal: '#C0C0C0',
                su: '#4169E1',
              };
              return (
                <circle
                  key={idx}
                  cx={point.x}
                  cy={point.y}
                  r={point.intensity / 20}
                  fill={colors[point.type] || '#FF6B6B'}
                  opacity="0.7"
                />
              );
            })}
          </svg>
          <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
            <p>🟡 Hazine | 🟤 Yapı | ⚪ Metal | 🔵 Su</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export const TREASURE_FEATURES = [
  {
    id: 'treasureChambers',
    name: 'Hazine Odaları',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-600',
    description: 'Yeraltı hazine odaları ve depo odaları tespiti',
  },
  {
    id: 'undergroundStructures',
    name: 'Yeraltı Yapıları',
    icon: Home,
    color: 'bg-orange-100 text-orange-600',
    description: 'Duvarlar, sütunlar, tonozlar ve geçitler',
  },
  {
    id: 'waterChannels',
    name: 'Su Kanalları',
    icon: Droplets,
    color: 'bg-blue-100 text-blue-600',
    description: 'Antik su sistemleri ve kanalizasyon',
  },
  {
    id: 'entrances',
    name: 'Giriş Kapıları',
    icon: DoorOpen,
    color: 'bg-green-100 text-green-600',
    description: 'Giriş noktaları ve koordinatlar',
  },
  {
    id: 'metalDeposits',
    name: 'Değerli Madenler',
    icon: Gem,
    color: 'bg-amber-100 text-amber-600',
    description: 'Altın, gümüş, bakır ve diğer metaller',
  },
  {
    id: 'contentAnalysis',
    name: 'İçerik Analizi',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Artefakt ve malzeme analizi',
  },
  {
    id: 'geologyAnalysis',
    name: 'Jeoloji Analizi',
    icon: Layers,
    color: 'bg-slate-100 text-slate-600',
    description: 'Kayaç tipi ve toprak bileşimi',
  },
  {
    id: 'soundAnalysis',
    name: 'Ses Analizi',
    icon: Volume2,
    color: 'bg-cyan-100 text-cyan-600',
    description: 'Boşluk ve rongön tespiti',
  },
  {
    id: 'thermalMapping',
    name: 'Termal Harita',
    icon: Thermometer,
    color: 'bg-red-100 text-red-600',
    description: 'Sıcaklık dağılımı ve jeotermal veriler',
  },
  {
    id: 'artifactDetection',
    name: 'Artefakt Tespiti',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-600',
    description: 'Sikke, heykel, mücevher ve eserler',
  },
  {
    id: 'mapVisualization',
    name: 'Harita Görseli',
    icon: BarChart3,
    color: 'bg-teal-100 text-teal-600',
    description: '2D anomali haritası ve ısı görseli',
  },
];
