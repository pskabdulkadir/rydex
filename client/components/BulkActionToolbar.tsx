import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Edit,
  Tag,
  AlertCircle,
  Loader,
  Check,
  X,
} from "lucide-react";

interface BulkActionToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  type: string; // users, payments, subscriptions, scans
  onActionComplete?: () => void;
  onSelectionClear?: () => void;
}

interface BulkActionResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  message: string;
  errors?: Array<{ id: string; error: string }>;
}

export default function BulkActionToolbar({
  selectedCount,
  selectedIds,
  type,
  onActionComplete,
  onSelectionClear,
}: BulkActionToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkActionResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bulk/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ids: selectedIds }),
      });

      const data = await response.json();
      setResult(data);
      setShowResult(true);

      if (data.success) {
        toast.success(data.message);
        setShowDeleteConfirm(false);
        if (onActionComplete) onActionComplete();
        if (onSelectionClear) onSelectionClear();
      } else {
        toast.error("Silme işlemi başarısız");
      }
    } catch (error) {
      toast.error("Silme işlemi sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) {
      toast.error("Yeni durum seçin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bulk/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ids: selectedIds,
          status: newStatus,
        }),
      });

      const data = await response.json();
      setResult(data);
      setShowResult(true);

      if (data.success) {
        toast.success(data.message);
        setShowStatusChange(false);
        setNewStatus("");
        if (onActionComplete) onActionComplete();
        if (onSelectionClear) onSelectionClear();
      }
    } catch (error) {
      toast.error("Durum değiştirme işlemi sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTags = async () => {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tagList.length === 0) {
      toast.error("En az bir etiket girin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bulk/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ids: selectedIds,
          tags: tagList,
        }),
      });

      const data = await response.json();
      setResult(data);
      setShowResult(true);

      if (data.success) {
        toast.success(data.message);
        setShowTagDialog(false);
        setTags("");
        if (onActionComplete) onActionComplete();
        if (onSelectionClear) onSelectionClear();
      }
    } catch (error) {
      toast.error("Etiket ekleme işlemi sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStatuses = () => {
    const statusMap: Record<string, string[]> = {
      payments: ["pending", "completed", "failed", "refunded"],
      subscriptions: ["active", "expired", "cancelled"],
      scans: ["pending", "synced", "failed"],
      users: ["active", "inactive", "suspended"],
    };
    return statusMap[type] || [];
  };

  return (
    <>
      {/* Bulk Action Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Seçim Bilgisi */}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">
                  {selectedCount}
                </span>
                <span className="text-slate-600 ml-1">öğe seçildi</span>
              </div>

              {selectedCount > 100 && (
                <Badge variant="outline" className="bg-yellow-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Toplu işlemler 100+ öğe için yavaş olabilir
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {getAvailableStatuses().length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatusChange(true)}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Durum Değiştir
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagDialog(true)}
                disabled={loading}
              >
                <Tag className="h-4 w-4 mr-2" />
                Etiket Ekle
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectionClear}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Silmeyi Onayla</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              <strong>{selectedCount}</strong> öğeyi silmek istediğinizden emin
              misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                ⚠️ Bu işlem kalıcı ve geri alınamaz
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Durumu Değiştir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Yeni Durum
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatuses().map((status) => (
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
            <p className="text-sm text-slate-600">
              <strong>{selectedCount}</strong> öğenin durumu değiştirilecek
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button onClick={handleStatusChange} disabled={loading || !newStatus}>
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Değiştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Etiket Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Etiketler (virgülle ayırın)
              </label>
              <Input
                placeholder="örn: önemli, acil, takip-gerekli"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="text-sm text-slate-600">
              <strong>{selectedCount}</strong> öğeye etiket eklenecek
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTagDialog(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button onClick={handleAddTags} disabled={loading || !tags.trim()}>
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result?.success ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  İşlem Başarılı
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-600" />
                  İşlem Başarısız
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {result?.successful || 0}
                </div>
                <p className="text-xs text-slate-600">Başarılı</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result?.failed || 0}
                </div>
                <p className="text-xs text-slate-600">Başarısız</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {result?.totalProcessed || 0}
                </div>
                <p className="text-xs text-slate-600">Toplam</p>
              </div>
            </div>

            {result?.message && (
              <p className={cn(
                "p-3 rounded-lg",
                result.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              )}>
                {result.message}
              </p>
            )}

            {result?.errors && result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-red-700 mb-2">
                  Hatalar:
                </p>
                <ul className="space-y-1">
                  {result.errors.slice(0, 5).map((error) => (
                    <li key={error.id} className="text-xs text-red-600">
                      {error.id}: {error.error}
                    </li>
                  ))}
                  {result.errors.length > 5 && (
                    <li className="text-xs text-red-600">
                      +{result.errors.length - 5} daha...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResult(false)}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
