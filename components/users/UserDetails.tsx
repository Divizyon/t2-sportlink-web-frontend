"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, Mail, Phone, Shield, Pencil, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserType } from "@/interfaces/user";

interface UserDetailsProps {
  user: UserType | null;
  onUpdateUser: (updatedUser: UserType) => void;
}

export default function UserDetails({ user, onUpdateUser }: UserDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType | null>(null);

  if (!user) {
    return (
      <div className="w-full p-6 flex items-center justify-center bg-muted/20 rounded-lg h-[300px]">
        <div className="text-center py-10">
          <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">Kullanıcı Seçilmedi</h3>
          <p className="mt-2 text-sm text-muted-foreground">Lütfen detaylarını görüntülemek için bir kullanıcı seçin</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditedUser({ ...user });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedUser(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editedUser) {
      onUpdateUser(editedUser);
      setIsEditing(false);
    }
  };

  const handleChange = (field: keyof UserType, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

  const currentUser = isEditing ? editedUser : user;

  return (
    <div className="w-full h-full overflow-auto">
      <Card className="shadow-sm border-muted h-full">
        <CardHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                <AvatarImage src={currentUser?.profile_picture || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {currentUser?.first_name?.charAt(0)}{currentUser?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{currentUser?.first_name} {currentUser?.last_name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                  <span>@{currentUser?.username}</span>
                  <Badge className={
                    currentUser?.role === "superadmin"
                      ? "bg-red-500 hover:bg-red-600"
                      : currentUser?.role === "admin"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-green-500 hover:bg-green-600"
                  }>
                    {currentUser?.role === "superadmin" ? "Süper Admin" : currentUser?.role === "admin" ? "Admin" : "Üye"}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full h-9 w-9 p-0" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-full h-9 w-9 p-0" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-muted/30 rounded-lg p-5 transition-all duration-200 hover:bg-muted/40">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Kişisel Bilgiler
              </h3>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Ad Soyad</p>
                    <p className="text-sm font-medium">{currentUser?.first_name} {currentUser?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kullanıcı Adı</p>
                    <p className="text-sm font-medium">@{currentUser?.username}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">E-posta</p>
                  {isEditing ? (
                    <div className="mt-1">
                      <Input
                        id="email"
                        type="email"
                        value={currentUser?.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{currentUser?.email}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                  {isEditing ? (
                    <div className="mt-1">
                      <Input
                        id="phone"
                        value={currentUser?.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {currentUser && currentUser.phone !== null
                          ? currentUser.phone
                          : 'Belirtilmemiş'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5 transition-all duration-200 hover:bg-muted/40">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rol ve Yetki Bilgileri
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Kullanıcı Rolü</p>
                  <div className="flex items-center justify-between mt-1">
                    {isEditing ? (
                      <Select
                        value={currentUser?.role || "user"}
                        onValueChange={(value) => handleChange('role', value)}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Kullanıcı</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Süper Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge className={
                          currentUser?.role === "superadmin" ? "bg-red-500" :
                            currentUser?.role === "admin" ? "bg-blue-500" : "bg-green-500"
                        }>
                          {currentUser?.role === "superadmin" ? "Süper Admin" :
                            currentUser?.role === "admin" ? "Admin" : "Kullanıcı"}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {currentUser?.role === "superadmin"
                            ? "(Tüm yetkilere sahip)"
                            : currentUser?.role === "admin"
                              ? "(Sınırlı yönetim yetkileri)"
                              : "(Standart kullanıcı izinleri)"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hesap Oluşturma Tarihi</p>
                  <p className="text-sm font-medium">
                    {currentUser?.created_at
                      ? new Date(currentUser.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            {currentUser?.default_location_latitude && currentUser?.default_location_longitude && (
              <div className="bg-muted/30 rounded-lg p-5 transition-all duration-200 hover:bg-muted/40">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Konum Bilgileri
                </h3>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Varsayılan Konum</p>
                  <p className="text-sm font-medium">
                    {currentUser.default_location_latitude.toFixed(6)}, {currentUser.default_location_longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 