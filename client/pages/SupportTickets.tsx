import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Plus, Send } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  messages?: any[];
  assignedTo?: string;
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting_customer: number;
  resolved: number;
}

export default function SupportTickets() {
  const userId = localStorage.getItem("userId") || "demo-user";
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  const [messageInput, setMessageInput] = useState("");

  // Biletleri yükle
  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/support/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets);
        setStats(data.stats);
      } else {
        toast.error(data.error || "Biletler yüklenemedi");
      }
    } catch (error) {
      toast.error("Biletler yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri al
  useEffect(() => {
    loadTickets();
  }, []);

  // Yeni bilet oluştur
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Başlık ve açıklama gerekli");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/support/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Destek bilet başarıyla oluşturuldu!");
        setFormData({
          title: "",
          description: "",
          category: "general",
          priority: "medium",
        });
        setShowNewTicket(false);
        await loadTickets();
      } else {
        toast.error(data.error || "Bilet oluşturulamadı");
      }
    } catch (error) {
      toast.error("Bilet oluşturulurken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Bilete mesaj ekle
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTicket || !messageInput.trim()) {
      toast.error("Bilet seçin ve mesaj girin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/support/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          userId,
          content: messageInput,
          role: "customer",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mesaj başarıyla gönderildi!");
        setMessageInput("");
        setSelectedTicket(data.ticket);
        await loadTickets();
      } else {
        toast.error(data.error || "Mesaj gönderilemedi");
      }
    } catch (error) {
      toast.error("Mesaj gönderilirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <Badge className="bg-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Acil
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">
            Yüksek
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
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
            Düşük
          </Badge>
        );
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Açık
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Işleniyor
          </Badge>
        );
      case "waiting_customer":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">
            <Clock className="w-3 h-3 mr-1" />
            Müşteri Bekleniyor
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Çözüldü
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-slate-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Kapalı
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bug: "Hata Bildirimi",
      feature_request: "Özellik İsteği",
      billing: "Faturalandırma",
      general: "Genel Soru",
      other: "Diğer",
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Destek Biletleri</h1>
            <p className="text-slate-600">Destek taleplerini oluşturun ve takip edin</p>
          </div>
          <Button onClick={() => setShowNewTicket(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Bilet Oluştur
          </Button>
        </div>

        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                  <div className="text-sm text-slate-600">Toplam Bilet</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                  <div className="text-sm text-slate-600">Açık</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
                  <div className="text-sm text-slate-600">İşleniyor</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.waiting_customer}</div>
                  <div className="text-sm text-slate-600">Müşteri Bekleniyor</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                  <div className="text-sm text-slate-600">Çözüldü</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Yeni Bilet Modal */}
        {showNewTicket && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Yeni Destek Bilet Oluştur</CardTitle>
              <CardDescription>Destek talebinizi ayrıntılı olarak açıklayın</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    placeholder="Konu başlığını girin"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıklama *</Label>
                  <Textarea
                    id="description"
                    placeholder="Sorununuzu ayrıntılı olarak açıklayın"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="bug">Hata Bildirimi</option>
                      <option value="feature_request">Özellik İsteği</option>
                      <option value="billing">Faturalandırma</option>
                      <option value="general">Genel Soru</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Öncelik</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="critical">Acil</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Oluşturuluyor..." : "Bilet Oluştur"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowNewTicket(false)}
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

        {/* Biletler ve Mesajlar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bilet Listesi */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Biletlerim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <p className="text-sm text-slate-600 text-center py-4">Bilet yok</p>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTicket?.id === ticket.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-slate-900 truncate flex-1">
                          {ticket.title}
                        </h4>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{ticket.id}</p>
                      <div className="flex items-center justify-between gap-2">
                        {getStatusBadge(ticket.status)}
                        <span className="text-xs text-slate-500">
                          {ticket.messages?.length || 0} msg
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bilet Detayları */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{selectedTicket.title}</CardTitle>
                      <CardDescription>{selectedTicket.id}</CardDescription>
                    </div>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {getPriorityBadge(selectedTicket.priority)}
                    <Badge variant="outline">{getCategoryLabel(selectedTicket.category)}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Bilet Bilgileri */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-slate-600">Oluşturulma</p>
                      <p className="text-sm font-semibold">{formatDate(selectedTicket.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Son Güncelleme</p>
                      <p className="text-sm font-semibold">{formatDate(selectedTicket.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Mesajlar */}
                  <div className="space-y-3 h-[300px] overflow-y-auto mb-4">
                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                      selectedTicket.messages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.sender.role === "customer"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-green-50 border border-green-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {msg.sender.role === "customer" ? "Siz" : "Destek Ekibi"}
                            </p>
                            <p className="text-xs text-slate-600">
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-slate-700">{msg.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600 text-center py-4">Mesaj yok</p>
                    )}
                  </div>

                  {/* Mesaj Gönderme */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Yanıt yazın..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !messageInput.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[500px]">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Bilet seçin</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bilgi Kartı */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Destek Süreci Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-3">
            <p>
              <strong>1. Bilet Oluşturma:</strong> Yukarıdaki form ile destek talebinizi oluşturun.
            </p>
            <p>
              <strong>2. Bilet Seçme:</strong> Biletinizi soldan seçerek detaylarını görebilirsiniz.
            </p>
            <p>
              <strong>3. Mesaj Gönderme:</strong> Destek ekibine mesaj göndererek iletişim kurun.
            </p>
            <p className="font-semibold">Destek ekibimiz en kısa sürede size yanıt verecektir.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
