"use client";

import React from 'react';
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
import type { Event } from "@/interfaces/event";

interface ApprovalCenterProps {
  events: Event[];
  setSelectedEvent: (event: Event) => void;
  handleApproveEvent: (id: string) => Promise<void>;
  handleRejectEvent: (id: string) => Promise<void>;
  formatDate: (dateString: string) => string;
}

const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  events,
  setSelectedEvent,
  handleApproveEvent,
  handleRejectEvent,
  formatDate
}) => {
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
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch(status.toLowerCase()) {
      case 'pending': 
        return "bg-yellow-100 text-yellow-800";
      case 'approved': 
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'cancelled':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etkinlik Onay Merkezi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Onay Bekleyen ve Pasif Etkinlikler ({filteredEvents.length})</h3>
        </div>
        {filteredEvents.length > 0 ? (
          <div className="overflow-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizatör</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onay</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-orange-50 cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                    }}
                  >
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {event.creator ? `${event.creator.first_name} ${event.creator.last_name}` : 'Bilinmiyor'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.event_date)}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      {event.sport ? event.sport.name : 'Belirtilmemiş'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status?.toLowerCase() === "active" 
                          ? "bg-green-100 text-green-800" 
                          : event.status?.toLowerCase() === "inactive" || event.status?.toLowerCase() === "passive"
                            ? "bg-gray-100 text-gray-800"
                            : event.status?.toLowerCase() === "draft" 
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}>
                        {getStatusText(event.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${getApprovalStatusClass(event.approval_status)}`}>
                        {getApprovalText(event.approval_status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50"
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
                          className="border-red-500 text-red-600 hover:bg-red-50"
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
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500">Onay bekleyen veya pasif etkinlik bulunmamaktadır</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalCenter; 