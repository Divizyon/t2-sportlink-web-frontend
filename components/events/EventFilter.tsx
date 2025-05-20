"use client";

import { Button } from "@/components/ui/button";
import { Filter, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface EventFilterProps {
  onFilterChange: (filters: {
    status?: string[] | undefined;
  }) => void;
  onReset: () => void;
}

export default function EventFilter({ onFilterChange, onReset }: EventFilterProps) {
  const ALL_STATUSES = ["active", "passive", "pending", "canceled", "completed"];
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isTumuSelected, setIsTumuSelected] = useState(true); // Başlangıçta Tümü seçili
  const [open, setOpen] = useState(false);

  // Seçim değiştiğinde filtreyi uygula
  const applyFilter = (statuses: string[], isTumuSelected: boolean) => {
    setSelectedStatuses(statuses);
    setIsTumuSelected(isTumuSelected);
    
    if (isTumuSelected) {
      onFilterChange({}); // Tümü seçiliyse filtre yok
    } else {
      // Durumları dizi olarak gönder (OR mantığı)
      onFilterChange({ status: statuses }); 
    }
  };

  // Tümü seçildiğinde
  const handleAllToggle = () => {
    // Eğer Tümü zaten seçiliyse, hiçbir şey yapma (deselect edemezsin)
    if (isTumuSelected) {
      return;
    }
    
    // Tümü'yü seç ve diğerlerini kaldır
    applyFilter([], true);
  };

  // Tek tek durum seçimi
  const handleStatusToggle = (status: string) => {
    // Eğer Tümü seçiliyse
    if (isTumuSelected) {
      // Tümü'nü kaldır ve sadece seçilen durumu filtrele
      applyFilter([status], false);
      return;
    }
    
    // Normal durum ekleme/çıkarma işlemi
    let newStatuses;
    if (selectedStatuses.includes(status)) {
      newStatuses = selectedStatuses.filter(s => s !== status);
      
      // Eğer hiç durum kalmadıysa Tümü'yü otomatik seç
      if (newStatuses.length === 0) {
        applyFilter([], true);
        return;
      }
    } else {
      newStatuses = [...selectedStatuses, status];
      
      // Eğer tüm durumlar seçildiyse, otomatik olarak Tümü'ye dön
      if (newStatuses.length === ALL_STATUSES.length) {
        applyFilter([], true);
        return;
      }
    }
    
    applyFilter(newStatuses, false);
  };

  const handleReset = () => {
    applyFilter([], true); // Tümünü seç
    setOpen(false);
  };

  // Status badge styling
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'passive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-amber-500 text-white';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'passive':
        return 'Pasif';
      case 'pending':
        return 'Beklemede';
      case 'canceled':
        return 'İptal Edildi';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 w-9 p-0 relative event-status-filter" data-selected-statuses={selectedStatuses.join(',')}>
          <Filter className="h-4 w-4" />
          {!isTumuSelected && selectedStatuses.length > 0 && (
            <Badge className="h-4 min-w-4 absolute -top-1.5 -right-1.5 flex items-center justify-center p-0 text-[10px]">
              {selectedStatuses.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <div className="grid gap-6 py-4 px-4">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-primary" />
              Duruma Göre Filtrele
            </h4>
            <div className="space-y-2">
              {/* Tümü seçeneği - her zaman en az bir seçenek olarak kalmalı */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-all"
                  checked={isTumuSelected}
                  onCheckedChange={handleAllToggle}
                />
                <Label htmlFor="status-all" className="text-sm cursor-pointer flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  Tümü
                </Label>
              </div>
              {/* Durumlar */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-active"
                  checked={isTumuSelected ? false : selectedStatuses.includes("active")}
                  onCheckedChange={() => handleStatusToggle("active")}
                />
                <Label htmlFor="status-active" className="text-sm cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 text-green-600`} />
                  Aktif
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-pending"
                  checked={isTumuSelected ? false : selectedStatuses.includes("pending")}
                  onCheckedChange={() => handleStatusToggle("pending")}
                />
                <Label htmlFor="status-pending" className="text-sm cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 text-amber-600`} />
                  Beklemede
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-passive"
                  checked={isTumuSelected ? false : selectedStatuses.includes("passive")}
                  onCheckedChange={() => handleStatusToggle("passive")}
                />
                <Label htmlFor="status-passive" className="text-sm cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 text-gray-600`} />
                  Pasif
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-canceled"
                  checked={isTumuSelected ? false : selectedStatuses.includes("canceled")}
                  onCheckedChange={() => handleStatusToggle("canceled")}
                />
                <Label htmlFor="status-canceled" className="text-sm cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 text-red-600`} />
                  İptal Edildi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-completed"
                  checked={isTumuSelected ? false : selectedStatuses.includes("completed")}
                  onCheckedChange={() => handleStatusToggle("completed")}
                />
                <Label htmlFor="status-completed" className="text-sm cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 text-blue-600`} />
                  Tamamlandı
                </Label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 