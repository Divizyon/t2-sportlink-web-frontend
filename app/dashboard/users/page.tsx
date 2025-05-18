"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/lib/hooks";
import { toast } from "@/components/ui/use-toast";
import UserList from "@/components/users/UserList";
import UserDetails from "@/components/users/UserDetails";
import type { UserType } from "@/interfaces/user";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const {
    users,
    setUsers,
    setUserAndUsers,
    selectedUser,
    error,
    getUsers,
    updateUser,
    deleteUser,
    createUser,
    selectUser,
    totalUsers,
    currentPage,
    pageSize,
  } = useUsers();

  // Local state for filtering and column visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  // Sabit column yapılandırması
  const selectedColumns = {
    email: true,
    phone: true,
    role: true,
    first_name: true,
    last_name: true,
  };

  // Load users on component mount
  useEffect(() => {
    console.log('Dashboard/users sayfası yükleniyor, kullanıcıları getiriyoruz...');

    getUsers()
      .then(() => {
        console.log('Kullanıcılar başarıyla yüklendi');
      })
      .catch((error) => {
        console.error('Kullanıcılar yüklenirken beklenmeyen hata:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Kullanıcılar listelenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        });
      });
  }, [getUsers]);

  // Show error messages
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error,
      });
    }
  }, [error]);

  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    getUsers({ searchQuery: value });
  };

  // Handle user click for details view
  const handleUserClick = (user: UserType) => {
    selectUser(user);
  };

  // Handle user delete
  const handleDeleteUser = async (id: string) => {
    const result = await deleteUser(id);
    if (result.success) {
      // Toast mesajı göster
      toast({
        title: "Başarılı",
        description: result.message || "Kullanıcı başarıyla silindi",
      });
      
      // Silme işlemi başarılı olduğunda, kullanıcı listesini mevcut filtreleri koruyarak yeniden çek
      getUsers({
        page: currentPage,
        searchQuery,
        ...(roleFilter && { role: roleFilter })
      });
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData: Partial<UserType>) => {
    // Sadece local state güncellenecek, API çağrısı yapılmayacak
    // Eğer başka alanlar güncellenecekse, burada ek API endpointi eklenmeli
    // Şimdilik sadece rol değişikliği için local güncelleme yeterli
    // toast veya başka bir bildirim de gösterilebilir
  };

  // Handle user creation
  const handleCreateUser = async (userData: Partial<UserType>) => {
    try {
      const result = await createUser(userData);
      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.message || "Kullanıcı başarıyla oluşturuldu",
        });
        return result;
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: result.message || "Kullanıcı oluşturulurken bir hata oluştu",
        });
        throw new Error(result.message || "Kullanıcı oluşturulurken bir hata oluştu");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Kullanıcı oluşturulurken bir hata oluştu",
      });
      throw error;
    }
  };

  // Handle filter change
  const handleFilterChange = (filters: {
    role?: string | undefined;
    searchQuery?: string | undefined;
    isActive?: boolean | undefined;
  }) => {
    const queryParams: {
      role?: string;
      searchQuery?: string;
      isActive?: boolean;
      page?: number;
    } = {
      page: 1, // Filtre değiştiğinde ilk sayfaya dön
    };

    if (filters.searchQuery) {
      queryParams.searchQuery = filters.searchQuery;
    } else if (searchQuery) {
      queryParams.searchQuery = searchQuery;
    }

    if (filters.role !== undefined) {
      queryParams.role = filters.role;
      setRoleFilter(filters.role); // Update role filter state
      console.log("Ayarlanan rol filtresi:", filters.role);
    } else {
      setRoleFilter(undefined); // Clear role filter state
    }

    if (filters.isActive !== undefined) {
      queryParams.isActive = filters.isActive;
    }

    // Detaylı log
    console.log("Filter değişikliği - Gönderilecek paramlar:", queryParams);

    getUsers(queryParams);
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setSearchQuery("");
    setRoleFilter(undefined); // Clear role filter state
    getUsers({ page: 1 });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    // Mevcut filtreleri de koruyarak sayfa değiştir
    console.log("Sayfa değiştiriliyor:", page);
    
    const currentFilters = {
      page,
      searchQuery,
      // Kullan React state'i, DOM manipülasyonu yerine
      ...(roleFilter && { role: roleFilter })
    };
    
    // Detaylı log
    console.log("Sayfa değişimi - Gönderilecek paramlar:", currentFilters);
    
    // Sayfa değişikliğinde filtre rol parametresi varsa gönder
    getUsers(currentFilters);
  };

  // Kullanıcı listesini ve seçili kullanıcıyı local olarak güncelle
  const updateLocalUser = (updatedUser: UserType) => {
    setUserAndUsers(updatedUser);
  };

  // Backend çağrılarını debug için
  useEffect(() => {
    console.log("Güncel filtre durumu:", {
      page: currentPage,
      roleFilter,
      searchQuery
    });
  }, [currentPage, roleFilter, searchQuery]);

  // Sayfa değiştiğinde veya filtre değiştiğinde hemen React'a bildirmek için referans
  useEffect(() => {
    console.log("Pagination state değişti:", { currentPage, pageSize, totalUsers });
  }, [currentPage, pageSize, totalUsers]);

  return (
    <div className="flex flex-col h-full w-full gap-6 p-4">
      {/* Mobil görünümde ve kullanıcı seçildiğinde */}
      {selectedUser && (
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            className="w-full mb-2"
            onClick={() => selectUser(null)}
          >
            ← Kullanıcı Listesine Dön
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-full gap-6">
        {/* Mobil görünümde kullanıcı seçilince liste gizlensin */}
        <div className={`${selectedUser ? 'hidden md:block' : 'block'} w-full lg:flex-1`}>
          <UserList
            users={users}
            selectedUser={selectedUser}
            selectedColumns={selectedColumns}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onUserClick={handleUserClick}
            onDeleteUser={handleDeleteUser}
            onFilterChange={handleFilterChange}
            onFilterReset={handleFilterReset}
            totalUsers={totalUsers}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Mobil görünümde kullanıcı seçilince sadece detay görünsün */}
        <div className={`${selectedUser ? 'block' : 'hidden md:block'} w-full lg:w-auto lg:min-w-[350px] lg:max-w-[450px]`}>
          <UserDetails
            user={selectedUser}
            onUpdateUser={(userData) => {
              if (userData.id) {
                updateLocalUser(userData);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 