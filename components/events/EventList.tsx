"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash, Filter, ListFilter, CheckCircle2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Event } from "@/interfaces/event";
import { Checkbox } from "@/components/ui/checkbox";

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  searchQuery: string;
  selectedFilters: {
    category: string[];
    status: string[];
    approval_status: string[];
  };
  setSelectedEvent: (event: Event) => void;
  handleDeleteEvent: (id: string) => void;
  setSearchQuery: (query: string) => void;
  handleFilterChange: (type: 'category' | 'status' | 'approval_status', value: string) => void;
  getTotalSelectedFilters: () => number;
  handleAddEvent: () => Promise<void>;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactElement;
  loading: boolean;
  // Pagination props
  totalEvents?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  selectedEvent,
  searchQuery,
  selectedFilters,
  setSelectedEvent,
  handleDeleteEvent,
  setSearchQuery,
  handleFilterChange,
  getTotalSelectedFilters,
  handleAddEvent,
  formatDate,
  getStatusBadge,
  loading,
  // Pagination props
  totalEvents = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange = () => {},
}) => {
  // Toplam sayfa sayısını etkinlik sayısına göre hesapla
  const totalPages = Math.max(1, Math.ceil((totalEvents || events.length) / Math.max(1, pageSize)));

  // Debug pagination values
  React.useEffect(() => {
    console.log('EventList pagination:', {
      totalEvents,
      eventsLength: events.length,
      currentPage,
      pageSize,
      calculatedTotalPages: totalPages,
      shouldShowPagination: totalPages > 1
    });
  }, [totalEvents, events.length, currentPage, pageSize, totalPages]);

  // Sayfa numaralarını oluştur
  const getPageNumbers = () => {
    // Eğer hiç etkinlik yoksa veya tek sayfa yeterliyse, sayfalama gösterme
    if ((totalEvents || events.length) <= pageSize) {
      return [];
    }
    
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etkinlik Listesi</CardTitle>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
              <Input
                placeholder="Etkinlik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="outline"
                className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select>
              <SelectTrigger className="w-10 h-10 p-0 [&>svg]:hidden">
                <div className="flex items-center justify-center w-full h-full relative">
                  <Filter className="h-5 w-5" />
                  {getTotalSelectedFilters() > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary"></span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                <div className="mb-2 px-2 font-semibold text-sm">Duruma Göre Filtrele</div>
                <div className="flex flex-col gap-2 p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-all"
                      checked={selectedFilters.status.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFilterChange('status', 'all');
                        }
                      }}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <ListFilter className="mr-2 h-4 w-4" />
                      <label htmlFor="filter-all">Tümü</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-active"
                      checked={selectedFilters.status.includes("active")}
                      onCheckedChange={() => handleFilterChange('status', 'active')}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      <label htmlFor="filter-active">Aktif</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-draft"
                      checked={selectedFilters.status.includes("draft")}
                      onCheckedChange={() => handleFilterChange('status', 'draft')}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-600" />
                      <label htmlFor="filter-draft">Taslak</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-completed"
                      checked={selectedFilters.status.includes("completed")}
                      onCheckedChange={() => handleFilterChange('status', 'completed')}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-gray-600" />
                      <label htmlFor="filter-completed">Tamamlandı</label>
                    </div>
                  </div>
                </div>

                <div className="mb-2 px-2 font-semibold text-sm">Onay Durumuna Göre Filtrele</div>
                <div className="flex flex-col gap-2 p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-pending"
                      checked={selectedFilters.approval_status.includes("pending")}
                      onCheckedChange={() => handleFilterChange('approval_status', 'pending')}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-orange-600" />
                      <label htmlFor="filter-pending">Onay Bekliyor</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-approved"
                      checked={selectedFilters.approval_status.includes("approved")}
                      onCheckedChange={() => handleFilterChange('approval_status', 'approved')}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      <label htmlFor="filter-approved">Onaylandı</label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-rejected"
                      checked={selectedFilters.approval_status.includes("rejected")}
                      onCheckedChange={() => handleFilterChange('approval_status', 'rejected')}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-red-600" />
                      <label htmlFor="filter-rejected">Reddedildi</label>
                    </div>
                  </div>
                </div>

                {getTotalSelectedFilters() > 0 && (
                  <div className="flex justify-center p-2 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSearchQuery("");
                      handleFilterChange('status', 'all');
                      handleFilterChange('approval_status', 'all');
                    }}>
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" className="gap-1" onClick={() => handleAddEvent()}>
            <Plus className="h-4 w-4" /> Yeni Etkinlik Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {searchQuery || getTotalSelectedFilters() > 0 ? (
                      <div className="flex flex-col items-center py-8">
                        <h3 className="text-lg font-medium mb-2">Arama kriterlerine uygun etkinlik bulunamadı</h3>
                        <p className="text-muted-foreground mb-4">Farklı filtreler kullanmayı veya arama terimini değiştirmeyi deneyin.</p>
                        <Button variant="outline" onClick={() => {
                          setSearchQuery("");
                          handleFilterChange('status', 'all');
                          handleFilterChange('approval_status', 'all');
                        }}>
                          Filtreleri Temizle
                        </Button>
                      </div>
                    ) : (
                      "Henüz etkinlik bulunmamaktadır."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow
                    key={event.id}
                    style={selectedEvent?.id === event.id ? { 
                      backgroundColor: '#d1fae5 !important',
                      borderLeft: '6px solid #059669'
                    } : {}}
                    data-selected={selectedEvent?.id === event.id ? "true" : "false"}
                    className={`cursor-pointer ${selectedEvent?.id === event.id ? '!bg-green-100 dark:!bg-slate-700 hover:!bg-green-200 dark:hover:!bg-slate-600 dark:[&[data-selected=true]]:border-l-slate-500' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <TableCell className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.event_date)}</TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {event.sport ? event.sport.name : 'Belirtilmemiş'}
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(event.status)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination - only show if there are multiple pages */}
        {totalPages > 1 && getPageNumbers().length > 0 && (
          <div className="border-t py-3 px-4 mt-4 rounded-md border">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-sm text-muted-foreground">
                Toplam <strong>{totalEvents || events.length}</strong> etkinlik, <strong>{pageSize}</strong> kayıt/sayfa
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-7 w-7"
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
                      className="h-7 w-7 cursor-default"
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
                      className="h-7 w-7"
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
                  className="h-7 w-7"
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
};

export default EventList; 