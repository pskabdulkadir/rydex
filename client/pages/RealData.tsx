/**
 * Gerçek Veri Taraması Sayfası
 * NOAA, USGS, UNESCO API'lerinden verileri çekip gösterir
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { RealDataScanner } from "@/components/RealDataScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

export default function RealDataPage() {
  const navigate = useNavigate();
  const offlineStorage = useOfflineStorage();

  useEffect(() => {
    // Offline depolama hazırlanana kadar bekle
    if (!offlineStorage.isReady) {
      console.log("Offline depolama hazırlanıyor...");
    }
  }, [offlineStorage.isReady]);

  return (
    <PageLayout title="Gerçek Veri Taraması">
      <div className="space-y-6">
        {/* Açıklama Paneli */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Gerçek Veri Sistemi Hakkında
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Bu sistem, gerçek dünya veri kaynaklarından bilgi çeker ve konumunuza ait verileri gösterir:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>NOAA:</strong> Dünya çapında manyetik alan ölçümleri
              </li>
              <li>
                <strong>USGS:</strong> Maden yatakları, jeoloji ve sismik veriler
              </li>
              <li>
                <strong>UNESCO:</strong> Dünya mirası siteleri ve arkeolojik veriler
              </li>
              <li>
                <strong>Open Elevation:</strong> Topografik ve yükseklik verileri
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Ana Tarayıcı Komponenti */}
        <RealDataScanner />

        {/* Depolama ve Cache Bilgileri */}
        {offlineStorage.isReady && (
          <Tabs defaultValue="storage" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="storage">Depolama İstatistikleri</TabsTrigger>
              <TabsTrigger value="history">Tarama Geçmişi</TabsTrigger>
            </TabsList>

            <TabsContent value="storage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Cihazda Saklanan Veriler
                  </CardTitle>
                  <CardDescription>
                    Offline mod için cihaz belleğinde saklanan verilerin istatistikleri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">
                        {offlineStorage.stats.totalScans}
                      </p>
                      <p className="text-sm text-gray-600">Kaydedilen Tarama</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-green-600">
                        {(offlineStorage.stats.cacheSize / 1024).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Cache Boyutu (KB)</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-3xl font-bold text-yellow-600">
                        {offlineStorage.stats.offlineLogs}
                      </p>
                      <p className="text-sm text-gray-600">Offline Operasyonlar</p>
                    </div>
                  </div>

                  {offlineStorage.error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{offlineStorage.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={() => offlineStorage.refreshStats()}
                      variant="outline"
                      className="w-full"
                    >
                      İstatistikleri Yenile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tarama Geçmişi
                  </CardTitle>
                  <CardDescription>
                    Daha önce yapılmış taramaların listesi (çevrimdışı erişim için saklanır)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>Tarama geçmişi şu anda yapılandırılmıyor.</p>
                    <p className="mt-2">
                      Bir tarama tamamlandığında, otomatik olarak cihazda kaydedilecek ve burada
                      görünecektir.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Geri Dön
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
}
