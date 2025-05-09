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
    selectedUser,
    isLoading,
    error,
    getUsers,
    updateUser,
    deleteUser,
    selectUser,
  } = useUsers();

  // Local state for filtering and column visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumns, setSelectedColumns] = useState({
    email: true,
    phone: true,
    role: true,
    first_name: true,
    last_name: true,
  });

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

  // Handle column toggle
  const handleColumnToggle = (column: keyof typeof selectedColumns) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Handle user click
  const handleUserClick = (user: UserType) => {
    selectUser(user);
  };

  // Handle user delete
  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      const result = await deleteUser(id);
      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.message || "Kullanıcı başarıyla silindi",
        });
      }
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData: Partial<UserType>) => {
    if (!userData.id) {
      console.error("Update için kullanıcı ID'si eksik");
      return;
    }

    const result = await updateUser(userData.id, userData);
    if (result.success) {
      toast({
        title: "Başarılı",
        description: result.message || "Kullanıcı başarıyla güncellendi",
      });
    }
  };

  // Handle filter change
  const handleFilterChange = (filters: {
    role?: string | undefined;
    searchQuery?: string | undefined;
    isActive?: boolean | undefined;
  }) => {
    getUsers({
      ...filters,
      searchQuery: filters.searchQuery || searchQuery,
    });
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setSearchQuery("");
    getUsers();
  };

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
            onColumnToggle={handleColumnToggle}
            onUserClick={handleUserClick}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
            onFilterChange={handleFilterChange}
            onFilterReset={handleFilterReset}
          />
        </div>

        {/* Mobil görünümde kullanıcı seçilince sadece detay görünsün */}
        <div className={`${selectedUser ? 'block' : 'hidden md:block'} w-full lg:w-auto lg:min-w-[350px] lg:max-w-[450px]`}>
          <UserDetails
            user={selectedUser}
            onUpdateUser={(userData) => {
              if (userData.id) {
                handleUpdateUser(userData);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 