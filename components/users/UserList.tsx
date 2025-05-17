"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserFilter from "./UserFilter";
import type { UserType } from "@/interfaces/user";
import { useEffect } from "react";

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
  onUserClick: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
  onFilterChange: (filters: {
    role?: string | undefined;
    searchQuery?: string | undefined;
    isActive?: boolean | undefined;
  }) => void;
  onFilterReset: () => void;
  
  // Sayfalama props'ları
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function UserList({
  users,
  selectedUser,
  selectedColumns,
  searchQuery,
  onSearchChange,
  onUserClick,
  onDeleteUser,
  onFilterChange,
  onFilterReset,
  totalUsers: totalUsersProp,
  currentPage,
  pageSize,
  onPageChange,
}: UserListProps) {
  // Toplam sayfa sayısını hesapla
  const totalPages = Math.max(1, Math.ceil((totalUsersProp || 0) / Math.max(1, pageSize || 10)));

  // Debug bilgisi için useEffect
  useEffect(() => {
    console.log('Pagination Props:', {
      totalUsers: totalUsersProp,
      currentPage,
      pageSize,
      calculatedTotalPages: totalPages,
      shouldShowPagination: totalPages > 1
    });
  }, [totalUsersProp, currentPage, pageSize, totalPages]);

  // Sayfa numaralarını oluştur
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Maksimum görünür sayfa sayısı
    
    if (totalPages <= maxVisiblePages) {
      // Toplam sayfa sayısı az ise tümünü göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Başlangıç ve bitiş sayfalarını hesapla
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // İlk sayfa
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis');
        }
      }
      
      // Sayfa numaraları
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Son sayfa
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Automatically select the first user when the component renders or when users change
  useEffect(() => {
    if (users.length > 0 && !selectedUser && users[0]) {
      onUserClick(users[0]);
    }
  }, [users, selectedUser, onUserClick]);

  return (
    <Card className="h-full flex flex-col rounded border dark:border-slate-700">
      <CardHeader className="pl-4 pb-2">
        <CardTitle>Kullanıcı Yönetimi</CardTitle>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input dark:ring-slate-700">
              <Input
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="outline"
                className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted dark:hover:bg-slate-700"
                onClick={() => {
                  console.log("Arama yapılıyor:", searchQuery);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <UserFilter
              onFilterChange={onFilterChange}
              onReset={onFilterReset}
            />
          </div>

        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="rounded-md border dark:border-slate-700 mx-4 mt-0 mb-0 flex-1 flex flex-col">
          <div className="overflow-auto h-[calc(100vh-180px)]">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-card dark:bg-slate-900 z-10">
                <TableRow className="bg-muted/50 dark:bg-slate-800/50">
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
                      <div className="flex flex-col items-center py-6">
                        <h3 className="text-lg font-medium mb-2">Kullanıcı bulunamadı</h3>
                        <p className="text-muted-foreground mb-4">Farklı filtreler kullanmayı veya arama terimini değiştirmeyi deneyin.</p>
                        <Button variant="outline" onClick={onFilterReset} className="dark:border-slate-700 dark:hover:bg-slate-800">
                          Filtreleri Temizle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={`cursor-pointer ${selectedUser?.id === user.id ? '!bg-green-100 dark:!bg-slate-800 hover:!bg-green-200 dark:hover:!bg-slate-700' : 'hover:bg-muted dark:hover:bg-slate-800/40'}`}
                      style={{
                        borderLeft: selectedUser?.id === user.id ? '4px solid #10b981' : 'none'
                      }}
                      onClick={() => onUserClick(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border dark:border-slate-700">
                            <AvatarImage src={user.profile_picture || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium dark:bg-primary/20">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium dark:text-gray-200">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-muted-foreground dark:text-gray-400">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      {selectedColumns.email && (
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
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <path d="m22 6-10 7L2 6"></path>
                            </svg>
                            {user.email}
                          </div>
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
                            {user.phone && user.phone !== "" && user.phone !== "null" && user.phone !== "undefined"
                              ? <span className="dark:text-gray-200">{user.phone}</span>
                              : <span className="text-muted-foreground italic dark:text-gray-400">Belirtilmemiş</span>
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border dark:border-slate-700 rounded-md mx-4 py-2 px-4 mt-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-sm text-muted-foreground">
                Toplam <strong className="dark:text-gray-300">{totalUsersProp}</strong> kullanıcı, <strong className="dark:text-gray-300">{pageSize}</strong> kayıt/sayfa
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-7 w-7 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Önceki Sayfa</span>
                </Button>
                
                {getPageNumbers().map((page, index) => (
                  page === 'ellipsis' ? (
                    <Button
                      key={`ellipsis-${index}`}
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 cursor-default dark:border-slate-700"
                      disabled
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => onPageChange(page as number)}
                      className={`h-7 w-7 ${currentPage !== page ? 'dark:border-slate-700 dark:hover:bg-slate-800' : ''}`}
                    >
                      {page}
                    </Button>
                  )
                ))}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-7 w-7 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Sonraki Sayfa</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 