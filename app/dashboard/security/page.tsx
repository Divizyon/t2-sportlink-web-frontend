"use client";

import { useState } from "react";
import { SecurityLogs } from "@/components/security/SecurityLogs";
import { UserDetailDialog } from "@/components/security/UserDetailDialog";
import { AdminDetailDialog } from "@/components/security/AdminDetailDialog";

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
    <div className="w-full">
      <SecurityLogs initialSearchQuery={searchQuery} />
      
      <UserDetailDialog 
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        user={selectedUser}
        blockedUsers={blockedUsers}
        formatDate={formatDate}
      />

      <AdminDetailDialog 
        open={showAdminDialog}
        onOpenChange={setShowAdminDialog}
        admin={selectedUser}
        formatDate={formatDate}
      />
    </div>
  );
} 