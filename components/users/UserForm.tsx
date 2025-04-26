"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserType } from "@/interfaces/user";

interface UserFormProps {
  user?: UserType;
  onSubmit: (userData: Partial<UserType>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isEditing = false }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<UserType>>({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    role: user?.role || "user",
    default_location_latitude: user?.default_location_latitude || 41.0082,
    default_location_longitude: user?.default_location_longitude || 28.9784,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: Partial<UserType>) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Ad</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Soyad</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required={!isEditing}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select
            value={formData.role || "user"}
            onValueChange={(value) => handleChange("role", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Kullanıcı</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Süper Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit">
          {isEditing ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
} 