"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User, Mail, Phone, Calendar, Clock, Trash, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture: string;
  role: string;
  created_at: string;
  updated_at: string;
  birthDate: string;
  // İlişkili veriler
  createdEvents?: number;
  userSports?: string[];
  ratingsGiven?: number;
  ratingsReceived?: number;
  eventParticipations?: number;
  notifications?: number;
  adminLogs?: number;
  reportsMade?: number;
  reportsReceived?: number;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "ahmetyilmaz",
      password: "********",
      email: "ahmet.yilmaz@example.com",
      first_name: "Ahmet",
      last_name: "Yılmaz",
      phone: "+90 555 123 4567",
      birthDate: "1985-05-15",
      profile_picture: "/images/avatars/male-1.jpg",
      role: "admin",
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-06-20T14:15:00Z",
      // İlişkili örnek veriler
      createdEvents: 12,
      userSports: ["Futbol", "Basketbol", "Tenis"],
      ratingsGiven: 8,
      ratingsReceived: 15,
      eventParticipations: 20,
      notifications: 5,
      adminLogs: 45,
      reportsMade: 3,
      reportsReceived: 0
    },
    {
      id: "2",
      username: "aysedemir",
      password: "********",
      email: "ayse.demir@example.com",
      first_name: "Ayşe",
      last_name: "Demir",
      phone: "+90 555 987 6543",
      birthDate: "1990-08-20",
      profile_picture: "/images/avatars/female-1.jpg",
      role: "user",
      created_at: "2023-02-10T09:45:00Z",
      updated_at: "2023-07-05T11:20:00Z",
      // İlişkili örnek veriler
      createdEvents: 5,
      userSports: ["Voleybol", "Yüzme"],
      ratingsGiven: 12,
      ratingsReceived: 8,
      eventParticipations: 15,
      notifications: 3,
      adminLogs: 0,
      reportsMade: 1,
      reportsReceived: 0
    }
  ]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser(null);
    }
  };

  const handleSaveChanges = () => {
    if (editingUser && selectedUser) {
      // Sadece rol değişikliklerini kaydet
      const updatedUser: User = {
        ...selectedUser,
        role: editingUser.role,
        updated_at: new Date().toISOString()
      };
      
      // Kullanıcı listesini güncelliyoruz
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      // Seçili kullanıcıyı güncelliyoruz
      setSelectedUser(updatedUser);
      
      // editingUser'ı da güncelliyoruz ki tekrar düzenleme yapılabilsin
      setEditingUser(updatedUser);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || user.email.toLowerCase().includes(query) || user.username.toLowerCase().includes(query);
  });

  return (
    <div className="flex h-screen">
      {/* Sol taraf - Kullanıcı listesi (4/5) */}
      <div className="w-4/5 p-6 space-y-6 overflow-auto border-r">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Input
              placeholder="Kullanıcı ara..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Kullanıcı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">Ad</Label>
                    <Input id="first_name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Soyad</Label>
                    <Input id="last_name" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input id="username" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input id="password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input id="birthDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input id="role" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile_picture">Profil Resmi URL</Label>
                  <Input id="profile_picture" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Kullanıcı Ekle</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-auto border rounded-lg">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doğum Tarihi</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id}
                  className="hover:bg-green-50 cursor-pointer"
                  style={{
                    borderLeft: selectedUser?.id === user.id ? '6px solid #059669' : 'none'
                  }}
                  onClick={() => {
                    setSelectedUser(user);
                    setEditingUser(user);
                  }}
                >
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar>
                          <AvatarImage src={user.profile_picture} alt={`${user.first_name} ${user.last_name}`} />
                          <AvatarFallback>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.birthDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge className={
                      user.role === "admin" 
                        ? "bg-red-500 hover:bg-red-600"
                        : user.role === "moderator"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-green-500 hover:bg-green-600"
                    }>
                      {user.role === "admin" ? "Admin" : user.role === "moderator" ? "Moderatör" : "Üye"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sağ taraf - Kullanıcı detayları (1/5) */}
      <div className="w-1/5 p-4 overflow-auto">
        {selectedUser ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-center mb-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedUser.profile_picture} alt={`${selectedUser.first_name} ${selectedUser.last_name}`} />
                    <AvatarFallback className="text-2xl">{selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center">
                  <CardTitle className="text-xl">{selectedUser.first_name} {selectedUser.last_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">@{selectedUser.username}</p>
                  <div className="flex justify-center mt-2">
                    <Badge className={
                      selectedUser.role === "admin" 
                        ? "bg-red-500 hover:bg-red-600"
                        : selectedUser.role === "moderator"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-green-500 hover:bg-green-600"
                    }>
                      {selectedUser.role === "admin" ? "Admin" : selectedUser.role === "moderator" ? "Moderatör" : "Üye"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">E-posta</span>
                      <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Telefon</span>
                      <span className="text-sm text-muted-foreground">{selectedUser.phone}</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Doğum Tarihi</span>
                      <span className="text-sm text-muted-foreground">{new Date(selectedUser.birthDate).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rol</span>
                      <Badge className={
                        selectedUser.role === "admin" 
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }>
                        {selectedUser.role === "admin" ? "Admin" : selectedUser.role === "moderator" ? "Moderatör" : "Üye"}
                      </Badge>
                    </div>
                    <Separator />

                    <div>
                      <Label htmlFor="edit-role" className="text-sm font-medium">Rolü Değiştir</Label>
                      <div className="mt-2">
                        <Select 
                          value={editingUser?.role || "user"}
                          onValueChange={(value) => editingUser && setEditingUser({
                            ...editingUser,
                            role: value
                          })}
                        >
                          <SelectTrigger id="edit-role">
                            <SelectValue placeholder="Rol seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">Üye</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Kayıt Tarihi</span>
                      <span className="text-sm text-muted-foreground">{new Date(selectedUser.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Son Güncelleme</span>
                      <span className="text-sm text-muted-foreground">{new Date(selectedUser.updated_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium mt-4">İlişkili Veriler</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Oluşturduğu Etkinlikler</span>
                      <Badge variant="outline">{selectedUser.createdEvents}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Spor Dalları</span>
                      <div className="flex gap-1">
                        {selectedUser.userSports?.map((sport, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{sport}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Verdiği Değerlendirmeler</span>
                      <Badge variant="outline">{selectedUser.ratingsGiven}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aldığı Değerlendirmeler</span>
                      <Badge variant="outline">{selectedUser.ratingsReceived}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Etkinlik Katılımları</span>
                      <Badge variant="outline">{selectedUser.eventParticipations}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bildirimler</span>
                      <Badge variant="outline">{selectedUser.notifications}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admin İşlemleri</span>
                      <Badge variant="outline">{selectedUser.adminLogs}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Yaptığı Raporlar</span>
                      <Badge variant="outline">{selectedUser.reportsMade}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hakkında Raporlar</span>
                      <Badge variant="outline">{selectedUser.reportsReceived}</Badge>
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      onClick={handleSaveChanges}
                    >
                      Rol Değişikliğini Kaydet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 mx-auto text-muted-foreground/60" />
              <p>Kullanıcı detaylarını görmek için<br />bir kullanıcı seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 