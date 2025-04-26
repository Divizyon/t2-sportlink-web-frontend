"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/lib/hooks/useAuth";
import type { UserType } from "@/interfaces/user";
import adminService from "@/lib/services/adminService";
import UserList from "@/components/users/UserList";
import type { DateRange } from "react-day-picker";

export default function UsersPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated, hasRequiredRole } = useAuth('admin');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("username");
  const [selectedColumns, setSelectedColumns] = useState<{
    email: boolean;
    phone: boolean;
    role: boolean;
    first_name: boolean;
    last_name: boolean;
  }>({
    email: true,
    phone: true,
    role: true,
    first_name: true,
    last_name: true
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
  const [newUserForm, setNewUserForm] = useState({
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

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // Kullanıcı verilerini API'den gelen formattan UI formatına dönüştür
  const convertApiUserToUiFormat = (apiUser: any): UserType => {
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
    
    return {
      id: apiUser.id?.toString() || "",
      username: apiUser.username || "",
      password: "********",
      email: apiUser.email || "",
      first_name: apiUser.first_name || "",
      last_name: apiUser.last_name || "",
      phone: apiUser.phone || "",
      birthDate: "",
      profile_picture: apiUser.profile_picture || null,
      default_location_latitude: apiUser.default_location_latitude || 0,
      default_location_longitude: apiUser.default_location_longitude || 0,
      role: apiUser.role || "user",
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
    if (!isAuthenticated || !hasRequiredRole) {
      return;
    }
    
    try {
      setLoading(true);
      
      const params: {
        page: number;
        limit: number;
        query?: string;
        searchField?: string;
      } = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (searchQuery.length > 2) {
        params.query = searchQuery;
        params.searchField = searchField;
      }
      
      const response = await adminService.listAllUsers(params);
      
      if (response.success) {
        const formattedUsers: UserType[] = response.data.users.map(convertApiUserToUiFormat);
        setUsers(formattedUsers);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: "Hata",
          description: "Kullanıcılar yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Kullanıcılar yüklenirken hata:", error);
      
      if (error.status === 403) {
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
    if (!authLoading && isAuthenticated && hasRequiredRole) {
      fetchUsers();
    }
  }, [pagination.page, pagination.limit, searchQuery, searchField, authLoading, isAuthenticated, hasRequiredRole]);

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
        
        fetchUsers();
        
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

  const handleColumnToggle = (column: keyof typeof selectedColumns) => {
    setSelectedColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleUserClick = async (user: UserType) => {
    setSelectedUser(user);
    setEditingUser(user);
    
    try {
      await fetchUserDetails(user.id);
    } catch (error) {
      console.error("Kullanıcı detayları alınırken hata:", error);
    }
  };

  // Kullanıcı detaylarını yükle
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await adminService.getUserDetails(userId);
      
      if (response.success) {
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
      console.error("Kullanıcı detayları yükleme hatası:", error);
      toast({
        title: "Hata",
        description: error?.message || "Kullanıcı detayları yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (filters: {
    role?: string;
    dateRange?: DateRange | undefined;
    searchQuery?: string;
    isActive?: boolean;
  }) => {
    if (filters.role) {
      setSearchField("role");
      setSearchQuery(filters.role);
    }
    if (filters.searchQuery) {
      setSearchQuery(filters.searchQuery);
    }
    if (filters.isActive !== undefined) {
      // Aktif/pasif kullanıcı filtreleme mantığı buraya eklenecek
    }
  };

  const handleFilterReset = () => {
    setSearchQuery("");
    setSearchField("username");
    // Diğer filtreleri sıfırla
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

  if (hasRequiredRole) {
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
      <UserList
        users={users}
        selectedUser={selectedUser}
        selectedColumns={selectedColumns}
        searchQuery={searchQuery}
        newUserForm={newUserForm}
        onSearchChange={setSearchQuery}
        onColumnToggle={handleColumnToggle}
        onUserClick={handleUserClick}
        onDeleteUser={handleDeleteUser}
        onCreateUser={handleCreateUser}
        onNewUserFormChange={(field, value) => setNewUserForm(prev => ({ ...prev, [field]: value }))}
        onFilterChange={handleFilterChange}
        onFilterReset={handleFilterReset}
      />
    </div>
  );
} 