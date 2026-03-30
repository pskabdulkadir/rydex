import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchResult {
  success: boolean;
  query: any;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: any[];
  filters?: {
    types: string[];
    statuses: string[];
  };
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
    sort: searchParams.get("sort") || "created_at:desc",
    limit: parseInt(searchParams.get("limit") || "20"),
    page: parseInt(searchParams.get("page") || "1"),
  });

  // Arama gerçekleştir
  useEffect(() => {
    if (!query && !filters.type) return;

    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    params.append("sort", filters.sort);
    params.append("limit", String(filters.limit));
    params.append("page", String(filters.page));

    fetch(`/api/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        // URL'yi güncelle
        setSearchParams(params.toString());
      })
      .catch((error) => {
        console.error("Arama hatası:", error);
        setResults(null);
      })
      .finally(() => setLoading(false));
  }, [query, filters, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getResultIcon = (item: any) => {
    if (item._type === "payment" || item.amount !== undefined) return "💳";
    if (item._type === "subscription" || item.plan) return "📅";
    if (item._type === "scan" || item.address) return "🔍";
    if (item.email) return "👤";
    return "📦";
  };

  const getResultCategory = (item: any) => {
    if (item._type === "payment" || item.amount !== undefined) return "Ödeme";
    if (item._type === "subscription" || item.plan) return "Abonelik";
    if (item._type === "scan" || item.address) return "Tarama";
    if (item.email) return "Kullanıcı";
    return "Diğer";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      expired: "bg-orange-100 text-orange-800",
      synced: "bg-emerald-100 text-emerald-800",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageLayout title="Arama Sonuçları">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Arama</h1>
          <p className="text-slate-600">
            Tüm verilerinizde arama yapın, filtreleyin ve sıralayın
          </p>
        </div>

        {/* Arama Formu */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Arama Kriterleri</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="İsim, email, ID vb. ara..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Ara</Button>
              </div>

              {/* Filtreler */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Tür
                  </label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      updateFilters({ type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tümü</SelectItem>
                      <SelectItem value="users">Kullanıcılar</SelectItem>
                      <SelectItem value="payments">Ödemeler</SelectItem>
                      <SelectItem value="subscriptions">Abonelikler</SelectItem>
                      <SelectItem value="scans">Taramalar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Durum
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      updateFilters({ status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tümü</SelectItem>
                      {results?.filters?.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "active" && "Aktif"}
                          {status === "pending" && "Bekliyorum"}
                          {status === "completed" && "Tamamlandı"}
                          {status === "failed" && "Başarısız"}
                          {status === "cancelled" && "İptal Edildi"}
                          {status === "expired" && "Süresi Doldu"}
                          {status === "synced" && "Senkronize"}
                          {status === "inactive" && "İnaktif"}
                          {status === "suspended" && "Askıya Alındı"}
                          {!["active", "pending", "completed", "failed", "cancelled", "expired", "synced", "inactive", "suspended"].includes(status) && status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Sıralama
                  </label>
                  <Select
                    value={filters.sort}
                    onValueChange={(value) =>
                      updateFilters({ sort: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at:desc">En Yeni</SelectItem>
                      <SelectItem value="created_at:asc">En Eski</SelectItem>
                      <SelectItem value="id:asc">A-Z</SelectItem>
                      <SelectItem value="id:desc">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Sayfa Boyutu
                  </label>
                  <Select
                    value={String(filters.limit)}
                    onValueChange={(value) =>
                      updateFilters({ limit: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 sonuç</SelectItem>
                      <SelectItem value="20">20 sonuç</SelectItem>
                      <SelectItem value="50">50 sonuç</SelectItem>
                      <SelectItem value="100">100 sonuç</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sonuçlar */}
        <div>
          {loading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && results && results.data.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Arama kriterlerinize uygun sonuç bulunamadı.</p>
              </CardContent>
            </Card>
          )}

          {!loading && results && results.data.length > 0 && (
            <div>
              {/* Sonuç Bilgisi */}
              <div className="mb-4 text-sm text-slate-600">
                <strong>{results.total}</strong> sonuçdan{" "}
                <strong>
                  {(results.page - 1) * results.limit + 1}-
                  {Math.min(results.page * results.limit, results.total)}
                </strong>{" "}
                gösteriliyor
              </div>

              {/* Sonuç Kartları */}
              <div className="space-y-4 mb-8">
                {results.data.map((item, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{getResultIcon(item)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">
                                {item.email || item.title || item.id || "N/A"}
                              </h3>
                              <p className="text-sm text-slate-600 text-slate-600 mt-1">
                                {item.displayName ||
                                  item.address ||
                                  item.plan ||
                                  item.description ||
                                  ""}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {getResultCategory(item)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            {item.status && (
                              <Badge
                                className={cn(
                                  "font-medium",
                                  getStatusColor(item.status)
                                )}
                              >
                                {item.status}
                              </Badge>
                            )}
                            {item.amount && (
                              <span className="text-sm text-slate-600">
                                💰 {item.amount.toFixed(2)}₺
                              </span>
                            )}
                            {item.plan && (
                              <span className="text-sm text-slate-600">
                                📅 Plan: {item.plan}
                              </span>
                            )}
                            {(item.createdAt || item.created_at) && (
                              <span className="text-xs text-slate-500">
                                {formatDate(item.createdAt || item.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sayfalama */}
              {results.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Sayfa {results.page} / {results.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={results.page === 1}
                      onClick={() =>
                        handlePageChange(Math.max(1, results.page - 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      disabled={results.page >= results.totalPages}
                      onClick={() =>
                        handlePageChange(
                          Math.min(results.totalPages, results.page + 1)
                        )
                      }
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
