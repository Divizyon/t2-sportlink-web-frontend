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
      <div className="w-1/3 p-6 flex items-center justify-center">
        <p className="text-gray-500">Lütfen bir kullanıcı seçin</p>
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
    <div className="w-1/3 p-4 overflow-auto">
      <div className="space-y-4">
        <Card>
          <CardHeader className="px-6 pt-5 pb-3 bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                  <AvatarImage src={currentUser?.profile_picture || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {currentUser?.first_name?.charAt(0)}{currentUser?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl text-gray-800">{currentUser?.first_name} {currentUser?.last_name}</CardTitle>
                  <CardDescription className="text-sm flex items-center gap-2 mt-1">
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
                <Button variant="outline" size="icon" onClick={handleEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Ad Soyad</span>
                    </div>
                    <span className="text-sm bg-white px-2 py-1 rounded border">{currentUser?.first_name} {currentUser?.last_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">E-posta</span>
                    </div>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={currentUser?.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm bg-white px-2 py-1 rounded border">{currentUser?.email}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Telefon</span>
                    </div>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={currentUser?.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm bg-white px-2 py-1 rounded border">{currentUser?.phone || '-'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Rol Yönetimi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Kullanıcı Rolü:</p>
                    <Badge className={
                      currentUser?.role === "superadmin" ? "bg-red-500" : 
                      currentUser?.role === "admin" ? "bg-blue-500" : "bg-green-500"
                    }>
                      {currentUser?.role === "superadmin" ? "Süper Admin" : 
                       currentUser?.role === "admin" ? "Admin" : "Kullanıcı"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Select
                        value={currentUser?.role || "user"}
                        onValueChange={(value) => handleChange('role', value)}
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
                    ) : (
                      <p className="text-sm">
                        {currentUser?.role === "superadmin" ? "Süper Admin" : currentUser?.role === "admin" ? "Admin" : "Üye"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Konum</Label>
                <p className="text-sm">
                  {currentUser?.default_location_latitude && currentUser?.default_location_longitude
                    ? `${currentUser.default_location_latitude}, ${currentUser.default_location_longitude}`
                    : 'Konum belirtilmemiş'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 