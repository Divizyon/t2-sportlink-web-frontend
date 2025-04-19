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

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || user.email.toLowerCase().includes(query) || user.username.toLowerCase().includes(query);
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

  return (
    <div className="flex h-screen">
      {/* Sol taraf - Kullanıcı listesi (2/3) */}
      <div className="w-2/3 p-6 space-y-6 overflow-auto border-r">
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

      {/* Sağ taraf - Kullanıcı detayları (1/3) */}
      <div className="w-1/3 p-4 overflow-auto">
        {selectedUser ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-semibold">Profil</h2>
                </div>
                <div className="flex items-center">
                  <Avatar className="mr-2">
                    <AvatarImage src={selectedUser.profile_picture || ""} />
                    <AvatarFallback>{selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.first_name} {selectedUser.last_name}</CardTitle>
                    <CardDescription className="text-xs">Kullanıcı Bilgileri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Separator className="mb-4" />
                  
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">E-posta</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Telefon</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{selectedUser.phone}</span>
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Doğum Tarihi</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{new Date(selectedUser.birthDate).toLocaleDateString("tr-TR")}</span>
                      </div>
                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Rol</span>
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
                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Kayıt Tarihi</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{new Date(selectedUser.created_at).toLocaleDateString("tr-TR")}</span>
                      </div>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Son Güncelleme</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{new Date(selectedUser.updated_at).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {/* Spor Dalları - Tıklanabilir */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Spor Dalları</span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[180px] justify-end">
                          {selectedUser.userSports && selectedUser.userSports.length > 0 ? (
                            <>
                              {selectedUser.userSports.slice(0, 2).map((sport, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{sport}</Badge>
                              ))}
                              {selectedUser.userSports.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{selectedUser.userSports.length - 2}</Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline">0</Badge>
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
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Oluşturduğu Etkinlikler</span>
                        </div>
                        <Badge variant="outline">
                          {selectedUser.id === "1" ? createdEventsData.length : selectedUser.createdEvents || 0}
                        </Badge>
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
                                                </div>
                                                <Separator />
                                                <div>
                                                  <span className="text-sm font-medium">Açıklama:</span>
                                                  <p className="text-sm mt-1">
                                                    Bu etkinlik {selectedUser.first_name} {selectedUser.last_name} tarafından oluşturulmuştur.
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
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Katıldığı Etkinlikler</span>
                        </div>
                        <Badge variant="outline">
                          {selectedUser.id === "1" ? participatedEventsData.length : selectedUser.eventParticipations || 0}
                        </Badge>
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
                                <TableHead className="text-right">İşlemler</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {participatedEventsData.map((event) => (
                                <TableRow key={event.id}>
                                  <TableCell>{event.name}</TableCell>
                                  <TableCell>{event.date}</TableCell>
                                  <TableCell>{event.location}</TableCell>
                                  <TableCell>
                                    <Badge className={event.status === "Katıldı" ? "bg-green-500" : "bg-yellow-500"}>
                                      {event.status}
                                    </Badge>
                                  </TableCell>
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
                                                  <Badge className={event.status === "Katıldı" ? "bg-green-500" : "bg-yellow-500"}>
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
                                                </div>
                                                <Separator />
                                                <div>
                                                  <span className="text-sm font-medium">Açıklama:</span>
                                                  <p className="text-sm mt-1">
                                                    Bu etkinliğe {event.status === "Katıldı" ? "katılım sağladınız" : "katılım onayınız bekleniyor"}.
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
                  
                  {/* Hakkında Raporlar - Tıklanabilir */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Hakkında Raporlar</span>
                        </div>
                        <Badge variant="outline">
                          {selectedUser.id === "1" ? reportsDataAhmet.length : 
                           selectedUser.id === "2" ? reportsDataAyse.length : 
                           selectedUser.reportsReceived || 0}
                        </Badge>
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
                                    <Badge className={report.status === "Çözüldü" ? "bg-green-500" : "bg-yellow-500"}>
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
                                                  <Badge className={report.status === "Çözüldü" ? "bg-green-500" : "bg-yellow-500"}>
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
                                    <Badge className="bg-yellow-500">
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
                                                  <Badge className="bg-yellow-500">
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
                                                </div>
                                                <Separator />
                                                <div>
                                                  <span className="text-sm font-medium">Detaylı Açıklama:</span>
                                                  <p className="text-sm mt-1">
                                                    Kullanıcı Ayşe Demir tenis etkinliğine geç katılım sağladı ve diğer katılımcıları bekletmeden 30 dakika sonra etkinliği önceden haber vermeden terk etti. Bu durum etkinlik düzenini bozdu ve diğer katılımcıların şikayetine sebep oldu.
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
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges} className="w-full">Kaydet</Button>
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