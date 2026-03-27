import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ReconciliationStats {
  totalPayments: number;
  reconciledPayments: number;
  unreconciledPayments: number;
  totalAmount: number;
  reconciledAmount: number;
  unreconciledAmount: number;
  reconciliationRate: number;
  totalReports: number;
  latestReport: any;
  totalDiscrepancies: number;
  unresolvedDiscrepancies: number;
  highSeverityDiscrepancies: number;
  totalAffectedAmount: number;
}

interface Discrepancy {
  id: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  affectedAmount?: number;
  resolved: boolean;
}

export default function PaymentReconciliation() {
  const [stats, setStats] = useState<ReconciliationStats | null>(null);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  // İstatistikleri yükle
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reconciliation/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        toast.error(data.error || "İstatistikler yüklenemedi");
      }
    } catch (error) {
      toast.error("İstatistikler yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Çözümlenmemiş tutarsızlıkları yükle
  const loadDiscrepancies = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reconciliation/unresolved");
      const data = await response.json();

      if (data.success) {
        setDiscrepancies(data.discrepancies);
      } else {
        toast.error(data.error || "Tutarsızlıklar yüklenemedi");
      }
    } catch (error) {
      toast.error("Tutarsızlıklar yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri al
  useEffect(() => {
    loadStats();
    loadDiscrepancies();
  }, []);

  // Uzlaştırmayı başlat
  const handleStartReconciliation = async () => {
    if (!confirm("Uzlaştırma işlemini başlatmak istediğinize emin misiniz?")) {
      return;
    }

    setReconciling(true);
    try {
      const response = await fetch("/api/admin/reconciliation/start", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Uzlaştırma başarıyla tamamlandı!");
        await loadStats();
        await loadDiscrepancies();
      } else {
        toast.error(data.error || "Uzlaştırma başlatılamadı");
      }
    } catch (error) {
      toast.error("Uzlaştırma sırasında hata oluştu");
      console.error(error);
    } finally {
      setReconciling(false);
    }
  };

  // Tutarsızlığı çöz
  const handleResolveDiscrepancy = async (
    discrepancyId: string,
    action: "ignore" | "refund" | "collect" | "correct"
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reconciliation/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discrepancyId,
          resolution: `${action} uygulandı`,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tutarsızlık çözüldü!");
        await loadDiscrepancies();
      } else {
        toast.error(data.error || "Tutarsızlık çözülemedi");
      }
    } catch (error) {
      toast.error("Tutarsızlık çözülürken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge className="bg-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Ciddi
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            Orta
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
            Düşük
          </Badge>
        );
      default:
        return <Badge>Bilinmiyor</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Ödeme Uzlaştırması</h1>
            <p className="text-slate-600">Ödemeler ve gateway işlemleri arasındaki tutarsızlıkları kontrol edin</p>
          </div>
          <Button
            onClick={handleStartReconciliation}
            disabled={reconciling}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {reconciling ? "Uzlaştırılıyor..." : "Uzlaştırmayı Başlat"}
          </Button>
        </div>

        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.totalPayments}</div>
                  <div className="text-sm text-slate-600">Toplam Ödeme</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.reconciledPayments}</div>
                  <div className="text-sm text-slate-600">Uzlaştırıldı</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.unreconciledPayments}</div>
                  <div className="text-sm text-slate-600">Uzlaştırılmadı</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.reconciliationRate.toFixed(1)}%</div>
                  <div className="text-sm text-slate-600">Oranı</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">₺{stats.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-slate-600">Toplam Tutar</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">₺{stats.reconciledAmount.toFixed(2)}</div>
                  <div className="text-sm text-slate-600">Uzlaştırıldı</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">₺{stats.unreconciledAmount.toFixed(2)}</div>
                  <div className="text-sm text-slate-600">Tutarsız</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.unresolvedDiscrepancies}</div>
                  <div className="text-sm text-slate-600">Çözümlenmemiş</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tutarsızlıklar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Tutarsızlıklar
            </CardTitle>
            <CardDescription>
              {stats?.totalDiscrepancies || 0} tutarsızlık bulundu, {stats?.unresolvedDiscrepancies || 0} çözümlenmedi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {discrepancies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-slate-600">Tüm ödemeler uzlaştırılmıştır!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discrepancies.slice(0, 10).map((discrepancy) => (
                  <Card key={discrepancy.id} className={`border-2 ${getSeverityColor(discrepancy.severity)}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{discrepancy.id}</h3>
                            {getSeverityBadge(discrepancy.severity)}
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{discrepancy.description}</p>
                          {discrepancy.affectedAmount && (
                            <p className="text-sm font-semibold text-slate-900">
                              Etkilenen Tutar: ₺{discrepancy.affectedAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleResolveDiscrepancy(discrepancy.id, "ignore")}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          Görmezden Gel
                        </Button>
                        <Button
                          onClick={() => handleResolveDiscrepancy(discrepancy.id, "refund")}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          İade Et
                        </Button>
                        <Button
                          onClick={() => handleResolveDiscrepancy(discrepancy.id, "collect")}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                        >
                          Tahsil Et
                        </Button>
                        <Button
                          onClick={() => handleResolveDiscrepancy(discrepancy.id, "correct")}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          Düzelt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {discrepancies.length > 10 && (
                  <p className="text-sm text-slate-600 text-center mt-4">
                    +{discrepancies.length - 10} tutarsızlık daha
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bilgi Kartı */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Ödeme Uzlaştırması Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-3">
            <p>
              <strong>Uzlaştırma:</strong> Sistem ödemelerinizi ödeme gateway'inin kayıtları ile karşılaştırır.
            </p>
            <p>
              <strong>Tutarsızlıklar:</strong> Veritabanında olup gateway'de olmayan veya tersi durumlardır.
            </p>
            <p>
              <strong>Çözüm Yöntemleri:</strong> Görmezden Gelme, İade, Tahsil veya Düzeltme yapabilirsiniz.
            </p>
            <p className="font-semibold">
              Düzenli olarak uzlaştırma yaparak finansal uyumsuzlukları en aza indirin.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
