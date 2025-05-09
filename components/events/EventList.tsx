"use client";

import React from 'react';
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash, Filter, ListFilter, CheckCircle2 } from "lucide-react";
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
  loading
}) => {
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
                    className={`
                      hover:bg-green-50 cursor-pointer
                      ${selectedEvent?.id === event.id ? 'bg-green-100' : ''}
                    `}
                    style={{
                      borderLeft: selectedEvent?.id === event.id ? '6px solid #059669' : 'none'
                    }}
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
                        {getApprovalBadge(event.approval_status)}
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
      </CardContent>
    </Card>
  );
};

export default EventList; 