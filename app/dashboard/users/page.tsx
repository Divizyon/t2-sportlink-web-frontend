"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/lib/hooks";
import { toast } from "@/components/ui/use-toast";
import UserList from "@/components/users/UserList";
import UserDetails from "@/components/users/UserDetails";
import type { UserType } from "@/interfaces/user";

export default function UsersPage() {
  const {
    users,
    selectedUser,
    isLoading,
    error,
    getUsers,
    createUser,
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

  // Handle user create
  const handleCreateUser = async (userData: Partial<UserType>) => {
    const result = await createUser(userData);
    if (result.success) {
      toast({
        title: "Başarılı",
        description: result.message || "Kullanıcı başarıyla oluşturuldu",
      });
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
    <div className="flex h-full">
      <UserList
        users={users}
        selectedUser={selectedUser}
        selectedColumns={selectedColumns}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onColumnToggle={handleColumnToggle}
        onUserClick={handleUserClick}
        onDeleteUser={handleDeleteUser}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
        onFilterChange={handleFilterChange}
        onFilterReset={handleFilterReset}
      />
      <UserDetails 
        user={selectedUser} 
        onUpdateUser={(userData) => {
          if (userData.id) {
            handleUpdateUser(userData);
          }
        }} 
      />
    </div>
  );
} 