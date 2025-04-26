"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [role, setRole] = useState<string>("all");
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleReset = () => {
    setRole("all");
    setIsActive(true);
    onReset();
  };

  const handleApply = () => {
    onFilterChange({
      role: role === "all" ? undefined : role,
      isActive,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtrele
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h4 className="font-medium">Rol</h4>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Süper Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Durum</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="isActive">Aktif Kullanıcılar</Label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Sıfırla
          </Button>
          <Button onClick={handleApply}>Uygula</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 