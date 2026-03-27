import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  AlertCircle,
  Zap,
  Layers,
  Radio,
  Shield,
  Gauge,
  Target,
  Info,
  Clock,
  Pickaxe,
  CheckCircle,
  ChevronRight,
  MapPin,
  TrendingUp,
  Eye,
  Lightbulb,
  Compass,
} from 'lucide-react';
import { StructureDefinition } from '@/lib/structures';
import { cn } from '@/lib/utils';

interface StructureDetailedModalProps {
  structure: StructureDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onStartScan?: (structureId: string) => void;
}

const RiskBadgeColor: Record<string, string> = {
  low: 'bg-green-600 text-white',
  medium: 'bg-yellow-600 text-white',
  high: 'bg-red-600 text-white',
};

const DifficultyBadgeColor: Record<string, string> = {
  easy: 'bg-blue-600 text-white',
  moderate: 'bg-indigo-600 text-white',
  difficult: 'bg-purple-600 text-white',
  very_difficult: 'bg-red-700 text-white',
};

const ValueBadgeColor: Record<string, string> = {
  none: 'bg-gray-600 text-white',
  low: 'bg-blue-600 text-white',
  medium: 'bg-cyan-600 text-white',
  high: 'bg-amber-600 text-white',
  critical: 'bg-red-600 text-white',
};

// Manyetik Alan Görselleştirmesi
function MagneticFieldVisualization({ signature }: { signature: string }) {
  // Manyetik sinyalden nT değerini çıkar
  const match = signature.match(/(\d+)/);
  const nanoTesla = match ? parseInt(match[0]) : 100;

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Manyetik Alan Yoğunluğu
        </h3>
        <div className="space-y-3">
          {/* Manyetik Seviye Görselleştirmesi */}
          <div className="relative h-32 bg-gradient-to-b from-blue-900 to-slate-900 rounded-lg border border-blue-700 overflow-hidden">
            {/* Dalgalı arka plan */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 120">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              <path
                fill="url(#waveGradient)"
                d={`M 0,${60 - (nanoTesla / 10)} Q 100,${50 - (nanoTesla / 15)} 200,${60 - (nanoTesla / 10)} T 400,${60 - (nanoTesla / 10)} L 400,120 L 0,120 Z`}
              />
            </svg>

            {/* İstatistik */}
            <div className="relative h-full flex items-center justify-center flex-col">
              <div className="text-4xl font-black text-blue-300">{nanoTesla}</div>
              <div className="text-sm text-blue-200">nanoTesla (nT)</div>
            </div>
          </div>

          {/* Sınıflandırma */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-3 rounded text-center ${nanoTesla < 50 ? 'bg-blue-600/30 border border-blue-400' : 'bg-slate-700'}`}>
              <p className="text-xs text-slate-300">Düşük</p>
              <p className="text-sm font-bold text-blue-200">&lt;50 nT</p>
            </div>
            <div className={`p-3 rounded text-center ${nanoTesla >= 50 && nanoTesla < 250 ? 'bg-yellow-600/30 border border-yellow-400' : 'bg-slate-700'}`}>
              <p className="text-xs text-slate-300">Orta</p>
              <p className="text-sm font-bold text-yellow-200">50-250 nT</p>
            </div>
            <div className={`p-3 rounded text-center ${nanoTesla >= 250 ? 'bg-red-600/30 border border-red-400' : 'bg-slate-700'}`}>
              <p className="text-xs text-slate-300">Yüksek</p>
              <p className="text-sm font-bold text-red-200">&gt;250 nT</p>
            </div>
          </div>

          {/* Detaylı Açıklama */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
            <p className="text-sm text-blue-200">{signature}</p>
          </div>
        </div>
      </Card>

      {/* Anomali Haritası */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-400" />
          Anomali Dağılım Haritası
        </h3>
        <div className="grid grid-cols-4 gap-1 h-24 bg-slate-900 p-3 rounded border border-slate-700">
          {Array.from({ length: 16 }).map((_, i) => {
            const intensity = Math.random() * 100;
            const shouldLight = intensity > 100 - (nanoTesla / 6);
            return (
              <div
                key={i}
                className={`rounded transition-all ${
                  shouldLight
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : 'bg-slate-700 opacity-50'
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          ⚠️ Kırmızı alanlar yüksek manyetik anomali göstermektedir
        </p>
      </Card>
    </div>
  );
}

// Güvenlik & Tavsiye Bölümü
function SafetySectionContent({ structure }: { structure: StructureDefinition }) {
  const riskLevel = structure.safetyRisk === 'low' ? 'Düşük' : structure.safetyRisk === 'medium' ? 'Orta' : 'Yüksek';

  const safetyTips = {
    low: [
      '✓ Standart güvenlik ekipmanı yeterli',
      '✓ Bireysel keşif yapılabilir',
      '✓ Çevre harita ve konum belirtimi',
      '✓ Acil durum iletişimi planla',
    ],
    medium: [
      '⚠️ En az 2 kişilik ekip önerilir',
      '⚠️ Koruma ekipmanı (kask, eldiven) gerekli',
      '⚠️ Yapı stabilitesi kontrol edilmeli',
      '⚠️ İyileştirme yolları araştırılmalı',
      '⚠️ Acil durum planı hazır olmalı',
    ],
    high: [
      '🚨 Minimum 3-4 kişilik uzman ekip',
      '🚨 Tam koruma ekipmanı zorunlu',
      '🚨 Yapı mühendislik analizi gerekli',
      '🚨 Havalandırma ve gaz kontrolü yapılmalı',
      '🚨 İtfaiye/İtfaiye hazır bulundurulmalı',
      '🚨 Devlet izni ve raporlaması gerekebilir',
    ],
  };

  const difficultyTips = {
    easy: 'Kazı genellikle 2-5 gün içinde tamamlanabilir',
    moderate: 'Kazı 1-2 hafta zaman alabilir',
    difficult: 'Kazı 2-4 hafta veya daha fazla sürebilir',
    very_difficult: 'Kazı 1-3 ay veya profesyonel ekip gerekebilir',
  };

  return (
    <div className="space-y-4">
      {/* Risk Assessment */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Güvenlik Riski Değerlendirmesi
        </h3>
        <Badge className={cn('px-4 py-2 text-lg', RiskBadgeColor[structure.safetyRisk])}>
          {riskLevel}
        </Badge>
      </Card>

      {/* Safety Tips */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Güvenlik Tavsiyeleri
        </h3>
        <ul className="space-y-2">
          {safetyTips[structure.safetyRisk].map((tip, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">{tip.slice(0, 2)}</span>
              <span>{tip.slice(3)}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Excavation Difficulty */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Pickaxe className="w-5 h-5 text-amber-400" />
          Kazı Zorluğu
        </h3>
        <Badge className={cn('px-4 py-2', DifficultyBadgeColor[structure.excavationDifficulty])}>
          {structure.excavationDifficulty === 'easy'
            ? 'Kolay'
            : structure.excavationDifficulty === 'moderate'
              ? 'Orta'
              : structure.excavationDifficulty === 'difficult'
                ? 'Zor'
                : 'Çok Zor'}
        </Badge>
        <p className="text-sm text-slate-300 mt-3">{difficultyTips[structure.excavationDifficulty]}</p>
      </Card>

      {/* Health Warnings */}
      <Card className="bg-red-900/20 border-red-700/50 p-4">
        <h3 className="font-bold text-red-200 mb-2 flex items-center gap-2">
          ⚠️ Sağlık Uyarıları
        </h3>
        <ul className="text-sm text-red-100 space-y-1">
          <li>• Tehlikeli gaz birikimi (CO₂, H₂S) olabilir</li>
          <li>• Yapı çöküş ve kaya düşme riski</li>
          <li>• Su basması ve sel riski</li>
          <li>• Kesici ve zehirli yüzeyler</li>
        </ul>
      </Card>
    </div>
  );
}

// Keşif Stratejisi
function DiscoveryStrategyContent({ structure }: { structure: StructureDefinition }) {
  const strategies = {
    'metal-box': {
      approach: 'Dar alan taraması',
      steps: [
        'Manyetik tarama cihazı ile ızgara deseni taraması',
        'En yüksek sinyal noktasında derinlik hesabı',
        'Yavaş kazı ile yakınlaşma',
        'Metal tespit ettikten sonra dikkatli açma',
      ],
      tools: ['Manyetik tarama cihazı', 'Metal dedektörü', 'Kapalı kutu kemancı', 'Fırça'],
    },
    'underground-room': {
      approach: 'Büyük alan taraması',
      steps: [
        'Geniş alan taraması ile anomali sınırı belirleme',
        'Derinlik profili oluşturma',
        'Taban seviyesi araştırması',
        'Giriş kapısı veya açılış yeri bulma',
      ],
      tools: ['Geniş alan tarama cihazı', 'Endoskop', 'Kapalı kutu kemancı'],
    },
    'tunnel-line': {
      approach: 'Doğrusal izleme',
      steps: [
        'Tünel hattının doğrusunu belirleme',
        'Giriş ve çıkış noktalarını araştırma',
        'Derinlik ve genişlik profilini çıkarma',
        'Tünel yapısının niteliğini analiz etme',
      ],
      tools: ['Doğrusal tarama cihazı', 'GPS konum belirleme', 'Kapalı kutu kemancı'],
    },
    default: {
      approach: 'Standart keşif protokolü',
      steps: [
        'Alanı 5x5m ızgara ile bölme',
        'Her bölümde sistematik tarama yapma',
        'Sinyal haritası oluşturma',
        'En güçlü noktada derinlik analizi',
        'Kademeli kazı ile yakınlaşma',
      ],
      tools: ['Tarama cihazları', 'Metal dedektörü', 'Kapalı kutu kemancı'],
    },
  };

  const strategy = strategies[structure.id as keyof typeof strategies] || strategies.default;

  return (
    <div className="space-y-4">
      {/* Yaklaşım */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          Keşif Yaklaşımı
        </h3>
        <p className="text-lg font-bold text-indigo-200">{strategy.approach}</p>
      </Card>

      {/* Adımlar */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Keşif Adımları
        </h3>
        <ol className="space-y-2">
          {strategy.steps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                {idx + 1}
              </span>
              <span className="text-sm text-slate-300 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Gerekli Araçlar */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-yellow-400" />
          Gerekli Araçlar
        </h3>
        <div className="flex flex-wrap gap-2">
          {strategy.tools.map((tool, idx) => (
            <Badge key={idx} className="bg-indigo-600/30 text-indigo-200 border-indigo-500/50">
              {tool}
            </Badge>
          ))}
        </div>
      </Card>

      {/* İpuçları */}
      <Card className="bg-blue-900/20 border-blue-700/50 p-4">
        <h3 className="font-bold text-blue-200 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Uzman İpuçları
        </h3>
        <ul className="space-y-2 text-sm text-blue-100">
          <li>• Hava durumunu kontrol edin - yağmur tarama cihazlarını etkileyebilir</li>
          <li>• Sabah erken saatlerde başlayın - daha iyi ışık ve az insan</li>
          <li>• GPS kayıtlarını tutun - bulundu her şeyin konumunu kaydedin</li>
          <li>• Arkeolog veya uzman danışmanlığı alın</li>
        </ul>
      </Card>
    </div>
  );
}

export default function StructureDetailedModal({
  structure,
  isOpen,
  onClose,
  onStartScan,
}: StructureDetailedModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'magnetic' | 'safety' | 'discovery'>('overview');

  if (!structure) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#020617] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-6xl">{structure.icon}</div>
            <div>
              <DialogTitle className="text-3xl font-black mb-2">
                {structure.name}
              </DialogTitle>
              <p className="text-slate-400 uppercase font-bold tracking-widest">
                {structure.categoryName}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Sekmeler */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            📋 Genel Bilgi
          </button>
          <button
            onClick={() => setActiveTab('magnetic')}
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-all ${
              activeTab === 'magnetic'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            ⚡ Manyetik Alan
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-all ${
              activeTab === 'safety'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🛡️ Güvenlik
          </button>
          <button
            onClick={() => setActiveTab('discovery')}
            className={`px-4 py-3 font-semibold whitespace-nowrap transition-all ${
              activeTab === 'discovery'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🎯 Stratejisi
          </button>
        </div>

        <div className="space-y-6">
          {/* Genel Bilgi Sekmesi */}
          {activeTab === 'overview' && (
            <>
              {/* Ana Açıklama */}
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <p className="text-slate-300 leading-relaxed">{structure.description}</p>
              </Card>

              {/* Temel Özellikler Özeti */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Geometry Type */}
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-slate-400 uppercase font-bold">Geometri</p>
                  </div>
                  <p className="font-bold text-white text-sm">{structure.geometryType}</p>
                </Card>

                {/* Average Size */}
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-slate-400 uppercase font-bold">Boyut</p>
                  </div>
                  <p className="font-bold text-white text-sm">{structure.averageSize}</p>
                </Card>

                {/* Detection Accuracy */}
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-slate-400 uppercase font-bold">Doğruluk</p>
                  </div>
                  <p className="font-bold text-white text-sm">{structure.detectionAccuracy}%</p>
                </Card>

                {/* Magnetic Signature */}
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-slate-400 uppercase font-bold">Manyetik</p>
                  </div>
                  <p className="font-bold text-white text-sm">{structure.magneticSignature}</p>
                </Card>
              </div>

              {/* Derinlik Bilgisi */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">Derinlik Aralığı</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-2">Minimum</p>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded p-3">
                      <p className="font-bold text-white text-lg">{structure.depthRangeMin}m</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-2">Maksimum</p>
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 rounded p-3">
                      <p className="font-bold text-white text-lg">{structure.depthRangeMax}m</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Yoğunluk & Stabilite */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white">Tipik Yoğunluk</h3>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300">{structure.typicalDensity}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${structure.typicalDensity}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Yapının yoğunluk seviyesi</p>
                </Card>

                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold text-white">Stabilite Katsayısı</h3>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300">{structure.typicalStability}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${structure.typicalStability}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Yapının dayanıklılığı</p>
                </Card>
              </div>

              {/* Malzeme Listesi */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white">Yaygın Malzemeler</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {structure.commonMaterials && structure.commonMaterials.length > 0 ? (
                    structure.commonMaterials.map((material, idx) => (
                      <Badge key={idx} className="bg-cyan-600/30 text-cyan-200 border-cyan-500/50">
                        {material}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">Malzeme bilgisi yok</p>
                  )}
                </div>
              </Card>

              {/* Özellikler */}
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">Tanımlayıcı Özellikler</h3>
                </div>
                <div className="space-y-2">
                  {structure.characteristics && structure.characteristics.length > 0 ? (
                    structure.characteristics.map((char, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                        <p className="text-slate-300">{char}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">Özellik bilgisi yok</p>
                  )}
                </div>
              </Card>

              {/* Risk & Difficulty */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-white text-sm">Güvenlik Riski</h3>
                  </div>
                  <Badge className={cn('w-full justify-center', RiskBadgeColor[structure.safetyRisk])}>
                    {structure.safetyRisk === 'low'
                      ? 'Düşük'
                      : structure.safetyRisk === 'medium'
                        ? 'Orta'
                        : 'Yüksek'}
                  </Badge>
                </Card>

                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Pickaxe className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">Kazı Zorluğu</h3>
                  </div>
                  <Badge className={cn('w-full justify-center', DifficultyBadgeColor[structure.excavationDifficulty])}>
                    {structure.excavationDifficulty === 'easy'
                      ? 'Kolay'
                      : structure.excavationDifficulty === 'moderate'
                        ? 'Orta'
                        : structure.excavationDifficulty === 'difficult'
                          ? 'Zor'
                          : 'Çok Zor'}
                  </Badge>
                </Card>

                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-sm">Kültürel Değer</h3>
                  </div>
                  <Badge className={cn('w-full justify-center', ValueBadgeColor[structure.culturalValue])}>
                    {structure.culturalValue === 'none'
                      ? 'Yok'
                      : structure.culturalValue === 'low'
                        ? 'Düşük'
                        : structure.culturalValue === 'medium'
                          ? 'Orta'
                          : structure.culturalValue === 'high'
                            ? 'Yüksek'
                            : 'Kritik'}
                  </Badge>
                </Card>
              </div>

              {/* Tarihsel Dönem */}
              {structure.historicalPeriod && (
                <Card className="bg-amber-900/20 border-amber-700/50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs text-amber-400 uppercase font-bold">Tarihsel Dönem</p>
                      <p className="font-bold text-amber-100">{structure.historicalPeriod}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* İstatistikler Özeti */}
              <Card className="bg-indigo-900/20 border-indigo-700/50 p-4">
                <h3 className="font-bold text-indigo-200 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Teknik İstatistikler
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-indigo-400 text-xs font-bold mb-1">Tespit Doğruluğu</p>
                    <p className="font-bold text-indigo-100">{structure.detectionAccuracy}%</p>
                  </div>
                  <div>
                    <p className="text-indigo-400 text-xs font-bold mb-1">Yoğunluk Seviyesi</p>
                    <p className="font-bold text-indigo-100">{structure.typicalDensity}%</p>
                  </div>
                  <div>
                    <p className="text-indigo-400 text-xs font-bold mb-1">Stabilite</p>
                    <p className="font-bold text-indigo-100">{structure.typicalStability}%</p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Manyetik Alan Sekmesi */}
          {activeTab === 'magnetic' && <MagneticFieldVisualization signature={structure.magneticSignature} />}

          {/* Güvenlik Sekmesi */}
          {activeTab === 'safety' && <SafetySectionContent structure={structure} />}

          {/* Keşif Stratejisi Sekmesi */}
          {activeTab === 'discovery' && <DiscoveryStrategyContent structure={structure} />}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/20 text-slate-300 hover:text-white"
          >
            Kapat
          </Button>
          {onStartScan && (
            <Button
              onClick={() => {
                onStartScan(structure.id);
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Taramayı Başlat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
