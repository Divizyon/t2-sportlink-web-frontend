"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { Event } from "@/interfaces/event";

interface ApprovalCenterProps {
  events: Event[];
  setSelectedEvent: (event: Event) => void;
  handleApproveEvent: (id: string) => Promise<void>;
  handleRejectEvent: (id: string) => Promise<void>;
  formatDate: (dateString: string) => string;
  itemsPerPage: number;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  events,
  setSelectedEvent,
  handleApproveEvent,
  handleRejectEvent,
  formatDate,
  itemsPerPage
}) => {
  // Sayfalama için state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debug - Gelen etkinlikleri kontrol et
  console.log('ApprovalCenter - Received events total:', events.length);
  
  // Gelen tüm etkinlikleri detaylı olarak logla
  console.log('All events in ApprovalCenter:', events.map(e => ({
    id: e.id,
    title: e.title,
    status: e.status,
    approval_status: e.approval_status
  })));
  
  // Onay bekleyen etkinlikleri veya pasif etkinlikleri filtrele
  const filteredEvents = events.filter(e => {
    // Lowercase string comparison to handle case inconsistencies
    const status = typeof e.status === 'string' ? e.status.toLowerCase() : '';
    const approvalStatus = typeof e.approval_status === 'string' ? e.approval_status.toLowerCase() : '';
    
    return approvalStatus === "pending" || status === "inactive" || status === "passive";
  });
  
  console.log('Pending approval or passive events count:', filteredEvents.length);

  // Sayfalama için hesaplamalar
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  
  // Mevcut sayfa için etkinlikleri hesapla
  const currentEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, itemsPerPage]);

  // Sayfa değişimini işle
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Etkinlik durumu için metin
  const getStatusText = (status: string | undefined) => {
    if (!status) return "Belirtilmemiş";
    
    switch(status.toLowerCase()) {
      case 'active':
        return "Aktif";
      case 'inactive':
      case 'passive':
        return "Pasif";
      case 'draft':
        return "Taslak";
      case 'canceled':
        return "İptal";
      case 'completed':
        return "Tamamlandı";
      default:
        return status;
    }
  };

  // Onay durumu için metin
  const getApprovalText = (status: string | undefined) => {
    if (!status) return "Belirtilmemiş";
    
    switch(status.toLowerCase()) {
      case 'pending':
        return "Onay Bekliyor";
      case 'approved':
        return "Onaylandı";
      case 'rejected':
        return "Reddedildi";
      case 'cancelled':
        return "İptal Edildi";
      default:
        return status;
    }
  };

  // Onay durumu için stil sınıfları
  const getApprovalStatusClass = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    
    switch(status.toLowerCase()) {
      case 'pending': 
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      case 'approved': 
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      case 'rejected':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      case 'cancelled':
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etkinlik Onay Merkezi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">Onay Bekleyen ve Pasif Etkinlikler ({filteredEvents.length})</h3>
          
        </div>
        {filteredEvents.length > 0 ? (
          <div className="overflow-auto">
            <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/5">Başlık</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">Organizatör</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Tarih</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Kategori</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Durum</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Onay</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200 dark:bg-card dark:divide-border">
                {currentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-orange-50 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                    }}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{event.title}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {event.creator ? `${event.creator.first_name} ${event.creator.last_name}` : 'Bilinmiyor'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(event.event_date)}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {event.sport ? event.sport.name : 'Belirtilmemiş'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 py-1 inline-block rounded-full text-xs ${
                        event.status?.toLowerCase() === "active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                          : event.status?.toLowerCase() === "inactive" || event.status?.toLowerCase() === "passive"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            : event.status?.toLowerCase() === "draft" 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}>
                        {getStatusText(event.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 py-1 inline-block rounded-full text-xs ${getApprovalStatusClass(event.approval_status)}`}>
                        {getApprovalText(event.approval_status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveEvent(event.id);
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectEvent(event.id);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </TableBody>
            </Table>
            
            {/* Sayfalama kontrolü */}
            {totalPages > 1 && (
              <div className="mt-4 border-t py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Toplam <strong>{filteredEvents.length}</strong> etkinlik, sayfa <strong>{currentPage}</strong>/<strong>{totalPages}</strong>
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400">Onay bekleyen veya pasif etkinlik bulunmamaktadır</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalCenter;