import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface Refund {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  createdAt: number;
  updatedAt: number;
  refundedAt?: number;
  processedBy?: string;
  notes?: string;
}

interface RefundStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processed: number;
  totalAmount: number;
  refundedAmount?: number;
  totalRefunded?: number;
}

export default function RefundManagement() {
  const userId = localStorage.getItem("userId") || "demo-user";
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewRefund, setShowNewRefund] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    orderId: "",
    amount: "",
    reason: "",
  });

  // Kullanıcının iade taleplerini yükle
  const loadRefunds = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/refund/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        setRefunds(data.refunds);
        setStats(data.stats);
      } else {
        toast.error(data.error || "İade talepleri yüklenemedi");
      }
    } catch (error) {
      toast.error("İade talepleri yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri al
  useEffect(() => {
    loadRefunds();
  }, []);

  // Yeni iade talebi oluştur
  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId.trim() || !formData.amount.trim() || !formData.reason.trim()) {
      toast.error("Tüm alanları doldurün");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error("Tutar pozitif olmalıdır");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/refund/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: formData.orderId,
          userId,
          amount,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("İade talebi başarıyla oluşturuldu!");
        setFormData({ orderId: "", amount: "", reason: "" });
        setShowNewRefund(false);
        await loadRefunds();
      } else {
        toast.error(data.error || "İade talebi oluşturulamadı");
      }
    } catch (error) {
      toast.error("İade talebi oluşturulurken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Bekleniyor
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Onaylandı
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Reddedildi
          </Badge>
        );
      case "processed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            İade Edildi
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">İade Yönetimi</h1>
            <p className="text-slate-600">Ödeme iadesi taleplerini yönetin ve takip edin</p>
          </div>
          <Button onClick={() => setShowNewRefund(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni İade Talebi
          </Button>
        </div>

        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-sm text-slate-600">Toplam Talep</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-slate-600">Bekleniyor</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
                  <div className="text-sm text-slate-600">Onaylandı</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
                  <div className="text-sm text-slate-600">İade Edildi</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">₺{stats.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-slate-600">Toplam Tutar</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Yeni İade Talebi Modal */}
        {showNewRefund && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Yeni İade Talebi Oluştur</CardTitle>
              <CardDescription>Sipariş için iade talebi oluşturun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRefund} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="orderId">Sipariş ID *</Label>
                    <Input
                      id="orderId"
                      placeholder="ORD-2024-001"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Tutar (₺) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Sebep *</Label>
                    <select
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="">Seçin</option>
                      <option value="defective">Hatalı Ürün</option>
                      <option value="not_received">Ürün Alınmadı</option>
                      <option value="wrong_item">Yanlış Ürün</option>
                      <option value="not_satisfied">Memnun Değilim</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Oluşturuluyor..." : "Talebi Oluştur"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowNewRefund(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* İade Talepleri Listesi */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tümü ({refunds.length})</TabsTrigger>
            <TabsTrigger value="pending">Bekleniyor ({refunds.filter((r) => r.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="processed">İade Edildi ({refunds.filter((r) => r.status === "processed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {refunds.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  <p>Henüz iade talebi oluşturmadınız</p>
                </CardContent>
              </Card>
            ) : (
              refunds.map((refund) => (
                <Card key={refund.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{refund.id}</h3>
                          {getStatusBadge(refund.status)}
                        </div>
                        <p className="text-sm text-slate-600">Sipariş: {refund.orderId}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">₺{refund.amount.toFixed(2)}</div>
                        <div className="text-sm text-slate-600">{formatDate(refund.createdAt)}</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Sebep:</span> {refund.reason}
                      </p>
                      {refund.notes && (
                        <p className="text-sm text-slate-700 mt-2">
                          <span className="font-semibold">Not:</span> {refund.notes}
                        </p>
                      )}
                      {refund.refundedAt && (
                        <p className="text-sm text-slate-700 mt-2">
                          <span className="font-semibold">İade Tarihi:</span> {formatDate(refund.refundedAt)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {refunds.filter((r) => r.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  <p>Beklemede iade talebi yok</p>
                </CardContent>
              </Card>
            ) : (
              refunds
                .filter((r) => r.status === "pending")
                .map((refund) => (
                  <Card key={refund.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{refund.id}</h3>
                            {getStatusBadge(refund.status)}
                          </div>
                          <p className="text-sm text-slate-600">Sipariş: {refund.orderId}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">₺{refund.amount.toFixed(2)}</div>
                          <div className="text-sm text-slate-600">{formatDate(refund.createdAt)}</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Sebep:</span> {refund.reason}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            {refunds.filter((r) => r.status === "processed").length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-600">
                  <p>İade edilmiş talep yok</p>
                </CardContent>
              </Card>
            ) : (
              refunds
                .filter((r) => r.status === "processed")
                .map((refund) => (
                  <Card key={refund.id} className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{refund.id}</h3>
                            {getStatusBadge(refund.status)}
                          </div>
                          <p className="text-sm text-slate-600">Sipariş: {refund.orderId}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">✓ ₺{refund.amount.toFixed(2)}</div>
                          <div className="text-sm text-slate-600">{formatDate(refund.refundedAt || 0)}</div>
                        </div>
                      </div>

                      <div className="border-t border-green-200 pt-3">
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">Sebep:</span> {refund.reason}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>

        {/* Bilgi Kartı */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">İade Süreci Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-3">
            <p>
              <strong>1. Talep Oluşturma:</strong> Yukarıdaki form ile iade talebi oluşturun.
            </p>
            <p>
              <strong>2. İnceleme:</strong> Talebiniz yönetici tarafından incelenecektir (Bekleniyor).
            </p>
            <p>
              <strong>3. Onay:</strong> Talep onaylanırsa (Onaylandı), ödeme işlemi başlatılacaktır.
            </p>
            <p>
              <strong>4. İade:</strong> Tutar hesabınıza geri ödenecektir (İade Edildi).
            </p>
            <p className="font-semibold">İade işlemi genellikle 3-5 iş günü sürer.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
