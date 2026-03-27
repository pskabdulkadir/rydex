import React, { useState, useEffect } from 'react';
import { STRUCTURES, StructureDefinition, getAllStructures } from '@/lib/structures';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity, Thermometer, Zap, Droplets, Radio, Magnet,
  Layers, Scan, Info, AlertTriangle, Search, Box, ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const Structure3DPreview = ({ geometryType, color }: { geometryType: string, color: string }) => {
  const getShape = () => {
    const type = geometryType.toLowerCase();
    if (type.includes('prizma') || type.includes('küboid') || type.includes('kasa') || type.includes('dikdörtgen')) {
      return (
        <div className="shape-cube">
          <div className="face front"></div>
          <div className="face back"></div>
          <div className="face right"></div>
          <div className="face left"></div>
          <div className="face top"></div>
          <div className="face bottom"></div>
        </div>
      );
    }
    if (type.includes('silindir') || type.includes('kule') || type.includes('dairesel')) {
      return (
        <div className="shape-cylinder">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="face" style={{ transform: `rotateY(${i * 20}deg) translateZ(49px)` }}></div>
          ))}
        </div>
      );
    }
    return <div className="text-muted-foreground">3D model for this geometry is not available.</div>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 bg-slate-100 dark:bg-slate-800 rounded-lg perspective-1000">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .shape-cube, .shape-cylinder {
          position: relative;
          width: 100px;
          height: 100px;
          transform-style: preserve-3d;
          animation: rotate-shape 20s infinite linear;
        }
        @keyframes rotate-shape {
          from { transform: rotateY(0deg) rotateX(10deg); }
          to { transform: rotateY(360deg) rotateX(10deg); }
        }
        .shape-cube .face {
          position: absolute;
          width: 100px; height: 100px;
          background: ${color || 'rgba(0, 120, 255, 0.5)'};
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .shape-cube .front  { transform: rotateY(  0deg) translateZ(50px); }
        .shape-cube .back   { transform: rotateY(180deg) translateZ(50px); }
        .shape-cube .right  { transform: rotateY( 90deg) translateZ(50px); }
        .shape-cube .left   { transform: rotateY(-90deg) translateZ(50px); }
        .shape-cube .top    { transform: rotateX( 90deg) translateZ(50px); }
        .shape-cube .bottom { transform: rotateX(-90deg) translateZ(50px); }
        .shape-cylinder .face {
          position: absolute; width: 30px; height: 100px;
          background: ${color || 'rgba(0, 120, 255, 0.5)'};
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
      `}</style>
      <div className="shape">{getShape()}</div>
    </div>
  );
};

const StructureScanner = () => {
  const [structures, setStructures] = useState<StructureDefinition[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<StructureDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    setStructures(getAllStructures());
  }, []);

  const filteredStructures = structures.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getThermalColor = (signature: string) => {
    switch (signature) {
      case 'cold': return 'text-blue-500';
      case 'hot': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
            className="rounded-full"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scan className="w-8 h-8 text-blue-600" />
            Yapı Tarayıcı
          </h1>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={activeCategory === 'all' ? 'default' : 'outline'} 
            onClick={() => setActiveCategory('all')}
            size="sm"
          >
            Tümü
          </Button>
          <Button 
            variant={activeCategory === 'metal' ? 'default' : 'outline'} 
            onClick={() => setActiveCategory('metal')}
            size="sm"
            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
          >
            Metal
          </Button>
          <Button 
            variant={activeCategory === 'void' ? 'default' : 'outline'} 
            onClick={() => setActiveCategory('void')}
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Boşluk
          </Button>
          <Button 
            variant={activeCategory === 'historical' ? 'default' : 'outline'} 
            onClick={() => setActiveCategory('historical')}
            size="sm"
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            Tarihsel
          </Button>
          <Button 
            variant={activeCategory === 'form' ? 'default' : 'outline'} 
            onClick={() => setActiveCategory('form')}
            size="sm"
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            Form
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Yapı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStructures.map((structure) => (
          <Card 
            key={structure.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow border-l-4"
            style={{ borderLeftColor: structure.spectralColor || '#ccc' }}
            onClick={() => setSelectedStructure(structure)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{structure.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{structure.name}</CardTitle>
                    <CardDescription className="text-xs">{structure.categoryName}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={structure.color}>
                  {structure.detectionAccuracy}% Doğruluk
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {structure.description}
              </p>
              <div className="flex gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {structure.depthRangeMin}-{structure.depthRangeMax}m
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {structure.typicalDensity}% Yoğunluk
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedStructure} onOpenChange={(open) => !open && setSelectedStructure(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedStructure && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedStructure.icon}</span>
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {selectedStructure.name}
                      <Badge className={selectedStructure.color} variant="secondary">
                        {selectedStructure.categoryName}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      {selectedStructure.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general">Genel</TabsTrigger>
                  <TabsTrigger value="magnetic">Manyetik</TabsTrigger>
                  <TabsTrigger value="analysis">Analiz</TabsTrigger>
                  <TabsTrigger value="safety">Güvenlik</TabsTrigger>
                  <TabsTrigger value="3d">3D Model</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Fiziksel Özellikler</CardTitle></CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Boyut:</span>
                          <span className="font-medium">{selectedStructure.averageSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Geometri:</span>
                          <span className="font-medium">{selectedStructure.geometryType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Derinlik:</span>
                          <span className="font-medium">{selectedStructure.depthRangeMin} - {selectedStructure.depthRangeMax}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Malzemeler:</span>
                          <span className="font-medium text-right">{selectedStructure.commonMaterials.join(', ')}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Karakteristikler</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {selectedStructure.characteristics && selectedStructure.characteristics.length > 0 ? (
                            selectedStructure.characteristics.map((char, i) => (
                              <li key={i}>{char}</li>
                            ))
                          ) : (
                            <li className="text-muted-foreground">Karakteristik bilgisi yok</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="magnetic" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Magnet className="w-4 h-4" /> Manyetik İmza
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-center font-mono text-lg">
                        {selectedStructure.magneticSignature}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Polarite</span>
                            <span className="font-medium capitalize">{selectedStructure.magneticPolarity}</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                            {selectedStructure.magneticPolarity === 'dipole' ? (
                              <>
                                <div className="w-1/2 bg-red-500"></div>
                                <div className="w-1/2 bg-blue-500"></div>
                              </>
                            ) : selectedStructure.magneticPolarity === 'monopole' ? (
                              <div className="w-full bg-red-500"></div>
                            ) : (
                              <div className="w-full bg-purple-500"></div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>İletkenlik</span>
                            <span className="font-medium">{selectedStructure.conductivity}%</span>
                          </div>
                          <Progress value={selectedStructure.conductivity} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Çevresel Analiz</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Thermometer className="w-4 h-4" /> Termal İmza
                          </div>
                          <Badge variant="outline" className={getThermalColor(selectedStructure.thermalSignature || 'neutral')}>
                            {(selectedStructure.thermalSignature || 'neutral').toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1"><Droplets className="w-3 h-3"/> Nem Tutma</span>
                            <span>{selectedStructure.moistureRetention}%</span>
                          </div>
                          <Progress value={selectedStructure.moistureRetention} className="h-1.5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1"><Radio className="w-3 h-3"/> GPR Yansıması</span>
                            <span>{selectedStructure.gprReflection}%</span>
                          </div>
                          <Progress value={selectedStructure.gprReflection} className="h-1.5" />
                        </div>

                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Rezonans:</span>
                          <span className="font-mono">{selectedStructure.resonanceFrequency} Hz</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Kimyasal & Spektral</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Oksitlenme Potansiyeli</span>
                          <Badge variant={selectedStructure.oxidationPotential === 'high' ? 'destructive' : 'secondary'}>
                            {selectedStructure.oxidationPotential?.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Spektral Renk</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border shadow-sm" 
                              style={{ backgroundColor: selectedStructure.spectralColor }}
                            />
                            <span className="text-xs font-mono">{selectedStructure.spectralColor}</span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <span className="text-xs text-muted-foreground block mb-1">Zemin Uyumluluğu</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedStructure.soilCompatibility && selectedStructure.soilCompatibility.length > 0 ? (
                              selectedStructure.soilCompatibility.map(soil => (
                                <Badge key={soil} variant="outline" className="text-xs">{soil}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Zemin bilgisi yok</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" /> Risk Analizi
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Güvenlik Riski</span>
                          <Badge className={getRiskColor(selectedStructure.safetyRisk)}>
                            {selectedStructure.safetyRisk.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Radyoaktivite</span>
                          <Badge variant={selectedStructure.radioactivityLevel === 'none' ? 'outline' : 'destructive'}>
                            {selectedStructure.radioactivityLevel?.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Kazı Bilgisi</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Zorluk Derecesi</span>
                          <span className="font-medium capitalize">{selectedStructure.excavationDifficulty.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Kültürel Değer</span>
                          <span className="font-medium capitalize text-amber-600">{selectedStructure.culturalValue}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="3d" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Box className="w-4 h-4" /> 3D Geometri Önizlemesi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Structure3DPreview geometryType={selectedStructure.geometryType} color={selectedStructure.spectralColor} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StructureScanner;
