"use client";

import React from 'react';
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Event } from "@/interfaces/event";

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  searchQuery: string;
  selectedFilters: {
    category: string[];
    status: string[];
    approval_status: string[];
  };
  newEvent: Partial<Event>;
  setSelectedEvent: (event: Event) => void;
  handleDeleteEvent: (id: string) => void;
  setSearchQuery: (query: string) => void;
  handleFilterChange: (type: 'category' | 'status' | 'approval_status', value: string) => void;
  getTotalSelectedFilters: () => number;
  setNewEvent: React.Dispatch<React.SetStateAction<Partial<Event>>>;
  handleAddEvent: () => Promise<void>;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactElement;
  getApprovalBadge: (status: string) => React.ReactElement;
  loading: boolean;
}

const EventList: React.FC<EventListProps> = ({
  events,
  selectedEvent,
  searchQuery,
  selectedFilters,
  newEvent,
  setSelectedEvent,
  handleDeleteEvent,
  setSearchQuery,
  handleFilterChange,
  getTotalSelectedFilters,
  setNewEvent,
  handleAddEvent,
  formatDate,
  getStatusBadge,
  getApprovalBadge,
  loading // Destructure loading prop
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Etkinlik Listesi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Etkinlik ara..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Filtrele {getTotalSelectedFilters() > 0 ? `(${getTotalSelectedFilters()})` : ''}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Kategori</h4>
                    <div className="space-y-2">
                      {['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'Yüzme', 'Diğer'].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={selectedFilters.category.includes(category)}
                            onChange={() => handleFilterChange('category', category)}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`category-${category}`}>{category}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Durum</h4>
                    <div className="space-y-2">
                      {['Aktif', 'Tamamlandı', 'İptal Edildi'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`status-${status}`}
                            checked={selectedFilters.status.includes(status)}
                            onChange={() => handleFilterChange('status', status)}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`status-${status}`}>{status}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Etkinlik Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
                <DialogDescription>Gerekli alanları doldurarak yeni bir etkinlik oluşturun.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Etkinlik başlığı"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Etkinlik açıklaması"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event_date">Etkinlik Tarihi</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sport_id">Spor</Label>
                  <Select
                    value={newEvent.sport_id ? newEvent.sport_id.toString() : ""}
                    onValueChange={(value) => setNewEvent({ ...newEvent, sport_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Spor seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Futbol</SelectItem>
                      <SelectItem value="2">Basketbol</SelectItem>
                      <SelectItem value="3">Voleybol</SelectItem>
                      <SelectItem value="4">Tenis</SelectItem>
                      <SelectItem value="5">Yüzme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Başlangıç Saati</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">Bitiş Saati</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location_name">Konum</Label>
                  <Input
                    id="location_name"
                    value={newEvent.location_name}
                    onChange={(e) => setNewEvent({ ...newEvent, location_name: e.target.value })}
                    placeholder="Etkinlik konumu"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_participants">Maksimum Katılımcı Sayısı</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    value={newEvent.max_participants}
                    onChange={(e) => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select
                    value={newEvent.status ?? "pending"}
                    onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="cancelled">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddEvent} className="w-full">Etkinlik Ekle</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</TableHead>
                <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {/* TODO: Add loading indicator here if needed */}
              {events.map((event) => (
                <tr
                  key={event.id}
                  className={`
                    hover:bg-green-50 cursor-pointer
                    ${selectedEvent?.id === event.id ? 'bg-green-100' : ''}
                  `}
                  style={{
                    borderLeft: selectedEvent?.id === event.id ? '6px solid #059669' : 'none'
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.event_date)}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    {event.sport ? event.sport.name : 'Belirtilmemiş'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(event.status)}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventList; 