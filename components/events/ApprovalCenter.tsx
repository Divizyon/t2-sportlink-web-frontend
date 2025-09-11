"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import type { Event } from "@/interfaces/event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApprovalCenterProps {
  events: Event[];
  setSelectedEvent: (event: Event) => void;
  formatDate: (dateString: string) => string;
  itemsPerPage: number;
  handleUpdateStatus?: (id: string, status: 'active' | 'passive' | 'pending' | 'canceled') => Promise<void>;
  loading?: boolean;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  events,
  setSelectedEvent,
  formatDate,
  itemsPerPage,
  handleUpdateStatus,
  loading = false
}) => {
  // Sayfalama için state
  const [currentPage, setCurrentPage] = useState(1);
  
  // We're now getting all pending events directly, so no need to filter
  const filteredEvents = useMemo(() => {
    return events;
  }, [events]);

  // Sayfalama için hesaplamalar
  const totalPages = useMemo(() => Math.ceil(filteredEvents.length / itemsPerPage), [filteredEvents.length, itemsPerPage]);
  
  // Mevcut sayfa için etkinlikleri hesapla
  const currentEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, itemsPerPage]);

  // Reset to first page when events change
  useEffect(() => {
    setCurrentPage(1);
  }, [events]);

  // Sayfa değişimini işle - Gereksiz render sayısını azaltmak için useCallback ile optimize ediyoruz
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Add state for confirmation dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [eventToAction, setEventToAction] = useState<Event | null>(null);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'passive':
        return 'Pasif';
      case 'pending':
        return 'Beklemede';
      case 'canceled':
        return 'İptal Edildi';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  // Status class styling
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'passive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-amber-500 text-white';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToAction(event);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToAction(event);
    setRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (eventToAction && handleUpdateStatus) {
      try {
        await handleUpdateStatus(eventToAction.id, 'active');
      } catch (error) {
        console.error('Etkinlik onaylama hatası:', error);
      }
    }
    setApproveDialogOpen(false);
    setEventToAction(null);
  };

  const confirmReject = async () => {
    if (eventToAction && handleUpdateStatus) {
      try {
        await handleUpdateStatus(eventToAction.id, 'canceled'); // Change to canceled instead of passive
      } catch (error) {
        console.error('Etkinlik reddetme hatası:', error);
      }
    }
    setRejectDialogOpen(false);
    setEventToAction(null);
  };

  const handleReject = async (event: Event) => {
    try {
      if (handleUpdateStatus) {
        await handleUpdateStatus(event.id, 'canceled'); // Change from passive to canceled
      }
    } catch (error) {
      console.error('Etkinlik reddetme hatası:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Etkinlik Onay Merkezi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">Onay Bekleyen Etkinlikler ({filteredEvents.length})</h3>
            
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Bekleyen etkinlikler yükleniyor...</div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="overflow-auto">
              <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/5">Başlık</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">Organizatör</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Tarih</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Kategori</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/8">Durum</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 dark:bg-slate-800 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200 dark:bg-card dark:divide-border">
                  {currentEvents.map((event) => (
                    <TableRow
                      key={`event-row-${event.id}`}
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
                        <span className={`px-2 py-1 inline-block rounded-full text-xs ${getStatusClass(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {handleUpdateStatus && (
                            <>
                              <Button
                                key={`approve-btn-${event.id}`}
                                variant="outline"
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/50"
                                onClick={(e) => handleApproveClick(event, e)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Onayla
                              </Button>
                              <Button
                                key={`reject-btn-${event.id}`}
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50"
                                onClick={(e) => handleRejectClick(event, e)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Reddet
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Sayfalama kontrolü */}
              {totalPages > 1 && (
                <div className="mt-4 border-t py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Toplam <strong>{filteredEvents.length}</strong> bekleyen etkinlik, sayfa <strong>{currentPage}</strong>/<strong>{totalPages}</strong>
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
              <div className="text-gray-500 dark:text-gray-400">Onay bekleyen etkinlik bulunmamaktadır</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Etkinliği Onayla</AlertDialogTitle>
            <AlertDialogDescription>
              "{eventToAction?.title}" isimli etkinliği onaylamak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmApprove}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Etkinliği Reddet</AlertDialogTitle>
            <AlertDialogDescription>
              "{eventToAction?.title}" isimli etkinliği reddetmek istediğinize emin misiniz? Bu işlem etkinliği iptal edildi olarak işaretleyecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReject}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Reddet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApprovalCenter; 