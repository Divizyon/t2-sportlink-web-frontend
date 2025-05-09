"use client";

import { Button } from "@/components/ui/button";
import { Filter, Shield } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    setRole("all");
    setIsActive(true);
    onReset();
    setOpen(false);
  };

  const handleApply = () => {
    onFilterChange({
      role: role === "all" ? undefined : role,
      isActive,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filtrele</span>
          {role !== "all" || !isActive ? (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-primary"></span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              Rol
            </h4>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
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
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Durum
            </h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="isActive" className="text-sm cursor-pointer">Sadece aktif kullanıcıları göster</Label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Sıfırla
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">Uygula</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 