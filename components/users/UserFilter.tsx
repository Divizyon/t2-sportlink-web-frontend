"use client";

import { Button } from "@/components/ui/button";
import { Filter, Shield, User, UserCog, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface UserFilterProps {
  onFilterChange: (filters: {
    role?: string[] | undefined;
    searchQuery?: string | undefined;
    isActive?: boolean | undefined;
  }) => void;
  onReset: () => void;
}

export default function UserFilter({ onFilterChange, onReset }: UserFilterProps) {
  const ALL_ROLES = ["user", "admin", "superadmin"];
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isTumuSelected, setIsTumuSelected] = useState(true); // Başlangıçta Tümü seçili
  const [open, setOpen] = useState(false);

  // Seçim değiştiğinde filtreyi uygula
  const applyFilter = (roles: string[], isTumuSelected: boolean) => {
    setSelectedRoles(roles);
    setIsTumuSelected(isTumuSelected);
    
    if (isTumuSelected) {
      onFilterChange({}); // Tümü seçiliyse filtre yok
    } else {
      onFilterChange({ role: roles }); // Rolleri dizi olarak gönder
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

  // Tek tek rol seçimi
  const handleRoleToggle = (role: string) => {
    // Eğer Tümü seçiliyse
    if (isTumuSelected) {
      // Tümü'nü kaldır ve sadece seçilen rolü filtrele
      applyFilter([role], false);
      return;
    }
    
    // Normal rol ekleme/çıkarma işlemi
    let newRoles;
    if (selectedRoles.includes(role)) {
      newRoles = selectedRoles.filter(r => r !== role);
      
      // Eğer hiç rol kalmadıysa Tümü'yü otomatik seç
      if (newRoles.length === 0) {
        applyFilter([], true);
        return;
      }
    } else {
      newRoles = [...selectedRoles, role];
      
      // Eğer 3 rol de seçildiyse, otomatik olarak Tümü'ye dön
      if (newRoles.length === ALL_ROLES.length) {
        applyFilter([], true);
        return;
      }
    }
    
    applyFilter(newRoles, false);
  };

  const handleReset = () => {
    applyFilter([], true); // Tümünü seç
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 w-9 p-0 relative user-role-filter" data-selected-roles={selectedRoles.join(',')}>
          <Filter className="h-4 w-4" />
          {!isTumuSelected && selectedRoles.length > 0 && (
            <Badge className="h-4 min-w-4 absolute -top-1.5 -right-1.5 flex items-center justify-center p-0 text-[10px]">
              {selectedRoles.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <div className="grid gap-6 py-4 px-4">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              Role Göre Filtrele
            </h4>
            <div className="space-y-2">
              {/* Tümü seçeneği - her zaman en az bir seçenek olarak kalmalı */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-all"
                  checked={isTumuSelected}
                  onCheckedChange={handleAllToggle}
                />
                <Label htmlFor="role-all" className="text-sm cursor-pointer flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  Tümü
                </Label>
              </div>
              {/* Diğer roller */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-user"
                  checked={isTumuSelected ? false : selectedRoles.includes("user")}
                  onCheckedChange={() => handleRoleToggle("user")}
                />
                <Label htmlFor="role-user" className="text-sm cursor-pointer flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Kullanıcı
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-admin"
                  checked={isTumuSelected ? false : selectedRoles.includes("admin")}
                  onCheckedChange={() => handleRoleToggle("admin")}
                />
                <Label htmlFor="role-admin" className="text-sm cursor-pointer flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-amber-500" />
                  Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-superadmin"
                  checked={isTumuSelected ? false : selectedRoles.includes("superadmin")}
                  onCheckedChange={() => handleRoleToggle("superadmin")}
                />
                <Label htmlFor="role-superadmin" className="text-sm cursor-pointer flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Süper Admin
                </Label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 