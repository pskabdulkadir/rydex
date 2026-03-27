import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight } from 'lucide-react';
import { STRUCTURES, StructureType } from '@/lib/structures';
import { addComparison } from '@/lib/storage-manager';

interface StructureComparatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StructureComparator({ isOpen, onClose }: StructureComparatorProps) {
  const [structure1, setStructure1] = useState<StructureType | null>(null);
  const [structure2, setStructure2] = useState<StructureType | null>(null);

  const allStructures = Object.keys(STRUCTURES) as StructureType[];

  const handleCompare = () => {
    if (structure1 && structure2) {
      addComparison(structure1, structure2);
    }
  };

  const s1 = structure1 ? STRUCTURES[structure1] : null;
  const s2 = structure2 ? STRUCTURES[structure2] : null;

  const ComparisonRow = ({
    label,
    value1,
    value2,
  }: {
    label: string;
    value1: any;
    value2: any;
  }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-700 last:border-b-0">
      <div className="font-semibold text-slate-300 text-sm">{label}</div>
      <div className="text-white text-sm font-medium">{value1}</div>
      <div className="text-white text-sm font-medium">{value2}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#020617] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">🔍 Yapı Türü Karşılaştırması</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Yapı Seçimi */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sol Taraf */}
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-sm text-slate-400 uppercase font-bold mb-3">1. Yapıyı Seçin</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allStructures.map((type) => (
                  <button
                    key={type}
                    onClick={() => setStructure1(type)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                      structure1 === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="mr-2">{STRUCTURES[type].icon}</span>
                    {STRUCTURES[type].name}
                  </button>
                ))}
              </div>
            </Card>

            {/* Sağ Taraf */}
            <Card className="bg-slate-800 border-slate-700 p-4">
              <p className="text-sm text-slate-400 uppercase font-bold mb-3">2. Yapıyı Seçin</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allStructures.map((type) => (
                  <button
                    key={type}
                    onClick={() => setStructure2(type)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                      structure2 === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="mr-2">{STRUCTURES[type].icon}</span>
                    {STRUCTURES[type].name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Karşılaştırma Tablosu */}
          {s1 && s2 && (
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900 border-b border-slate-700 font-bold">
                <div>Özellik</div>
                <div className="flex items-center gap-2">
                  <span>{s1.icon}</span>
                  <span>{s1.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{s2.icon}</span>
                  <span>{s2.name}</span>
                </div>
              </div>

              <div className="p-4 space-y-0">
                <ComparisonRow label="Kategori" value1={s1.categoryName} value2={s2.categoryName} />
                <ComparisonRow label="Geometri" value1={s1.geometryType} value2={s2.geometryType} />
                <ComparisonRow label="Ortalama Boyut" value1={s1.averageSize} value2={s2.averageSize} />

                <ComparisonRow
                  label="Derinlik Min"
                  value1={`${s1.depthRangeMin}m`}
                  value2={`${s2.depthRangeMin}m`}
                />
                <ComparisonRow
                  label="Derinlik Max"
                  value1={`${s1.depthRangeMax}m`}
                  value2={`${s2.depthRangeMax}m`}
                />

                <ComparisonRow
                  label="Tipik Yoğunluk"
                  value1={
                    <div className="flex items-center gap-2">
                      <span>{s1.typicalDensity}%</span>
                      <div className="flex-1 bg-slate-700 rounded h-2">
                        <div
                          className="bg-amber-500 h-2 rounded"
                          style={{ width: `${s1.typicalDensity}%` }}
                        />
                      </div>
                    </div>
                  }
                  value2={
                    <div className="flex items-center gap-2">
                      <span>{s2.typicalDensity}%</span>
                      <div className="flex-1 bg-slate-700 rounded h-2">
                        <div
                          className="bg-amber-500 h-2 rounded"
                          style={{ width: `${s2.typicalDensity}%` }}
                        />
                      </div>
                    </div>
                  }
                />

                <ComparisonRow
                  label="Stabilite"
                  value1={
                    <div className="flex items-center gap-2">
                      <span>{s1.typicalStability}%</span>
                      <div className="flex-1 bg-slate-700 rounded h-2">
                        <div
                          className="bg-green-500 h-2 rounded"
                          style={{ width: `${s1.typicalStability}%` }}
                        />
                      </div>
                    </div>
                  }
                  value2={
                    <div className="flex items-center gap-2">
                      <span>{s2.typicalStability}%</span>
                      <div className="flex-1 bg-slate-700 rounded h-2">
                        <div
                          className="bg-green-500 h-2 rounded"
                          style={{ width: `${s2.typicalStability}%` }}
                        />
                      </div>
                    </div>
                  }
                />

                <ComparisonRow
                  label="Tespit Doğruluğu"
                  value1={`${s1.detectionAccuracy}%`}
                  value2={`${s2.detectionAccuracy}%`}
                />

                <ComparisonRow
                  label="Manyetik İmza"
                  value1={s1.magneticSignature}
                  value2={s2.magneticSignature}
                />

                <ComparisonRow
                  label="Güvenlik Riski"
                  value1={
                    <Badge className={`text-xs ${
                      s1.safetyRisk === 'low' ? 'bg-green-600' :
                      s1.safetyRisk === 'medium' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {s1.safetyRisk === 'low' ? 'Düşük' : s1.safetyRisk === 'medium' ? 'Orta' : 'Yüksek'}
                    </Badge>
                  }
                  value2={
                    <Badge className={`text-xs ${
                      s2.safetyRisk === 'low' ? 'bg-green-600' :
                      s2.safetyRisk === 'medium' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {s2.safetyRisk === 'low' ? 'Düşük' : s2.safetyRisk === 'medium' ? 'Orta' : 'Yüksek'}
                    </Badge>
                  }
                />

                <ComparisonRow
                  label="Kazı Zorluğu"
                  value1={
                    s1.excavationDifficulty === 'easy'
                      ? 'Kolay'
                      : s1.excavationDifficulty === 'moderate'
                        ? 'Orta'
                        : s1.excavationDifficulty === 'difficult'
                          ? 'Zor'
                          : 'Çok Zor'
                  }
                  value2={
                    s2.excavationDifficulty === 'easy'
                      ? 'Kolay'
                      : s2.excavationDifficulty === 'moderate'
                        ? 'Orta'
                        : s2.excavationDifficulty === 'difficult'
                          ? 'Zor'
                          : 'Çok Zor'
                  }
                />

                <ComparisonRow
                  label="Kültürel Değer"
                  value1={
                    s1.culturalValue === 'none'
                      ? 'Yok'
                      : s1.culturalValue === 'low'
                        ? 'Düşük'
                        : s1.culturalValue === 'medium'
                          ? 'Orta'
                          : s1.culturalValue === 'high'
                            ? 'Yüksek'
                            : 'Kritik'
                  }
                  value2={
                    s2.culturalValue === 'none'
                      ? 'Yok'
                      : s2.culturalValue === 'low'
                        ? 'Düşük'
                        : s2.culturalValue === 'medium'
                          ? 'Orta'
                          : s2.culturalValue === 'high'
                            ? 'Yüksek'
                            : 'Kritik'
                  }
                />

                {s1.historicalPeriod && s2.historicalPeriod && (
                  <ComparisonRow
                    label="Tarihsel Dönem"
                    value1={s1.historicalPeriod}
                    value2={s2.historicalPeriod}
                  />
                )}
              </div>
            </Card>
          )}

          {(!s1 || !s2) && (
            <Card className="bg-slate-900/30 border-slate-700 p-6 text-center">
              <p className="text-slate-400">Karşılaştırma yapmak için her iki yapı türünü seçin</p>
            </Card>
          )}

          {/* İşlem Butonları */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-slate-300 hover:text-white"
            >
              Kapat
            </Button>
            {s1 && s2 && (
              <Button
                onClick={() => {
                  handleCompare();
                  alert('Karşılaştırma kaydedildi!');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                Karşılaştırmayı Kaydet
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
