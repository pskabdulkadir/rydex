import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  Loader,
} from "lucide-react";

interface ExportMenuProps {
  type: string; // users, payments, subscriptions, scans
  selectedIds?: string[];
  totalCount?: number;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

interface ExportOptions {
  format: "csv" | "pdf" | "json" | "excel";
  selectedOnly: boolean;
  filename: string;
}

export default function ExportMenu({
  type,
  selectedIds = [],
  totalCount = 0,
  onExportStart,
  onExportComplete,
}: ExportMenuProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "csv" | "pdf" | "json" | "excel"
  >("csv");
  const [selectedOnly, setSelectedOnly] = useState(selectedIds.length > 0);
  const [customFilename, setCustomFilename] = useState(
    `${type}_${new Date().getTime()}`
  );
  const [loading, setLoading] = useState(false);

  // Dışa aktar
  const handleExport = async () => {
    if (loading) return;

    if (selectedOnly && selectedIds.length === 0) {
      toast.error("Seçili veri bulunamadı");
      return;
    }

    setLoading(true);

    try {
      if (onExportStart) onExportStart();

      const params = new URLSearchParams();
      params.append("type", type);
      params.append("filename", `${customFilename}.${exportFormat}`);

      if (selectedOnly && selectedIds.length > 0) {
        params.append("ids", selectedIds.join(","));
      }

      const url = `/api/export/${exportFormat}?${params.toString()}`;

      // Dosyayı indir
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Dışa aktarma başarısız");
      }

      // Dosyayı indir
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${customFilename}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${exportFormat.toUpperCase()} dosyası indirildi`);
      setShowExportDialog(false);

      if (onExportComplete) onExportComplete();
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      toast.error(
        error instanceof Error ? error.message : "Dışa aktarma başarısız"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="h-4 w-4" />;
      case "json":
        return <FileJson className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatDescription = (format: string): string => {
    switch (format) {
      case "csv":
        return "Excel, Google Sheets vb. uyumlu virgülle ayrılmış değerler";
      case "json":
        return "Yapılandırılmış veri formatı, API entegrasyonları için ideal";
      case "excel":
        return "Microsoft Excel formatı (XLSX)";
      case "pdf":
        return "Yazdırma ve paylaşım için optimize edilmiş";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              setExportFormat("csv");
              setShowExportDialog(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>CSV Dosyası</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setExportFormat("json");
              setShowExportDialog(true);
            }}
          >
            <FileJson className="h-4 w-4 mr-2" />
            <span>JSON Dosyası</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setExportFormat("excel");
              setShowExportDialog(true);
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span>Excel Dosyası</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setExportFormat("pdf");
              setShowExportDialog(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>PDF Raporu</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dışa Aktarma Seçenekleri</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Format Information */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                {getFormatIcon(exportFormat)}
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {exportFormat.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {getFormatDescription(exportFormat)}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Selection */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Dışa Aktarılacak Veriler
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    checked={!selectedOnly}
                    onChange={() => setSelectedOnly(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">
                    Tüm veriler ({totalCount || "?"} kayıt)
                  </span>
                </label>

                {selectedIds.length > 0 && (
                  <label className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedOnly}
                      onChange={() => setSelectedOnly(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">
                      Seçili veriler ({selectedIds.length} kayıt)
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Custom Filename */}
            <div className="space-y-3">
              <label htmlFor="filename" className="text-sm font-medium text-slate-700">
                Dosya Adı
              </label>
              <div className="flex gap-2">
                <Input
                  id="filename"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Dosya adı girin"
                  disabled={loading}
                />
                <span className="text-sm text-slate-600 pt-2">
                  .{exportFormat}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dosya adı boş bırakılırsa otomatik olarak oluşturulur
              </p>
            </div>

            {/* Warnings */}
            {selectedIds.length > 1000 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-700">
                  ⚠️ 1000+ kayıt dışa aktarıldığında işlem yavaş olabilir
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              Dışa Aktar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
