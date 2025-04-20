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
import adminService from "@/lib/services/adminService";
import type { AdminUser, CreateUserData, UpdateRoleData } from "@/lib/services/adminService";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/lib/hooks/useAuth";

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
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated, hasRequiredRole } = useAuth('admin');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"username" | "email" | "first_name" | "last_name">("username");
  const [selectedFilters, setSelectedFilters] = useState<{
    role: string[];
  }>({
    role: []
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  
  // Kullanıcı rolleri için form state
  const [editForm, setEditForm] = useState<{
    userId: string;
    role: string;
  }>({
    userId: "",
    role: ""
  });
  
  // Yeni kullanıcı formu için state
  const [newUserForm, setNewUserForm] = useState<CreateUserData>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "user",
    default_location_latitude: 41.0082,
    default_location_longitude: 28.9784
  });

  // Kullanıcı doğrulamasını kontrol et
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Kullanıcı giriş yapmamışsa, toast ile bildir
      toast({
        title: "Yetki Hatası",
        description: "Bu sayfayı görüntülemek için giriş yapmanız gerekiyor",
        variant: "destructive",
      });
    } else if (!authLoading && !hasRequiredRole) {
      // Kullanıcı giriş yapmış ama admin değilse, toast ile bildir
      toast({
        title: "Yetki Hatası",
        description: "Bu sayfayı görüntülemek için admin yetkisine sahip olmanız gerekiyor",
        variant: "destructive",
      });
    }
  }, [authLoading, isAuthenticated, hasRequiredRole, toast]);

  // Kullanıcı verilerini API'den gelen formattan UI formatına dönüştür
  const convertApiUserToUiFormat = (apiUser: any): UserType => {
    // Debug için konsola rol bilgisini yazdıralım
    console.log(`Kullanıcı ${apiUser.username} rolü:`, apiUser.role);
    
    // Backend'den gelen tarihleri doğru bir şekilde biçimlendir
    let formattedCreatedAt = "";
    try {
      formattedCreatedAt = apiUser.created_at ? new Date(apiUser.created_at).toISOString() : "";
    } catch (e) {
      console.error("Tarih formatı hatası:", e);
      formattedCreatedAt = "";
    }
    
    let formattedUpdatedAt = "";
    try {
      formattedUpdatedAt = apiUser.updated_at ? new Date(apiUser.updated_at).toISOString() : "";
    } catch (e) {
      console.error("Tarih formatı hatası:", e);
      formattedUpdatedAt = "";
    }
    
    // Eksik alanlar için varsayılan değerler kullan
    return {
      id: apiUser.id?.toString() || "",
      username: apiUser.username || "",
      password: "********",
      email: apiUser.email || "",
      first_name: apiUser.first_name || "",
      last_name: apiUser.last_name || "",
      phone: apiUser.phone || "",
      birthDate: "", // Backend'de bu alan yok
      profile_picture: apiUser.profile_picture || null,
      default_location_latitude: apiUser.default_location_latitude || 0,
      default_location_longitude: apiUser.default_location_longitude || 0,
      role: apiUser.role || "user", // Varsayılan rol user
      created_at: formattedCreatedAt,
      updated_at: formattedUpdatedAt,
      userSports: [],
      interests: [],
      createdEvents: 0,
      eventParticipations: 0,
      evaluationsGiven: 0,
      evaluationsReceived: 0,
      reportsGiven: 0,
      reportsReceived: 0,
      notifications: 0,
      adminActions: 0
    };
  };

  // Kullanıcıları yükle
  const fetchUsers = async () => {
    // Eğer kullanıcının yetkisi yoksa veya giriş yapmamışsa, hemen çık
    if (!isAuthenticated || !hasRequiredRole) {
      return;
    }
    
    try {
      setLoading(true);
      console.log("Dashboard/users: Kullanıcılar yükleniyor...");
      
      // Token kontrolü - debug için
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log("Dashboard/users - Token mevcut:", !!token);
      console.log("Dashboard/users - Kullanıcı mevcut:", !!user);
      
      if (user) {
        try {
          const userData = JSON.parse(user);
          console.log("Dashboard/users - Kullanıcı rolü:", userData.role);
        } catch (e) {
          console.error("Dashboard/users - Kullanıcı bilgisi parse edilemedi");
        }
      }
      
      const params: {
        page: number;
        limit: number;
        query?: string;
        searchField?: string;
      } = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Arama değeri 2 karakterden uzunsa ekle
      if (searchQuery.length > 2) {
        params.query = searchQuery;
        params.searchField = searchField;
      }
      
      console.log("Dashboard/users - API isteği gönderiliyor:", params);
      
      const response = await adminService.listAllUsers(params);
      
      console.log("Dashboard/users - API yanıtı:", response);
      
      if (response.success) {
        // Backend'den gelen kullanıcıları UI formatına çevir
        const formattedUsers: UserType[] = response.data.users.map(convertApiUserToUiFormat);
        
        console.log("Dashboard/users - Kullanıcılar formatlandı:", formattedUsers.length);
        
        setUsers(formattedUsers);
        setPagination(response.data.pagination);
      } else {
        console.error("Dashboard/users - API başarısız yanıt:", response);
        
        toast({
          title: "Hata",
          description: "Kullanıcılar yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Dashboard/users - Kullanıcılar yüklenirken hata:", error);
      
      // Hata detaylarını kontrol et
      if (error.status === 403) {
        console.error("Dashboard/users - Yetki hatası (403)");
        toast({
          title: "Yetki Hatası",
          description: "Bu işlemi yapmak için yetkiniz bulunmuyor. Lütfen admin hesabıyla giriş yapın.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: error.message || "Kullanıcılar yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ve filtreler değiştiğinde kullanıcıları yükle
  useEffect(() => {
    // Eğer kimlik doğrulama tamamlandıysa ve gerekli yetkiler varsa, kullanıcıları getir
    if (!authLoading && isAuthenticated && hasRequiredRole) {
      fetchUsers();
    }
  }, [pagination.page, pagination.limit, searchQuery, searchField, authLoading, isAuthenticated, hasRequiredRole]);

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedDetailType, setSelectedDetailType] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // Seçili kullanıcı değiştiğinde editForm'u güncelle
  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        userId: selectedUser.id,
        role: selectedUser.role
      });
    }
  }, [selectedUser]);

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await adminService.deleteUser(id);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Kullanıcı başarıyla silindi",
        });
        
        // Kullanıcı listesini güncelle
        fetchUsers();
      } else {
        toast({
          title: "Hata",
          description: "Kullanıcı silinemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Kullanıcı silme hatası:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!editForm.userId || !editForm.role) {
        toast({
          title: "Uyarı",
          description: "Kullanıcı ID veya rol bilgisi eksik",
          variant: "destructive",
        });
        return;
      }
      
      const response = await adminService.updateUserRole(editForm.userId, {
        role: editForm.role
      });
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Kullanıcı rolü başarıyla güncellendi",
        });
        
        // Kullanıcı listesini güncelle
        fetchUsers();
      } else {
        toast({
          title: "Hata",
          description: "Kullanıcı rolü güncellenemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Kullanıcı rolü güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı rolü güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };
  
  // Yeni kullanıcı oluşturma
  const handleCreateUser = async () => {
    try {
      // Form validasyonu
      if (!newUserForm.username || !newUserForm.email || !newUserForm.password || 
          !newUserForm.first_name || !newUserForm.last_name || !newUserForm.phone) {
        toast({
          title: "Uyarı",
          description: "Lütfen tüm zorunlu alanları doldurun",
          variant: "destructive",
        });
        return;
      }
      
      const response = await adminService.createUser(newUserForm);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Yeni kullanıcı başarıyla oluşturuldu",
        });
        
        // Kullanıcı listesini güncelle
        fetchUsers();
        
        // Formu temizle
        setNewUserForm({
          username: "",
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          phone: "",
          role: "user",
          default_location_latitude: 41.0082,
          default_location_longitude: 28.9784
        });
      } else {
        toast({
          title: "Hata",
          description: "Kullanıcı oluşturulamadı",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Kullanıcı oluşturma hatası:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
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

  // Kullanıcı detaylarını yükle
  const fetchUserDetails = async (userId: string) => {
    try {
      setDetailLoading(true);
      const response = await adminService.getUserDetails(userId);
      
      console.log("Dashboard/users - Kullanıcı detayları API yanıtı:", response);
      
      if (response.success) {
        // API'den gelen kullanıcı verilerini UI formatına dönüştür
        const formattedUser = convertApiUserToUiFormat(response.data);
        setSelectedUser(formattedUser);
      } else {
        toast({
          title: "Hata",
          description: "Kullanıcı detayları yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Dashboard/users - Kullanıcı detayları yükleme hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı detayları yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const getTotalSelectedFilters = () => {
    return selectedFilters.role.length;
  };

  // Kullanıcı tıklandığında
  const handleUserClick = async (user: UserType) => {
    console.log("Seçilen kullanıcı:", user.username, "Role:", user.role);
    setSelectedUser(user);
    setEditingUser(user);
    
    // Kullanıcı bilgilerini backend'den al ve ID'yi editForm'a kaydet
    try {
      await fetchUserDetails(user.id);
    } catch (error) {
      console.error("Kullanıcı detayları alınırken hata:", error);
    }
  };

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Tarih geçerli mi kontrol et
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      // Türkçe formatında tarih döndür
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Tarih formatı hatası:", error);
      return '-';
    }
  };

  // Auth yüklenirken veya kullanıcının yetkisi yoksa, uygun bekleme/hata ekranı göster
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <UserIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Giriş Yapılmadı</h2>
          <p className="mb-4">Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.</p>
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="w-full"
          >
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  if (!hasRequiredRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Yetersiz Yetki</h2>
          <p className="mb-4">Bu sayfayı görüntülemek için admin yetkisine sahip olmanız gerekmektedir.</p>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({...newUserForm, username: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    Ad
                  </Label>
                  <Input
                    id="firstName"
                    value={newUserForm.first_name}
                    onChange={(e) => setNewUserForm({...newUserForm, first_name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Soyad
                  </Label>
                  <Input
                    id="lastName"
                    value={newUserForm.last_name}
                    onChange={(e) => setNewUserForm({...newUserForm, last_name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol
                  </Label>
                  <Select 
                    value={newUserForm.role || "user"}
                    onValueChange={(value) => setNewUserForm({...newUserForm, role: value})}
                  >
                    <SelectTrigger className="col-span-3">
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  İptal
                </Button>
                <Button type="submit" onClick={handleCreateUser}>
                  Oluştur
                </Button>
              </DialogFooter>
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
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturma Tarihi</TableHead>
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
                    handleUserClick(user);
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
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || '-'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge className={
                      user.role === "superadmin" 
                        ? "bg-red-500 hover:bg-red-600"
                        : user.role === "admin" 
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-green-500 hover:bg-green-600"
                    }>
                      {user.role === "superadmin" ? "Süper Admin" : user.role === "admin" ? "Admin" : "Üye"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
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
                          selectedUser.role === "superadmin" 
                            ? "bg-red-500 hover:bg-red-600"
                            : selectedUser.role === "admin" 
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-green-500 hover:bg-green-600"
                        }>
                          {selectedUser.role === "superadmin" ? "Süper Admin" : selectedUser.role === "admin" ? "Admin" : "Üye"}
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
                          <span className="text-sm font-medium text-gray-700">Oluşturma Tarihi</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">
                          {formatDate(selectedUser.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Rol Yönetimi</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Kullanıcı Rolü:</p>
                        <Badge className={
                          selectedUser?.role === "superadmin" ? "bg-red-500" : 
                          selectedUser?.role === "admin" ? "bg-blue-500" : "bg-green-500"
                        }>
                          {selectedUser?.role === "superadmin" ? "Süper Admin" : 
                           selectedUser?.role === "admin" ? "Admin" : "Kullanıcı"}
                        </Badge>
                      </div>
                      
                      {/* Rol değiştirme alanı */}
                      <div className="flex items-center gap-2">
                        <Select 
                          value={editForm.role || "user"}
                          onValueChange={(value) => setEditForm({...editForm, role: value})}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Rol seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Kullanıcı</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Süper Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleSaveChanges} className="w-full bg-green-600 hover:bg-green-700 text-sm h-9">
                          Rolü Güncelle
                        </Button>
                      </div>
                    </div>
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
                          {formatDate(selectedUser.updated_at)}
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
                                    <TableRow key={event.id}>
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
                  Son işlem: {formatDate(selectedUser.updated_at)}
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