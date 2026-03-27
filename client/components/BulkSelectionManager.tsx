import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BulkSelectionManagerProps {
  items: Array<{ id: string; [key: string]: any }>;
  onSelectionChange?: (selectedIds: string[], selectedCount: number) => void;
  maxSelection?: number;
}

export default function BulkSelectionManager({
  items,
  onSelectionChange,
  maxSelection = 1000,
}: BulkSelectionManagerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Selection change events'i yayınla
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedIds), selectedIds.size);
    }
  }, [selectedIds, onSelectionChange]);

  // Tüm öğeleri seç/deselect et
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      if (items.length > maxSelection) {
        toast.error(
          `Maksimum ${maxSelection} öğe seçilebilir (${items.length} mevcut)`
        );
        return;
      }
      const allIds = new Set(items.map((item) => item.id));
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  // Tek bir öğeyi seç/deselect et
  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(id)) {
      newSelected.delete(id);
      setSelectAll(false);
    } else {
      if (newSelected.size >= maxSelection) {
        toast.error(
          `Maksimum ${maxSelection} öğe seçilebilir`
        );
        return;
      }
      newSelected.add(id);
      // Tüm öğeler seçildiyse select-all'ı işaretle
      if (newSelected.size === items.length) {
        setSelectAll(true);
      }
    }

    setSelectedIds(newSelected);
  };

  // Seçimi temizle
  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectAll(false);
  };

  // Seçimi ters çevir
  const handleInvertSelection = () => {
    const newSelected = new Set<string>();
    items.forEach((item) => {
      if (!selectedIds.has(item.id)) {
        if (newSelected.size < maxSelection) {
          newSelected.add(item.id);
        }
      }
    });
    setSelectedIds(newSelected);
    setSelectAll(false);
  };

  const selectedCount = selectedIds.size;
  const totalCount = items.length;

  return (
    <div className="space-y-2">
      {/* Header - Select All Checkbox */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
        <Checkbox
          id="select-all"
          checked={selectAll && totalCount > 0}
          indeterminate={selectedCount > 0 && selectedCount < totalCount}
          onCheckedChange={handleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="flex-1 text-sm font-medium text-slate-700 cursor-pointer"
        >
          {selectedCount > 0
            ? `${selectedCount} / ${totalCount} seçildi`
            : `Tümü seç (${totalCount} öğe)`}
        </label>

        {selectedCount > 0 && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInvertSelection}
              className="text-xs h-8"
            >
              Ters Çevir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-xs h-8 text-red-600 hover:text-red-700"
            >
              Temizle
            </Button>
          </div>
        )}
      </div>

      {/* Individual Checkboxes */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded transition-colors"
          >
            <Checkbox
              id={`item-${item.id}`}
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => handleToggleSelection(item.id)}
            />
            <label
              htmlFor={`item-${item.id}`}
              className="flex-1 text-sm text-slate-700 cursor-pointer truncate"
            >
              {item.name || item.title || item.email || item.id}
            </label>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      {selectedCount > 0 && (
        <div className="text-xs text-slate-600 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <strong>{selectedCount}</strong> / <strong>{totalCount}</strong> öğe
          seçildi
          {selectedCount > 100 && (
            <span className="ml-2 text-orange-600">
              (⚠️ Toplu işlemler yavaş olabilir)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook - Selection durumunu yönetmek için
 */
export function useBulkSelection(items: Array<{ id: string }>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const selectedCount = selectedIds.size;
  const totalCount = items.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount,
    totalCount,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,
    isSelected,
  };
}
