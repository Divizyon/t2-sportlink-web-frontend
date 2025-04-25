"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
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
  // Filter for pending events
  const pendingEvents = events.filter(e => e.approval_status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etkinlik Onay Merkezi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Onay Bekleyen Etkinlikler ({pendingEvents.length})</h3>
        </div>
        {pendingEvents.length > 0 ? (
          <div className="overflow-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizatör</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {pendingEvents.map((event) => (
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
            <div className="text-gray-500">Onay bekleyen etkinlik bulunmamaktadır</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalCenter; 