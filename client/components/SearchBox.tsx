import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

interface SearchBoxProps {
  onSearch?: (results: any[]) => void;
  placeholder?: string;
  className?: string;
  types?: string[];
  defaultType?: string;
}

interface SearchFilters {
  q: string;
  type: string;
  status: string;
  sort: string;
  limit: number;
  page: number;
}

export default function SearchBox({
  onSearch,
  placeholder = "Ara...",
  className,
  types = ["users", "payments", "subscriptions", "scans"],
  defaultType = "",
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    q: "",
    type: defaultType,
    status: "",
    sort: "created_at:desc",
    limit: 20,
    page: 1,
  });
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  // Arama gerçekleştir
  const performSearch = useCallback(async () => {
    if (!filters.q && !filters.type) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append("q", filters.q);
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      params.append("sort", filters.sort);
      params.append("limit", String(filters.limit));
      params.append("page", String(filters.page));

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setAvailableStatuses(
          data.filters?.statuses || []
        );

        if (onSearch) {
          onSearch(data.data);
        }
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters, onSearch]);

  // Query değişince debounce ile arama yap
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== filters.q) {
        setFilters((prev) => ({ ...prev, q: query, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, filters.q]);

  // Filters değişince arama yap
  useEffect(() => {
    if (filters.q || filters.type) {
      performSearch();
    }
  }, [filters, performSearch]);

  const handleClear = () => {
    setQuery("");
    setFilters({
      q: "",
      type: defaultType,
      status: "",
      sort: "created_at:desc",
      limit: 20,
      page: 1,
    });
    setResults([]);
    setOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    setOpen(true); // Sonuçlar dialog açık kalır
  };

  const getResultIcon = (item: any) => {
    if (item._type === "payment") return "💳";
    if (item._type === "subscription") return "📅";
    if (item._type === "scan") return "🔍";
    if (item.email) return "👤";
    return "📦";
  };

  const getResultTitle = (item: any) => {
    return (
      item.email ||
      item.title ||
      item.id ||
      item.displayName ||
      "Sonuç"
    );
  };

  const getResultSubtitle = (item: any) => {
    if (item.email) return item.displayName;
    if (item.plan) return `Plan: ${item.plan}`;
    if (item.address) return item.address;
    if (item.amount) return `Tutar: ${item.amount}₺`;
    return item.description || "";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {types.length > 1 && (
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  type: value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tümü</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "users" && "Kullanıcılar"}
                    {type === "payments" && "Ödemeler"}
                    {type === "subscriptions" && "Abonelikler"}
                    {type === "scans" && "Taramalar"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Arama Sonuçları Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Arama Sonuçları
                {total > 0 && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({results.length} / {total})
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}

            {!loading && results.length === 0 && query && (
              <div className="text-center py-8">
                <p className="text-slate-500">Sonuç bulunamadı</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div>
                {/* Filtreler */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: value,
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tüm Durumlar</SelectItem>
                      {availableStatuses.map((status) => (
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

                  <Select
                    value={filters.sort}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        sort: value,
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at:desc">
                        En Yeni
                      </SelectItem>
                      <SelectItem value="created_at:asc">En Eski</SelectItem>
                      <SelectItem value="id:asc">A-Z</SelectItem>
                      <SelectItem value="id:desc">Z-A</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(filters.limit)}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        limit: parseInt(value),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Göster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 sonuç</SelectItem>
                      <SelectItem value="20">20 sonuç</SelectItem>
                      <SelectItem value="50">50 sonuç</SelectItem>
                      <SelectItem value="100">100 sonuç</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sonuç Listesi */}
                <div className="space-y-2">
                  {results.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getResultIcon(item)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {getResultTitle(item)}
                          </p>
                          {getResultSubtitle(item) && (
                            <p className="text-sm text-slate-500 truncate">
                              {getResultSubtitle(item)}
                            </p>
                          )}
                          {item.status && (
                            <p className="text-xs text-slate-400 mt-1">
                              Durum: <span className="font-medium">{item.status}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-slate-600">
                      Sayfa {filters.page} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page === 1}
                        onClick={() =>
                          handlePageChange(Math.max(1, filters.page - 1))
                        }
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page >= totalPages}
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, filters.page + 1)
                          )
                        }
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
