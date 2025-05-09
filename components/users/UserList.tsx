"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash, Pencil } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import UserFilter from "./UserFilter";
import UserForm from "./UserForm";
import type { UserType } from "@/interfaces/user";
import type { DateRange } from "react-day-picker";
import { useState } from "react";

interface UserListProps {
  users: UserType[];
  selectedUser: UserType | null;
  selectedColumns: {
    email: boolean;
    phone: boolean;
    role: boolean;
    first_name: boolean;
    last_name: boolean;
  };
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onColumnToggle: (column: keyof UserListProps['selectedColumns']) => void;
  onUserClick: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (userData: Partial<UserType>) => void;
  onFilterChange: (filters: {
    role?: string | undefined;
    searchQuery?: string | undefined;
    isActive?: boolean | undefined;
  }) => void;
  onFilterReset: () => void;
}

export default function UserList({
  users,
  selectedUser,
  selectedColumns,
  searchQuery,
  onSearchChange,
  onColumnToggle,
  onUserClick,
  onDeleteUser,
  onUpdateUser,
  onFilterChange,
  onFilterReset,
}: UserListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleUpdateUser = (userData: Partial<UserType>) => {
    onUpdateUser(userData);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-none p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
            <p className="text-sm text-muted-foreground">Kullanıcıları yönetin, düzenleyin ve kontrol edin</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <div className="flex items-center">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kullanıcı ara..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
            <UserFilter
              onFilterChange={onFilterChange}
              onReset={onFilterReset}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="rounded-lg border shadow-sm overflow-hidden bg-card h-full">
          <div className="overflow-x-auto h-full">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Kullanıcı</TableHead>
                  {selectedColumns.email && (
                    <TableHead className="font-semibold">E-posta</TableHead>
                  )}
                  {selectedColumns.phone && (
                    <TableHead className="font-semibold">Telefon</TableHead>
                  )}
                  {selectedColumns.role && (
                    <TableHead className="font-semibold">Rol</TableHead>
                  )}
                  <TableHead className="text-right font-semibold">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Kullanıcı bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      style={{
                        borderLeft: selectedUser?.id === user.id ? '4px solid #10b981' : 'none'
                      }}
                      onClick={() => onUserClick(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage src={user.profile_picture || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      {selectedColumns.email && (
                        <TableCell className="text-sm">
                          {user.email}
                        </TableCell>
                      )}
                      {selectedColumns.phone && (
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-muted-foreground"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            {user.phone !== null
                              ? user.phone
                              : <span className="text-muted-foreground italic">Belirtilmemiş</span>
                            }
                          </div>
                        </TableCell>
                      )}
                      {selectedColumns.role && (
                        <TableCell>
                          <Badge
                            variant={
                              user.role === 'superadmin'
                                ? 'destructive'
                                : user.role === 'admin'
                                  ? 'default'
                                  : 'secondary'
                            }
                            className="font-normal"
                          >
                            {user.role === 'superadmin' ? 'Süper Admin' :
                              user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            if (open) onUserClick(user);
                            setIsEditDialogOpen(open);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUserClick(user);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Düzenle</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                              </DialogHeader>
                              <UserForm
                                user={user}
                                onSubmit={handleUpdateUser}
                                onCancel={() => setIsEditDialogOpen(false)}
                                isEditing={true}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteUser(user.id);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 