"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash, Eye, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { News, NewsStatus } from "@/types/news";

interface NewsListProps {
  news: News[];
  onEdit: (news: News) => void;
  onDelete: (id: number) => void;
  onView: (news: News) => void;
  loading?: boolean;
}

const NewsList: React.FC<NewsListProps> = ({
  news,
  onEdit,
  onDelete,
  onView,
  loading = false
}) => {
  const getStatusBadge = (status: NewsStatus) => {
    const statusColors = {
      "Aktif": "bg-green-100 text-green-800",
      "Pasif": "bg-gray-100 text-gray-800",
      "Taslak": "bg-yellow-100 text-yellow-800",
      "Onay Bekliyor": "bg-orange-100 text-orange-800"
    };

    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haber Listesi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görsel</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Henüz haber bulunmamaktadır.
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-16 h-16 relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id)}
                        >
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

export default NewsList; 