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

interface UserFilterProps {
  onFilterChange: (filters: {
    role?: string | undefined;
    searchQuery?: string | undefined;
    isActive?: boolean | undefined;
  }) => void;
  onReset: () => void;
}

export default function UserFilter({ onFilterChange, onReset }: UserFilterProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    setSelectedRoles([]);
    onReset();
    setOpen(false);
  };

  const handleApply = () => {
    if (selectedRoles.length === 0) {
      // Hiçbir rol seçilmezse, tüm rolleri göster
      onFilterChange({});
    } else {
      // Seçilen rolle filtreleme yap
      // Şu an için sadece tek rol filtrelemesi destekleniyor, bu yüzden ilk seçilen rolü alıyoruz
      onFilterChange({
        role: selectedRoles[0]
      });
    }
    setOpen(false);
  };

  const toggleRole = (role: string) => {
    // Şu anda seçili mi kontrol et
    const isSelected = selectedRoles.includes(role);
    
    if (isSelected) {
      // Seçiliyse, listeden çıkar
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      // Seçili değilse, listeye ekle - tek seçim için diğer seçimleri temizliyoruz
      setSelectedRoles([role]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 w-9 p-0 relative">
          <Filter className="h-4 w-4" />
          {selectedRoles.length > 0 ? (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rol Filtreleme</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              Rol Filtreleme
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-user"
                  checked={selectedRoles.includes("user")}
                  onCheckedChange={() => toggleRole("user")}
                />
                <Label htmlFor="role-user" className="text-sm cursor-pointer flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Kullanıcı
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-admin"
                  checked={selectedRoles.includes("admin")}
                  onCheckedChange={() => toggleRole("admin")}
                />
                <Label htmlFor="role-admin" className="text-sm cursor-pointer flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-amber-500" />
                  Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="role-superadmin"
                  checked={selectedRoles.includes("superadmin")}
                  onCheckedChange={() => toggleRole("superadmin")}
                />
                <Label htmlFor="role-superadmin" className="text-sm cursor-pointer flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Süper Admin
                </Label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Tümünü Göster
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">Uygula</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 