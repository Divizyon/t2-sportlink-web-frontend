"use client";

import { useState } from "react";
import { SecurityLogs } from "@/components/security/SecurityLogs";
import { UserDetailDialog } from "@/components/security/UserDetailDialog";

interface BlockedUser {
  id: string;
  username: string;
  reason: string;
  date: string;
  admin: string;
  adminId: string;
}

export default function SecurityPage() {
  const [showUserDialog, setShowUserDialog] = useState(false);

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
      <SecurityLogs />

      <UserDetailDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        user={null}
        blockedUsers={blockedUsers}
        formatDate={formatDate}
      />
    </div>
  );
} 