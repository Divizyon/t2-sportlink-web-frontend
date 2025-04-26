"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash, Pencil } from "lucide-react";
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
  onCreateUser: (userData: Partial<UserType>) => void;
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
  onCreateUser,
  onUpdateUser,
  onFilterChange,
  onFilterReset,
}: UserListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCreateUser = (userData: Partial<UserType>) => {
    onCreateUser(userData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateUser = (userData: Partial<UserType>) => {
    onUpdateUser(userData);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="w-2/3 p-6 space-y-6 overflow-auto border-r">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex items-center">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                className="pl-8"
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kullanıcı Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-auto border rounded-lg">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</TableHead>
              {selectedColumns.email && (
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</TableHead>
              )}
              {selectedColumns.phone && (
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</TableHead>
              )}
              {selectedColumns.role && (
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</TableHead>
              )}
              <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <TableRow 
                key={user.id}
                className="hover:bg-green-50 cursor-pointer"
                style={{
                  borderLeft: selectedUser?.id === user.id ? '6px solid #059669' : 'none'
                }}
                onClick={() => onUserClick(user)}
              >
                <TableCell className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Avatar>
                        <AvatarImage src={user.profile_picture || undefined} />
                        <AvatarFallback>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                {selectedColumns.email && (
                  <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </TableCell>
                )}
                {selectedColumns.phone && (
                  <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </TableCell>
                )}
                {selectedColumns.role && (
                  <TableCell className="py-4 px-4 whitespace-nowrap">
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUserClick(user);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
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
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUser(user.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 