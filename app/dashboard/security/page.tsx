"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, UserX, MessageSquare, Search, Filter, User, Mail, Calendar, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface UserData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  lastLogin?: string;
  status: string;
  phone?: string;
  createdAt?: string;
  location?: string;
  failedLoginAttempts?: number;
  lastFailedLogin?: string;
}

interface BlockedUser {
  id: string;
  username: string;
  reason: string;
  date: string;
  admin: string;
  adminId: string;
}

export default function SecurityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogTypes, setSelectedLogTypes] = useState<string[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Örnek kullanıcı verileri
  const usersData: Record<string, UserData> = {
    "user123": {
      id: "user123",
      username: "user123",
      fullName: "Ali Yılmaz",
      email: "ali.yilmaz@example.com",
      avatar: "/images/avatars/user123.jpg",
      role: "Kullanıcı",
      lastLogin: "15 Nisan 2024, 10:23",
      status: "Engellendi",
      phone: "+90 555 123 4567",
      createdAt: "2023-12-15",
      location: "İstanbul, Türkiye",
      failedLoginAttempts: 5,
      lastFailedLogin: "15 Nisan 2024, 09:45"
    },
    "user456": {
      id: "user456",
      username: "user456",
      fullName: "Mehmet Kaya",
      email: "mehmet.kaya@example.com",
      avatar: "/images/avatars/user456.jpg",
      role: "Kullanıcı",
      lastLogin: "14 Nisan 2024, 16:45",
      status: "Engellendi",
      phone: "+90 555 987 6543",
      createdAt: "2024-01-08",
      location: "Ankara, Türkiye",
      failedLoginAttempts: 3,
      lastFailedLogin: "14 Nisan 2024, 14:30"
    },
    "admin1": {
      id: "admin1",
      username: "admin1",
      fullName: "Ayşe Demir",
      email: "ayse.demir@example.com",
      avatar: "/images/avatars/admin1.jpg",
      role: "Admin",
      lastLogin: "16 Nisan 2024, 09:15",
      status: "Aktif",
      phone: "+90 555 444 3333",
      createdAt: "2023-06-01",
      location: "İzmir, Türkiye"
    },
    "admin2": {
      id: "admin2",
      username: "admin2",
      fullName: "Can Yücel",
      email: "can.yucel@example.com",
      avatar: "/images/avatars/admin2.jpg",
      role: "Admin",
      lastLogin: "15 Nisan 2024, 14:30",
      status: "Aktif",
      phone: "+90 555 222 1111",
      createdAt: "2023-05-12",
      location: "Antalya, Türkiye"
    }
  };

  const blockedUsers: BlockedUser[] = [
    {
      id: "user123",
      username: "user123",
      reason: "Spam",
      date: "15 Nisan 2024",
      admin: "Ayşe Demir",
      adminId: "admin1"
    },
    {
      id: "user456",
      username: "user456",
      reason: "Kötüye Kullanım",
      date: "14 Nisan 2024",
      admin: "Can Yücel",
      adminId: "admin2"
    }
  ];

  const applyFilter = () => {
    setIsFiltering(selectedLogTypes.length > 0);
    // Filtre işlemleri burada uygulanacak
  };

  const clearFilter = () => {
    setSelectedLogTypes([]);
    setIsFiltering(false);
  };

  const handleLogTypeChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedLogTypes(prev => [...prev, value]);
    } else {
      setSelectedLogTypes(prev => prev.filter(item => item !== value));
    }
  };

  const getActiveFilterCount = () => {
    return selectedLogTypes.length;
  };

  const showUserDetails = (userId: string) => {
    const user = usersData[userId];
    if (user) {
      setSelectedUser(user);
      setShowUserDialog(true);
    }
  };

  const showAdminDetails = (adminId: string) => {
    const admin = usersData[adminId];
    if (admin) {
      setSelectedUser(admin);
      setShowAdminDialog(true);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center mb-2">
            <CardTitle>Loglar</CardTitle>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-4 w-4" />
                  Filtrele
                  {isFiltering && <Badge variant="secondary" className="ml-1 h-5 px-1">{getActiveFilterCount()}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Log Filtreleri</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="log-type" className="text-base">Olay Türü</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="critical" 
                            checked={selectedLogTypes.includes("critical")} 
                            onCheckedChange={(checked) => handleLogTypeChange("critical", checked as boolean)}
                          />
                          <Label htmlFor="critical" className="font-normal">Kritik</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="info" 
                            checked={selectedLogTypes.includes("info")} 
                            onCheckedChange={(checked) => handleLogTypeChange("info", checked as boolean)}
                          />
                          <Label htmlFor="info" className="font-normal">Bilgi</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="warning" 
                            checked={selectedLogTypes.includes("warning")} 
                            onCheckedChange={(checked) => handleLogTypeChange("warning", checked as boolean)}
                          />
                          <Label htmlFor="warning" className="font-normal">Uyarı</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="date-range" className="text-base">Tarih Aralığı</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="today" 
                            checked={selectedLogTypes.includes("today")} 
                            onCheckedChange={(checked) => handleLogTypeChange("today", checked as boolean)}
                          />
                          <Label htmlFor="today" className="font-normal">Bugün</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="thisWeek" 
                            checked={selectedLogTypes.includes("thisWeek")} 
                            onCheckedChange={(checked) => handleLogTypeChange("thisWeek", checked as boolean)}
                          />
                          <Label htmlFor="thisWeek" className="font-normal">Bu Hafta</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="thisMonth" 
                            checked={selectedLogTypes.includes("thisMonth")} 
                            onCheckedChange={(checked) => handleLogTypeChange("thisMonth", checked as boolean)}
                          />
                          <Label htmlFor="thisMonth" className="font-normal">Bu Ay</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={clearFilter}>Filtreleri Temizle</Button>
                  <SheetClose asChild>
                    <Button onClick={applyFilter}>Uygula</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Log ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Olay</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                  Şüpheli Giriş Denemesi
                </TableCell>
                <TableCell>15 Nisan 2024</TableCell>
                <TableCell>
                  <Badge variant="destructive">Kritik</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  Güvenlik Güncellemesi
                </TableCell>
                <TableCell>14 Nisan 2024</TableCell>
                <TableCell>
                  <Badge variant="secondary">Bilgi</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Engellenen Kullanıcılar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Engelleyen Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div
                      onClick={() => showUserDetails(user.id)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={usersData[user.id]?.avatar} />
                        <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                          {usersData[user.id]?.fullName.split(" ").map(name => name[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="group">
                        <span className="text-sm font-medium text-foreground relative inline-block">
                          {user.username}
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.reason}</TableCell>
                  <TableCell>{user.date}</TableCell>
                  <TableCell>
                    <div
                      onClick={() => showAdminDetails(user.adminId)}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={usersData[user.adminId]?.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {usersData[user.adminId]?.fullName.split(" ").map(name => name[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="group">
                        <span className="text-sm font-medium text-foreground relative inline-block">
                          {user.admin}
                          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kullanıcı Detay Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kullanıcı Bilgileri</DialogTitle>
            <DialogDescription>
              Engellenen kullanıcının detaylı bilgileri
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0 pb-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-md">
                  <div className="flex items-center gap-4 p-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                      <AvatarFallback className="text-lg bg-rose-100 text-rose-700">
                        {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{selectedUser.fullName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>@{selectedUser.username}</span>
                        <Badge variant="destructive">
                          Engellendi
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="px-4 pt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedUser.location || "Konum belirtilmemiş"}</span>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-1 text-amber-500" />
                      Güvenlik Bilgileri
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-800">Engelleme Bilgileri</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-amber-700 pl-6">
                          <div>Engelleme Nedeni:</div>
                          <div className="font-medium">
                            {blockedUsers.find(u => u.id === selectedUser.id)?.reason || "Belirtilmemiş"}
                          </div>
                          <div>Engelleme Tarihi:</div>
                          <div className="font-medium">
                            {blockedUsers.find(u => u.id === selectedUser.id)?.date || "Belirtilmemiş"}
                          </div>
                          <div>Engelleyen Admin:</div>
                          <div className="font-medium">
                            {blockedUsers.find(u => u.id === selectedUser.id)?.admin || "Belirtilmemiş"}
                          </div>
                        </div>
                      </div>
                      
                      {selectedUser.failedLoginAttempts && selectedUser.failedLoginAttempts > 0 && (
                        <div className="bg-rose-50 border border-rose-200 rounded-md p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-rose-600" />
                            <span className="font-medium text-rose-800">Şüpheli Giriş Aktivitesi</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-rose-700 pl-6">
                            <div>Başarısız Giriş Sayısı:</div>
                            <div className="font-medium">{selectedUser.failedLoginAttempts}</div>
                            <div>Son Başarısız Giriş:</div>
                            <div className="font-medium">{selectedUser.lastFailedLogin}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.phone || '-'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-gray-700">Rol</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.role}</span>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-teal-500" />
                          <span className="text-sm font-medium text-gray-700">Son Giriş</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.lastLogin}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Detay Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Bilgileri</DialogTitle>
            <DialogDescription>
              İşlemi gerçekleştiren admin detayları
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md">
                  <div className="flex items-center gap-4 p-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                      <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                        {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{selectedUser.fullName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>@{selectedUser.username}</span>
                        <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="px-4 pt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedUser.location || "Konum belirtilmemiş"}</span>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">İletişim Bilgileri</h3>
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
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.phone || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-teal-500" />
                          <span className="text-sm font-medium text-gray-700">Son Giriş</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{selectedUser.lastLogin}</span>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAdminDialog(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 