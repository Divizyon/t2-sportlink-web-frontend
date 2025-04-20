"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User as UserIcon, Mail, Phone, Calendar, Clock, Trash, ChevronRight, Trophy, Users, Activity, Shield, Award, MapPin, FileText, Bell, AlertTriangle, UserCheck } from "lucide-react";
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
  DialogFooter,
  DialogClose,
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/interfaces/user";

// Oluşturduğu Etkinlikler - Tıklanabilir
const createdEventsData = [
  { id: 1, name: "Halı Saha Maçı", date: "15.06.2023", location: "Kadıköy", participants: 14 },
  { id: 2, name: "Basketbol Turnuvası", date: "22.07.2023", location: "Beşiktaş", participants: 20 },
  { id: 3, name: "Tenis Eğitimi", date: "10.08.2023", location: "Ataşehir", participants: 8 }
];

// Katıldığı Etkinlikler
const participatedEventsData = [
  {
    id: "1",
    name: "Sahil Koşusu",
    date: "05.05.2023",
    location: "Caddebostan Sahili, İstanbul",
    status: "Katıldı"
  },
  {
    id: "2",
    name: "Yoga Kampı",
    date: "12.06.2023",
    location: "Wellness Merkezi, İstanbul",
    status: "Katıldı"
  },
  {
    id: "3",
    name: "Dağ Bisikleti Turu",
    date: "20.07.2023",
    location: "Belgrad Ormanı, İstanbul",
    status: "Onay Bekliyor"
  }
];

// Raporlar
const reportsDataAhmet = [
  {
    id: "1",
    reporter: "Murat Kılıç",
    reason: "Etkinliğe gelmedi",
    date: "15.06.2023",
    status: "Çözüldü"
  },
  {
    id: "2",
    reporter: "Özlem Aslan",
    reason: "Uygunsuz davranış",
    date: "05.07.2023",
    status: "İncelemede"
  }
];

const reportsDataAyse = [
  {
    id: "1",
    reporter: "Can Yılmaz",
    reason: "Geç katılım ve etkinliği terk etme",
    date: "18.07.2023",
    status: "İncelemede"
  },
  {
    id: "2",
    reporter: "Ahmet Yılmaz",
    reason: "Uygunsuz davranış",
    date: "25.08.2023",
    status: "Çözüldü"
  },
  {
    id: "3",
    reporter: "Zeynep Kaya",
    reason: "Etkinlik kurallarına uymama",
    date: "10.09.2023",
    status: "İncelenmedi"
  }
];

// Tip tanımlamaları
type UserType = {
  id: string;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  birthDate: string;
  profile_picture: string | null;
  default_location_latitude: number;
  default_location_longitude: number;
  role: string;
  created_at: string;
  updated_at: string;
  userSports: string[];
  interests: string[];
  createdEvents: number;
  eventParticipations: number;
  evaluationsGiven: number;
  evaluationsReceived: number;
  reportsGiven: number;
  reportsReceived: number;
  notifications: number;
  adminActions: number;
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"username" | "email" | "first_name" | "last_name">("username");
  const [selectedFilters, setSelectedFilters] = useState<{
    role: string[];
  }>({
    role: []
  });
  const [users, setUsers] = useState<UserType[]>([
    {
      id: "1",
      username: "john_doe",
      password: "********",
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "+905551234567",
      birthDate: "1990-01-01",
      profile_picture: null,
      default_location_latitude: 41.0082,
      default_location_longitude: 28.9784,
      role: "admin",
      created_at: "2022-01-01T00:00:00Z",
      updated_at: "2022-01-01T00:00:00Z",
      userSports: ["Futbol", "Basketbol"],
      interests: ["Spor", "Müzik", "Seyahat", "Teknoloji"],
      createdEvents: 5,
      eventParticipations: 10,
      evaluationsGiven: 8,
      evaluationsReceived: 12,
      reportsGiven: 2,
      reportsReceived: 0,
      notifications: 3,
      adminActions: 15
    },
    {
      id: "2",
      username: "jane_smith",
      password: "********",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Smith",
      phone: "+905559876543",
      birthDate: "1992-05-15",
      profile_picture: null,
      default_location_latitude: 41.0082,
      default_location_longitude: 28.9784,
      role: "user",
      created_at: "2022-02-01T00:00:00Z",
      updated_at: "2022-02-01T00:00:00Z",
      userSports: ["Tenis", "Yüzme"],
      interests: ["Kitap", "Seyahat"],
      createdEvents: 2,
      eventParticipations: 15,
      evaluationsGiven: 10,
      evaluationsReceived: 5,
      reportsGiven: 1,
      reportsReceived: 0,
      notifications: 5,
      adminActions: 0
    }
  ]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserType>>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "user",
  });
  const [newRole, setNewRole] = useState<string>("user");

  // Sayfa yüklendiğinde ilk kullanıcıyı otomatik olarak seç
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      const firstUser = users[0];
      if (firstUser) {
        setSelectedUser(firstUser);
        setEditingUser(firstUser);
      }
    }
  }, [users, selectedUser]);

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser(null);
    }
  };

  const handleSaveChanges = () => {
    if (editingUser && selectedUser) {
      // Sadece rol değişikliklerini kaydet
      const updatedUser: UserType = {
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

  const handleFilterChange = (type: 'role', value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [type]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      }
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user[searchField].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedFilters.role.length === 0 || 
      selectedFilters.role.includes(user.role);

    return matchesSearch && matchesRole;
  });

  // İçerik sayılarını kullanıcı ID'sine göre dinamik olarak belirle
  const getUserData = (userId: string) => {
    if (userId === "1") { // Ahmet
      return {
        createdEvents: createdEventsData.length,
        eventParticipations: participatedEventsData.length,
        reportsReceived: reportsDataAhmet.length
      };
    } else if (userId === "2") { // Ayşe
      return {
        createdEvents: 5,
        eventParticipations: 15,
        reportsReceived: reportsDataAyse.length
      };
    }
    return {
      createdEvents: 0,
      eventParticipations: 0,
      reportsReceived: 0
    };
  };

  const getTotalSelectedFilters = () => {
    return selectedFilters.role.length;
  };

  return (
    <div className="flex h-screen">
      {/* Sol taraf - Kullanıcı listesi (2/3) */}
      <div className="w-2/3 p-6 space-y-6 overflow-auto border-r">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Kullanıcı ara..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Filtrele {getTotalSelectedFilters() > 0 ? `(${getTotalSelectedFilters()})` : ''}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Rol</h4>
                    <div className="space-y-2">
                      {['Admin', 'Kullanıcı', 'Yönetici'].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`role-${role}`}
                            checked={selectedFilters.role.includes(role)}
                            onChange={() => handleFilterChange('role', role)}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`role-${role}`}>{role}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                          <AvatarImage src={user.profile_picture || ""} alt={`${user.first_name} ${user.last_name}`} />
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
                        : "bg-green-500 hover:bg-green-600"
                    }>
                      {user.role === "admin" ? "Admin" : "Üye"}
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

      {/* Sağ taraf - Kullanıcı detayları (1/3) */}
      <div className="w-1/3 p-4 overflow-auto">
        {selectedUser ? (
          <div className="space-y-4">
      <Card>
              <CardHeader className="px-6 pt-5 pb-3 bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                      <AvatarImage src={selectedUser.profile_picture || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl text-gray-800">{selectedUser.first_name} {selectedUser.last_name}</CardTitle>
                      <CardDescription className="text-sm flex items-center gap-2 mt-1">
                        <span>@{selectedUser.username}</span>
                        <Badge className={
                          selectedUser.role === "admin" 
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }>
                          {selectedUser.role === "admin" ? "Admin" : "Üye"}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
        </CardHeader>
              <CardContent className="px-6 pt-5">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">E-posta</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.email}</span>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">Telefon</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.phone}</span>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">Doğum Tarihi</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">
                          {new Date(selectedUser.birthDate).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Rol Yönetimi</h3>
                    <div className="flex items-center justify-between px-1 mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Kullanıcı Rolü</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={editingUser?.role || "user"}
                          onValueChange={(value) => editingUser && setEditingUser({
                            ...editingUser,
                            role: value
                          })}
                        >
                          <SelectTrigger id="edit-role" className="w-[120px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">Üye</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleSaveChanges} className="w-full bg-green-600 hover:bg-green-700 text-sm h-9">
                      Kaydet
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Sistem Bilgileri</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-gray-700">Son Güncelleme</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">
                          {new Date(selectedUser.updated_at).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Kullanıcı İstatistikleri</h3>
                    <div className="space-y-3">
                      {/* Spor Dalları - Tıklanabilir */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-indigo-500" />
                              <span className="text-sm font-medium">Spor Dalları</span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[180px] justify-end items-center">
                              {selectedUser.userSports && selectedUser.userSports.length > 0 ? (
                                <>
                                  {selectedUser.userSports.slice(0, 2).map((sport, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">{sport}</Badge>
                                  ))}
                                  {selectedUser.userSports.length > 2 && (
                                    <Badge variant="outline" className="text-xs">+{selectedUser.userSports.length - 2}</Badge>
                                  )}
                                  <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">0</span>
                              )}
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>İlgilendiği Spor Dalları</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="flex flex-wrap gap-2">
                              {selectedUser.userSports?.map((sport, index) => (
                                <Badge key={index}>{sport}</Badge>
                              ))}
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Kapat</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Oluşturduğu Etkinlikler - Tıklanabilir */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">Oluşturduğu Etkinlikler</span>
                            </div>
                            <div className="flex items-center">
                              <Badge className={`${selectedUser.id === "1" && createdEventsData.length > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} border-0`}>
                                {selectedUser.id === "1" ? createdEventsData.length : selectedUser.createdEvents || 0}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Oluşturulan Etkinlikler</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Etkinlik Adı</TableHead>
                                  <TableHead>Tarih</TableHead>
                                  <TableHead>Konum</TableHead>
                                  <TableHead>Katılımcı Sayısı</TableHead>
                                  <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedUser.id === "1" ? (
                                  createdEventsData.map((event) => (
                                    <TableRow key={event.id}>
                                      <TableCell>{event.name}</TableCell>
                                      <TableCell>{event.date}</TableCell>
                                      <TableCell>{event.location}</TableCell>
                                      <TableCell>{event.participants}</TableCell>
                                      <TableCell className="text-right">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">Detay</Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                              <DialogTitle>{event.name} Detayları</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4 space-y-3">
                                              <Card>
                                                <CardContent className="p-6">
                                                  <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                      <h3 className="font-medium text-lg">{event.name}</h3>
                                                      <Badge className="bg-green-500">Aktif</Badge>
                                                    </div>
                                                    <Separator />
                                                    <div className="grid grid-cols-2 gap-4">
                                                      <div>
                                                        <span className="text-sm font-medium">Tarih:</span>
                                                        <p className="text-sm">{event.date}</p>
                                                      </div>
                                                      <div>
                                                        <span className="text-sm font-medium">Konum:</span>
                                                        <p className="text-sm">{event.location}</p>
                                                      </div>
                                                      <div>
                                                        <span className="text-sm font-medium">Katılımcı Sayısı:</span>
                                                        <p className="text-sm">{event.participants}</p>
                                                      </div>
                                                      <div>
                                                        <span className="text-sm font-medium">Spor Türü:</span>
                                                        <p className="text-sm">{event.name.includes("Futbol") ? "Futbol" : 
                                                          event.name.includes("Basketbol") ? "Basketbol" : 
                                                          event.name.includes("Tenis") ? "Tenis" : "Diğer"}</p>
                                                      </div>
                                                    </div>
                                                    <Separator />
                                                    <div>
                                                      <span className="text-sm font-medium">Açıklama:</span>
                                                      <p className="text-sm mt-1">
                                                        Bu etkinlik {selectedUser.first_name} {selectedUser.last_name} tarafından {event.date} tarihinde oluşturulmuştur. Etkinlik {event.location} konumunda gerçekleşecek ve şu anda {event.participants} katılımcı bulunmaktadır.
                                                      </p>
                                                    </div>
                                                    <Separator />
                                                    <div>
                                                      <span className="text-sm font-medium">Katılımcı Listesi:</span>
                                                      <div className="mt-2 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                          <Avatar className="h-6 w-6">
                                                            <AvatarFallback>JD</AvatarFallback>
                                                          </Avatar>
                                                          <span className="text-sm">John Doe</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                          <Avatar className="h-6 w-6">
                                                            <AvatarFallback>JS</AvatarFallback>
                                                          </Avatar>
                                                          <span className="text-sm">Jane Smith</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                          <Avatar className="h-6 w-6">
                                                            <AvatarFallback>MK</AvatarFallback>
                                                          </Avatar>
                                                          <span className="text-sm">Murat Kaya</span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                          ... ve {event.participants - 3} kişi daha
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            </div>
                                            <DialogFooter>
                                              <DialogClose asChild>
                                                <Button variant="outline">Kapat</Button>
                                              </DialogClose>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  // Ayşe veya diğer kullanıcılar için örnek veriler
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                      <p className="text-gray-500">Bu kullanıcı henüz etkinlik oluşturmamış veya veriler yüklenemedi.</p>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Kapat</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Etkinlik Katılımları - Tıklanabilir */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Katıldığı Etkinlikler</span>
                            </div>
                            <div className="flex items-center">
                              <Badge className={`${selectedUser.eventParticipations > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"} border-0`}>
                                {selectedUser.id === "1" ? participatedEventsData.length : selectedUser.eventParticipations || 0}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Kullanıcının Katıldığı Etkinlikler</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            {selectedUser.id === "1" ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Etkinlik Adı</TableHead>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Konum</TableHead>
                                    <TableHead>Durum</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {participatedEventsData.map((event) => (
                                    <Dialog key={event.id}>
                                      <DialogTrigger asChild>
                                        <TableRow className="cursor-pointer hover:bg-gray-50">
                                          <TableCell>{event.name}</TableCell>
                                          <TableCell>{event.date}</TableCell>
                                          <TableCell>{event.location}</TableCell>
                                          <TableCell>
                                            <Badge className={
                                              event.status === "Katıldı" ? "bg-green-500" : 
                                              event.status === "Onay Bekliyor" ? "bg-yellow-500" : 
                                              "bg-gray-500"
                                            }>
                                              {event.status}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                          <DialogTitle>{event.name} Detayları</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-3">
                                          <Card>
                                            <CardContent className="p-6">
                                              <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                  <h3 className="font-medium text-lg">{event.name}</h3>
                                                  <Badge className={
                                                    event.status === "Katıldı" ? "bg-green-500" : 
                                                    event.status === "Onay Bekliyor" ? "bg-yellow-500" : 
                                                    "bg-gray-500"
                                                  }>
                                                    {event.status}
                                                  </Badge>
                                                </div>
                                                <Separator />
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <span className="text-sm font-medium">Tarih:</span>
                                                    <p className="text-sm">{event.date}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-sm font-medium">Konum:</span>
                                                    <p className="text-sm">{event.location}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-sm font-medium">Etkinlik Sahibi:</span>
                                                    <p className="text-sm">
                                                      {event.name.includes("Koşusu") ? "Ali Veli" : 
                                                       event.name.includes("Yoga") ? "Zeynep Kaya" : 
                                                       event.name.includes("Bisiklet") ? "Mehmet Yılmaz" : "John Doe"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="text-sm font-medium">Katılım Durumu:</span>
                                                    <p className="text-sm">{event.status}</p>
                                                  </div>
                                                </div>
                                                <Separator />
                                                <div>
                                                  <span className="text-sm font-medium">Etkinlik Açıklaması:</span>
                                                  <p className="text-sm mt-1">
                                                    {event.name.includes("Koşusu") ? 
                                                      "Caddebostan sahilinde güneş doğarken gerçekleşecek bir koşu etkinliği. Her seviyeden koşucu katılabilir." : 
                                                    event.name.includes("Yoga") ? 
                                                      "Stresi azaltmak ve esnekliği artırmak için profesyonel eğitmen eşliğinde yoga kampı." : 
                                                    event.name.includes("Bisiklet") ? 
                                                      "Belgrad Ormanı'nda doğa ile iç içe bir bisiklet turu. Kendi bisikletinizi getirmeniz gerekmektedir." : 
                                                      "Spor etkinliği detayları."}
                                                  </p>
                                                </div>
                                                <Separator />
                                                <div>
                                                  <span className="text-sm font-medium">Katılımcı Değerlendirmesi:</span>
                                                  <div className="mt-2">
                                                    {event.status === "Katıldı" ? (
                                                      <div className="flex items-center space-x-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                          <svg
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                          >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                          </svg>
                                                        ))}
                                                        <span className="text-sm ml-1">(4/5) Çok İyi</span>
                                                      </div>
                                                    ) : event.status === "Onay Bekliyor" ? (
                                                      <p className="text-sm text-yellow-600">Etkinlik katılımı onay bekliyor.</p>
                                                    ) : (
                                                      <p className="text-sm text-muted-foreground">Henüz değerlendirme yapılmadı.</p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                        <DialogFooter>
                                          <DialogClose asChild>
                                            <Button variant="outline">Kapat</Button>
                                          </DialogClose>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-gray-500">
                                  {selectedUser.eventParticipations ? 
                                    `Bu kullanıcı ${selectedUser.eventParticipations} etkinliğe katılmış.` : 
                                    "Bu kullanıcının katıldığı etkinlik bulunamadı."}
                                </p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Kapat</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Hakkında Raporlar - Tıklanabilir - Admin kullanıcılarda görünmez */}
                      {selectedUser.role !== "admin" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">Hakkında Raporlar</span>
                              </div>
                              <div className="flex items-center">
                                <Badge className={`${
                                  (selectedUser.id === "1" && reportsDataAhmet.length > 0) || 
                                  (selectedUser.id === "2" && reportsDataAyse.length > 0) ? 
                                  "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"} border-0`}>
                                  {selectedUser.id === "1" ? reportsDataAhmet.length : 
                                  selectedUser.id === "2" ? reportsDataAyse.length : 
                                  selectedUser.reportsReceived || 0}
                                </Badge>
                                <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Kullanıcı Hakkında Raporlar</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              {(selectedUser.id === "1" && reportsDataAhmet.length > 0) ? (
          <Table>
            <TableHeader>
              <TableRow>
                                      <TableHead>Raporlayan</TableHead>
                                      <TableHead>Sebep</TableHead>
                                      <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                                    {reportsDataAhmet.map((report) => (
                                      <TableRow key={report.id}>
                                        <TableCell>{report.reporter}</TableCell>
                                        <TableCell>{report.reason}</TableCell>
                                        <TableCell>{report.date}</TableCell>
                <TableCell>
                                          <Badge className={
                                            report.status === "Çözüldü" ? "bg-green-500" : 
                                            report.status === "İncelemede" ? "bg-yellow-500" :
                                            "bg-gray-500"
                                          }>
                                            {report.status}
                                          </Badge>
                </TableCell>
                <TableCell className="text-right">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="outline" size="sm">Detay</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[600px]">
                                              <DialogHeader>
                                                <DialogTitle>Rapor Detayı</DialogTitle>
                                              </DialogHeader>
                                              <div className="py-4 space-y-3">
                                                <Card>
                                                  <CardContent className="p-6">
                                                    <div className="space-y-4">
                                                      <div className="flex justify-between items-center">
                                                        <h3 className="font-medium text-lg">Rapor #{report.id}</h3>
                                                        <Badge className={
                                                          report.status === "Çözüldü" ? "bg-green-500" : 
                                                          report.status === "İncelemede" ? "bg-yellow-500" :
                                                          "bg-gray-500"
                                                        }>
                                                          {report.status}
                                                        </Badge>
                                                      </div>
                                                      <Separator />
                                                      <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                          <span className="text-sm font-medium">Raporlayan:</span>
                                                          <p className="text-sm">{report.reporter}</p>
                                                        </div>
                                                        <div>
                                                          <span className="text-sm font-medium">Tarih:</span>
                                                          <p className="text-sm">{report.date}</p>
                                                        </div>
                                                        <div>
                                                          <span className="text-sm font-medium">Sebep:</span>
                                                          <p className="text-sm">{report.reason}</p>
                                                        </div>
                                                        <div>
                                                          <span className="text-sm font-medium">İnceleyen Admin:</span>
                                                          <p className="text-sm">{
                                                            report.status === "Çözüldü" ? "Mehmet Aydın" : 
                                                            report.status === "İncelemede" ? "Ahmet Yılmaz" :
                                                            "-"
                                                          }</p>
                                                        </div>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Detaylı Açıklama:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.id === "2" ? 
                                                            "Kullanıcı etkinlik sırasında diğer katılımcılara karşı uygunsuz davranışlar sergiledi ve etkinliğin düzenini bozdu." : 
                                                            "Kullanıcı etkinliğe kayıt yaptırdığı halde hiçbir bildirimde bulunmadan etkinliğe katılmadı ve grup organizasyonunu aksattı."}
                                                        </p>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Yapılan İşlem:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.status === "Çözüldü" ? 
                                                            "Kullanıcıyla görüşme yapıldı ve uyarı verildi. İleri seviye bir ihlal tespit edilmediği için ceza uygulanmadı." : 
                                                            report.status === "İncelemede" ? 
                                                            "Rapor incelenmektedir. Taraflarla iletişime geçildi, deliller toplanıyor." : 
                                                            "Henüz bir işlem yapılmadı."}
                                                        </p>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Sonuç:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.status === "Çözüldü" ? 
                                                            "Kullanıcı davranışını düzeltmeyi kabul etti ve gelecekteki etkinliklerde benzer davranışları sergilemeyeceğine dair taahhütte bulundu." : 
                                                            report.status === "İncelemede" ? 
                                                            "Henüz sonuçlanmadı. İnceleme süreci devam ediyor." : 
                                                            "İnceleme başlatılmadı."}
                                                        </p>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Admin Mesajı:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.status === "Çözüldü" ? 
                                                            "Bu rapor başarılı bir şekilde çözülmüştür. Kullanıcı uyarılmış ve gerekli tedbirler alınmıştır. Aynı kullanıcı hakkında benzer şikayetler gelirse daha ciddi yaptırımlar uygulanacaktır." : 
                                                            report.status === "İncelemede" ? 
                                                            "Rapor ciddi bir şekilde incelenmektedir. Taraflarla görüşmeler devam etmektedir. 48 saat içinde sonuçlandırılacaktır." : 
                                                            "Bu rapor henüz incelemeye alınmamıştır."}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              </div>
                                              <DialogFooter>
                                                <DialogClose asChild>
                                                  <Button variant="outline">Kapat</Button>
                                                </DialogClose>
                                              </DialogFooter>
                                            </DialogContent>
                                          </Dialog>
                </TableCell>
              </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : selectedUser.id === "2" && reportsDataAyse.length > 0 ? (
                                <Table>
                                  <TableHeader>
              <TableRow>
                                      <TableHead>Raporlayan</TableHead>
                                      <TableHead>Sebep</TableHead>
                                      <TableHead>Tarih</TableHead>
                                      <TableHead>Durum</TableHead>
                                      <TableHead className="text-right">İşlemler</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {reportsDataAyse.map((report) => (
                                      <TableRow key={report.id}>
                                        <TableCell>{report.reporter}</TableCell>
                                        <TableCell>{report.reason}</TableCell>
                                        <TableCell>{report.date}</TableCell>
                <TableCell>
                                          <Badge className={
                                            report.status === "Çözüldü" ? "bg-green-500" : 
                                            report.status === "İncelemede" ? "bg-yellow-500" :
                                            "bg-gray-500"
                                          }>
                                            {report.status}
                                          </Badge>
                </TableCell>
                <TableCell className="text-right">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="outline" size="sm">Detay</Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[600px]">
                                              <DialogHeader>
                                                <DialogTitle>Rapor Detayı</DialogTitle>
                                              </DialogHeader>
                                              <div className="py-4 space-y-3">
                                                <Card>
                                                  <CardContent className="p-6">
                                                    <div className="space-y-4">
                                                      <div className="flex justify-between items-center">
                                                        <h3 className="font-medium text-lg">Rapor #{report.id}</h3>
                                                        <Badge className={
                                                          report.status === "Çözüldü" ? "bg-green-500" : 
                                                          report.status === "İncelemede" ? "bg-yellow-500" :
                                                          "bg-gray-500"
                                                        }>
                                                          {report.status}
                                                        </Badge>
                                                      </div>
                                                      <Separator />
                                                      <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                          <span className="text-sm font-medium">Raporlayan:</span>
                                                          <p className="text-sm">{report.reporter}</p>
                                                        </div>
                                                        <div>
                                                          <span className="text-sm font-medium">Tarih:</span>
                                                          <p className="text-sm">{report.date}</p>
                                                        </div>
                                                        <div>
                                                          <span className="text-sm font-medium">Sebep:</span>
                                                          <p className="text-sm">{report.reason}</p>
                                                        </div>
                                                        <div>
                                                          <span className="text-sm font-medium">İnceleyen Admin:</span>
                                                          <p className="text-sm">{
                                                            report.status === "Çözüldü" ? "Mehmet Aydın" : 
                                                            report.status === "İncelemede" ? "Ali Veli" :
                                                            "-"
                                                          }</p>
                                                        </div>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Detaylı Açıklama:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.id === "1" ? 
                                                            "Kullanıcı tenis etkinliğine geç katılım sağladı ve diğer katılımcıları bekletmeden 30 dakika sonra etkinliği önceden haber vermeden terk etti. Bu durum etkinlik düzenini bozdu ve diğer katılımcıların şikayetine sebep oldu." : 
                                                             report.id === "2" ? 
                                                              "Kullanıcı, halı saha maçı sırasında diğer katılımcılara karşı kaba ve saldırgan davranışlar sergiledi. Hakaret içeren ifadeler kullandı ve sportmenlik dışı hareketlerde bulundu." :
                                                              "Kullanıcı yoga etkinliğinde belirtilen kıyafet ve ekipman kurallarına uymadı. Etkinlik sırasında telefonla konuşarak diğer katılımcıların dikkatını dağıttı."}
                                                        </p>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Yapılan İşlem:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.status === "Çözüldü" ? 
                                                            "Kullanıcıyla görüşme yapıldı ve davranışı hakkında uyarı verildi. Kullanıcı bir ay süreyle gözlem altında tutulacak." : 
                                                            report.status === "İncelemede" ? 
                                                            "Kullanıcı ile iletişime geçildi. Olay hakkında detaylı bilgi alınıyor. Diğer katılımcılarla görüşmeler yapılıyor." : 
                                                            "Henüz bir işlem yapılmadı."}
                                                        </p>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Sonuç:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.status === "Çözüldü" ? 
                                                            "Kullanıcı hatasını kabul etti ve özür diledi. Benzer davranışları tekrarlamamayı taahhüt etti. Kullanıcıya bir aylık gözetim süresi verildi." : 
                                                            report.status === "İncelemede" ? 
                                                            "Henüz sonuçlanmadı. İnceleme süreci devam ediyor." : 
                                                            "İnceleme henüz başlatılmadı."}
                                                        </p>
                                                      </div>
                                                      <Separator />
                                                      <div>
                                                        <span className="text-sm font-medium">Admin Mesajı:</span>
                                                        <p className="text-sm mt-1">
                                                          {report.status === "Çözüldü" ? 
                                                            "Bu rapor değerlendirilmiş ve gerekli işlemler yapılmıştır. Kullanıcı gözetim altındadır ve benzer davranışların tekrarı durumunda daha ciddi yaptırımlar uygulanacaktır." : 
                                                            report.status === "İncelemede" ? 
                                                            "Şikayet eden kullanıcı ve diğer katılımcılarla görüşmeler yapıldı. Geç katılım ve erken ayrılmanın etkinlik düzenine etkisi inceleniyor. 24 saat içinde sonuçlandırılacaktır." : 
                                                            "Bu rapor henüz değerlendirilmemiştir. İş yükü nedeniyle inceleme süresi uzayabilir."}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              </div>
                                              <DialogFooter>
                                                <DialogClose asChild>
                                                  <Button variant="outline">Kapat</Button>
                                                </DialogClose>
                                              </DialogFooter>
                                            </DialogContent>
                                          </Dialog>
                </TableCell>
              </TableRow>
                                    ))}
            </TableBody>
          </Table>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-500">Bu kullanıcı hakkında rapor bulunmamaktadır.</p>
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Kapat</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
        </CardContent>
              <CardFooter className="px-6 pt-0 pb-4 flex justify-center">
                <div className="text-xs text-gray-500 mt-4">
                  Son işlem: {new Date(selectedUser.updated_at).toLocaleString("tr-TR")}
                </div>
              </CardFooter>
      </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground/60" />
              <p>Kullanıcı detaylarını görmek için<br />bir kullanıcı seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 