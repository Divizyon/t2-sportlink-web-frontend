"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { Announcement, AnnouncementStatus } from "@/types/announcement";

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onView: (announcement: Announcement) => void;
  onAdd: () => void;
  formatDate: (dateString: string) => string;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  onEdit,
  onDelete,
  onView,
  onAdd,
  formatDate
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<AnnouncementStatus | "">("");

  const getStatusBadge = (status: AnnouncementStatus) => {
    const statusColors = {
      "Aktif": "bg-green-100 text-green-800",
      "Pasif": "bg-red-100 text-red-800",
      "Taslak": "bg-yellow-100 text-yellow-800",
      "Onay Bekliyor": "bg-blue-100 text-blue-800"
    };

    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    );
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || announcement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Duyuru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AnnouncementStatus | "")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Pasif">Pasif</SelectItem>
              <SelectItem value="Taslak">Taslak</SelectItem>
              <SelectItem value="Onay Bekliyor">Onay Bekliyor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Duyuru
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Yazar</TableHead>
              <TableHead>Görüntülenme</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">Duyuru bulunamadı</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <TableRow 
                  key={announcement.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onView(announcement)}
                >
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell>{formatDate(announcement.date)}</TableCell>
                  <TableCell>{announcement.author}</TableCell>
                  <TableCell>{announcement.views}</TableCell>
                  <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(announcement);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(announcement.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
};

export default AnnouncementList; 