"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Shield, X, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { ReportedUser } from "./types";
import { UserProfileCard } from "./UserProfileCard";

// Helper function to format date 
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Bilinmiyor';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

interface ReportedUsersListProps {
  reportedUsers: ReportedUser[];
  selectedUser: ReportedUser | null;
  handleUserSelect: (user: ReportedUser) => void;
  handleBlockUser: (userId: string, username: string) => void;
  handleRemoveReport: (reportId: string, username: string) => void;
  currentPage?: number;
  totalUsers?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function ReportedUsersList({
  reportedUsers,
  selectedUser,
  handleUserSelect,
  handleBlockUser,
  handleRemoveReport,
  currentPage = 1,
  totalUsers = 0,
  pageSize = 10,
  onPageChange,
}: ReportedUsersListProps) {
  const totalPages = Math.ceil(totalUsers / pageSize);
  const [profileUser, setProfileUser] = useState<{
    id: string;
    username: string;
    fullName?: string | undefined;
    avatar?: string | undefined;
  } | null>(null);

  const handlePrevPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const openUserProfile = (user: ReportedUser, event: React.MouseEvent) => {
    event.stopPropagation();
    setProfileUser({
      id: user.id,
      username: user.username || "",
      fullName: user.fullName,
      avatar: user.avatar
    });
  };

  const openReporterProfile = (reporterId: string, reporterUsername: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (reporterId && reporterUsername) {
      setProfileUser({
        id: reporterId,
        username: reporterUsername,
        fullName: undefined,
        avatar: undefined
      });
    }
  };

  const closeUserProfile = () => {
    setProfileUser(null);
  };

  // Kullanıcı adı gösterimi için yardımcı fonksiyon
  const displayUsername = (username: string | undefined): string => {
    // Username undefined veya boş string ise daha kullanıcı dostu bir mesaj göster
    if (!username || username.trim() === '') {
      return "Kullanıcı";
    }
    return username;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Raporlanan</TableHead>
            <TableHead>Raporlayan</TableHead>
            <TableHead>Rapor Sayısı</TableHead>
            <TableHead>Son Rapor Tarihi</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportedUsers.map((user) => (
            <TableRow
              key={user.id}
              className={`cursor-pointer ${selectedUser?.id === user.id ? 'bg-muted' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <TableCell>
                <Popover open={profileUser?.id === user.id} onOpenChange={(open) => !open && closeUserProfile()}>
                  <PopoverTrigger asChild>
                    <span
                      className="text-primary hover:underline cursor-pointer"
                      onClick={(e) => openUserProfile(user, e)}
                    >
                      {displayUsername(user.username)}
                    </span>
                  </PopoverTrigger>
                  {profileUser?.id === user.id && (
                    <PopoverContent className="w-80 p-0" align="start">
                      <UserProfileCard
                        userId={profileUser?.id || ""}
                        username={profileUser?.username || ""}
                        fullName={profileUser?.fullName}
                        avatar={profileUser?.avatar}
                        onClose={closeUserProfile}
                      />
                    </PopoverContent>
                  )}
                </Popover>
                <div className="text-xs text-muted-foreground font-mono mt-1">ID: {user.id}</div>
              </TableCell>
              <TableCell>
                {user.reporter_id && (
                  <>
                    <Popover open={profileUser?.id === user.reporter_id} onOpenChange={(open) => !open && closeUserProfile()}>
                      <PopoverTrigger asChild>
                        <span
                          className="text-primary hover:underline cursor-pointer"
                          onClick={(e) => openReporterProfile(user.reporter_id || "", user.reporter_username || "", e)}
                        >
                          {displayUsername(user.reporter_username)}
                        </span>
                      </PopoverTrigger>
                      {profileUser?.id === user.reporter_id && (
                        <PopoverContent className="w-80 p-0" align="start">
                          <UserProfileCard
                            userId={profileUser?.id || ""}
                            username={profileUser?.username || ""}
                            fullName={profileUser?.fullName}
                            avatar={profileUser?.avatar}
                            onClose={closeUserProfile}
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                    <div className="text-xs text-muted-foreground font-mono mt-1">ID: {user.reporter_id}</div>
                  </>
                )}
              </TableCell>
              <TableCell>{user.reportCount}</TableCell>
              <TableCell>{formatDate(user.lastReportDate)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${user.status === 'blocked'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                    }`}
                >
                  {user.status === 'blocked' ? 'Engellendi' : 'Aktif'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  {user.status !== 'blocked' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBlockUser(user.id, user.username)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveReport(user.latestReportId || user.id, user.username)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {reportedUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Raporlanan kullanıcı bulunmamaktadır.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Button>
          <div className="text-sm">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 