/**
 * Gerçek Veri Tarayıcı Komponenti
 * Tarama öncesi: Başlat butonu
 * Tarama sırası: İlerleme göstergesi
 * Tarama sonrası: Tüm gerçek veriler
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, AlertTriangle, CheckCircle2, Loader2, Zap, Mountain, Landmark } from "lucide-react";
import { realDataFetcher } from "@/services/real-data-fetcher";
import { locationService, LocationCoordinates } from "@/services/location-service";
import { scanStateManager, ScanStatus } from "@/services/scan-state-manager";
import { RealDataResponse } from "@shared/real-data-service";

export const RealDataScanner: React.FC = () => {
  const [currentSession, setCurrentSession] = useState(scanStateManager.getCurrentSession());
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tarama durumu değişikliklerini dinle
  useEffect(() => {
    const unsubscribe = scanStateManager.subscribe((session) => {
      setCurrentSession(session);
    });

    return unsubscribe;
  }, []);

  /**
   * Konum al ve tarama başlat
   */
  const handleStartScan = async () => {
    setError(null);
    setLoadingLocation(true);

    try {
      // GPS izni iste
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        throw new Error("GPS izni reddedildi");
      }

      // Mevcut konumu al
      const currentLocation = await locationService.getCurrentPosition();
      setLocation(currentLocation);

      // Taramayı başlat
      const session = scanStateManager.startScan(currentLocation);

      // Simüle edilen ilerleme (gerçek API çağrıları için ayarlanmalı)
      const progressInterval = setInterval(() => {
        scanStateManager.updateProgress((prev) => {
          const current = scanStateManager.getCurrentSession()?.progress || 0;
          const newProgress = current + Math.random() * 20;
          return Math.min(newProgress, 90);
        });
      }, 500);

      // Gerçek verileri çek
      try {
        const realData = await realDataFetcher.fetchAllRealData({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          radius: 50, // 50km radius
        });

        clearInterval(progressInterval);
        scanStateManager.completeScan(realData);
      } catch (apiError) {
        clearInterval(progressInterval);
        scanStateManager.failScan(
          apiError instanceof Error ? apiError.message : "Veri çekme hatası"
        );
        setError("Gerçek veriler çekilemedi, İnternet bağlantısını kontrol edin.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Konum alınamadı");
      scanStateManager.cancelScan();
    } finally {
      setLoadingLocation(false);
    }
  };

  /**
   * Taramayı iptal et
   */
  const handleCancelScan = () => {
    scanStateManager.cancelScan();
    setError(null);
  };

  /**
   * Yeni tarama yap
   */
  const handleNewScan = () => {
    scanStateManager.cancelScan();
    setError(null);
  };

  // Tarama öncesi - başlat butonu göster
  if (!currentSession) {
    return (
      <Card className="w-full border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ger çek Veri Taraması
          </CardTitle>
          <CardDescription>
            Tarama yapılmadan HİÇ BİR veri gösterilmez. Başlamak için konumunuzu al.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleStartScan}
            disabled={loadingLocation}
            size="lg"
            className="w-full"
          >
            {loadingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Konum Alınıyor...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Taramayı Başlat
              </>
            )}
          </Button>

          <p className="text-xs text-gray-600">
            GPS'in açık olduğundan emin olun. Bağlantı hızına göre tarama 10-30 saniye sürebilir.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Tarama sırası veya işleme - ilerleme göster
  if (currentSession.status === "scanning" || currentSession.status === "processing") {
    return (
      <Card className="w-full border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {currentSession.status === "scanning" ? "Taranıyor..." : "Veriler İşleniyor..."}
          </CardTitle>
          <CardDescription>
            Lütfen bekleyin. {location && (
              <>
                Konum: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} (
                {location.accuracy.toFixed(0)}m doğruluk)
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={currentSession.progress} className="h-2" />
          <p className="text-center text-sm font-medium">{currentSession.progress.toFixed(0)}%</p>

          <Button
            onClick={handleCancelScan}
            variant="outline"
            className="w-full"
          >
            İptal Et
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Hata durumu
  if (currentSession.status === "failed") {
    return (
      <Card className="w-full border-red-500 bg-gradient-to-br from-red-50 to-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Tarama Başarısız
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{currentSession.error || "Bilinmeyen hata"}</AlertDescription>
          </Alert>

          <Button onClick={handleNewScan} size="lg" className="w-full">
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Tarama tamamlandı - Gerçek veriler göster
  if (currentSession.status === "completed" && currentSession.realData) {
    const data = currentSession.realData;

    return (
      <div className="w-full space-y-4">
        {/* Başarı Mesajı */}
        <Card className="border-green-500 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Tarama Tamamlandı!
            </CardTitle>
            <CardDescription>
              {currentSession.duration && (
                <>
                  Tarama süresi: {(currentSession.duration / 1000).toFixed(1)}s | Kaynak başarı oranı:{" "}
                  {data.metadata.successRate.toFixed(0)}%
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNewScan} variant="outline" className="w-full">
              Yeni Tarama Yap
            </Button>
          </CardContent>
        </Card>

        {/* Ger çek Veri Sekmeler */}
        <Tabs defaultValue="magnetic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {data.magneticData && <TabsTrigger value="magnetic">Manyetik</TabsTrigger>}
            {data.geologyData && <TabsTrigger value="geology">Jeoloji</TabsTrigger>}
            {data.archaeologyData && <TabsTrigger value="archaeology">Arkeoloji</TabsTrigger>}
            {data.terrainData && <TabsTrigger value="terrain">Topografya</TabsTrigger>}
          </TabsList>

          {/* Manyetik Veri */}
          {data.magneticData && (
            <TabsContent value="magnetic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    NOAA Manyetik Alan Verileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-700">Toplam İntensite</p>
                        <p className="text-xl font-bold">{data.magneticData.totalIntensity.toFixed(0)} nT</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Deklinasyon</p>
                        <p className="text-xl font-bold">{data.magneticData.declination.toFixed(2)}°</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">İnklinasyon</p>
                        <p className="text-xl font-bold">{data.magneticData.inclination.toFixed(2)}°</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Yatay İntensite</p>
                        <p className="text-xl font-bold">
                          {data.magneticData.horizontalIntensity.toFixed(0)} nT
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Jeoloji Veri */}
          {data.geologyData && (
            <TabsContent value="geology">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="h-5 w-5" />
                    USGS Jeoloji Verileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.geologyData.deposits && data.geologyData.deposits.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-2">Maden Yatakları ({data.geologyData.deposits.length})</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {data.geologyData.deposits.map((deposit, idx) => (
                            <div key={idx} className="border rounded p-2 bg-gray-50">
                              <p className="font-medium">{deposit.name}</p>
                              <p className="text-sm text-gray-600">{deposit.type}</p>
                              {deposit.commodity && (
                                <p className="text-sm text-gray-600">Emtia: {deposit.commodity}</p>
                              )}
                              {deposit.significance && (
                                <p className="text-sm text-gray-600">Önem: {deposit.significance}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Bu bölgede bilinen maden yatağı yok</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Arkeoloji Veri */}
          {data.archaeologyData && (
            <TabsContent value="archaeology">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5" />
                    Arkeolojik Siteler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.archaeologyData.unescoSites && data.archaeologyData.unescoSites.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          UNESCO Dünya Mirası Siteleri ({data.archaeologyData.unescoSites.length})
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {data.archaeologyData.unescoSites.map((site, idx) => (
                            <div key={idx} className="border rounded p-2 bg-green-50">
                              <p className="font-medium text-green-900">{site.name}</p>
                              <p className="text-sm text-gray-600">{site.country}</p>
                              <p className="text-sm text-gray-600">Kayıt yılı: {site.yearInscribed}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.archaeologyData.archaeologicalSites &&
                      data.archaeologyData.archaeologicalSites.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">
                            Arkeolojik Siteler ({data.archaeologyData.archaeologicalSites.length})
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {data.archaeologyData.archaeologicalSites.map((site, idx) => (
                              <div key={idx} className="border rounded p-2 bg-blue-50">
                                <p className="font-medium text-blue-900">{site.name}</p>
                                <p className="text-sm text-gray-600">Dönem: {site.period}</p>
                                <p className="text-sm text-gray-600">{site.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {(!data.archaeologyData.unescoSites ||
                      data.archaeologyData.unescoSites.length === 0) &&
                      (!data.archaeologyData.archaeologicalSites ||
                        data.archaeologyData.archaeologicalSites.length === 0) && (
                        <p className="text-sm text-gray-600">Bu bölgede bilinen arkeolojik site yok</p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Topografya Veri */}
          {data.terrainData && (
            <TabsContent value="terrain">
              <Card>
                <CardHeader>
                  <CardTitle>Topografik Veriler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {data.terrainData.elevation && (
                      <div className="border rounded p-3">
                        <p className="font-medium text-gray-700">Yükseklik</p>
                        <p className="text-xl font-bold">{data.terrainData.elevation.elevation.toFixed(0)} m</p>
                      </div>
                    )}
                    {data.terrainData.slope !== undefined && (
                      <div className="border rounded p-3">
                        <p className="font-medium text-gray-700">Eğim</p>
                        <p className="text-xl font-bold">{data.terrainData.slope.toFixed(1)}°</p>
                      </div>
                    )}
                    {data.terrainData.landform && (
                      <div className="border rounded p-3">
                        <p className="font-medium text-gray-700">Arazi Şekli</p>
                        <p className="text-lg font-semibold">{data.terrainData.landform}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  }

  return null;
};
