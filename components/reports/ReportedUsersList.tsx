"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { ReportedUser } from "./types";

interface ReportedUsersListProps {
  reportedUsers: ReportedUser[];
  selectedUser: ReportedUser | null;
  handleUserSelect: (user: ReportedUser) => void;
  handleBlockUser: (userId: string, username: string) => void;
  handleRemoveReport: (userId: string, username: string) => void;
}

export function ReportedUsersList({
  reportedUsers,
  selectedUser,
  handleUserSelect,
  handleBlockUser,
  handleRemoveReport,
}: ReportedUsersListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kullanıcı Adı</TableHead>
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
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>{user.reportCount}</TableCell>
            <TableCell>{user.lastReportDate}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'blocked'
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
                    <Shield className="h-4 w-4 mr-1" />
                    Engelle
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveReport(user.id, user.username)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Kaldır
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {reportedUsers.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              Raporlanan kullanıcı bulunmamaktadır.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 