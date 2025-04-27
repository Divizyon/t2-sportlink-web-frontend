"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Eye, Calendar, User, Tag, Eye as EyeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useStore } from "@/lib/store";
import type { News, NewsStatus } from "@/types/news";

interface NewsPreviewProps {
  defaultImage?: string;
  onSave?: (news: News) => Promise<void>;
  showEditButton?: boolean;
  onEditModeChange?: (isEditMode: boolean) => void;
}

const NewsPreview: React.FC<NewsPreviewProps> = ({
  defaultImage = '/placeholder-image.jpg',
  onSave,
  showEditButton = false,
  onEditModeChange
}) => {
  const { selectedNews, setSelectedNews } = useStore();
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [editedNews, setEditedNews] = useState<News | null>(null);

  useEffect(() => {
    if (selectedNews) {
      setEditedNews(JSON.parse(JSON.stringify(selectedNews)));
    }
  }, [selectedNews]);

  useEffect(() => {
    if (onEditModeChange) {
      onEditModeChange(viewMode === "edit");
    }
  }, [viewMode, onEditModeChange]);

  const handleChange = (name: string, value: string | number | string[] | boolean) => {
    if (!editedNews) return;
    setEditedNews({ ...editedNews, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editedNews) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setEditedNews({
          ...editedNews,
          image: event.target.result as string
        });
      }
    };
    
    reader.readAsDataURL(file);
  };

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const handleEditNews = async () => {
    if (!editedNews) return;
    
    try {
      if (onSave) {
        await onSave(editedNews);
      }
      
      // Başarılı güncelleme sonrası preview moduna dön
      setSelectedNews(editedNews);
      setViewMode("preview");
    } catch (error) {
      console.error('Haber güncellenirken hata:', error);
    }
  };

  if (!selectedNews || !editedNews) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Haber Önizleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Görüntülenecek haber seçilmedi</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{viewMode === "preview" ? "Haber Önizleme" : "Haber Düzenle"}</CardTitle>
        {showEditButton && (
          <div className="flex space-x-2">
            <Button 
              variant={viewMode === "preview" ? "default" : "outline"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode("preview")}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "edit" ? "default" : "outline"} 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setViewMode("edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === "preview" ? (
          <div className="space-y-6">
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
              {editedNews.image ? (
                <Image
                  src={editedNews.image}
                  alt={editedNews.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">Görsel bulunamadı</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{editedNews.title}</h3>
                {getStatusBadge(editedNews.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(editedNews.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{editedNews.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>{editedNews.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{editedNews.views} görüntülenme</span>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2">Haber İçeriği</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{editedNews.content}</p>
              </div>
              {editedNews.sourceUrl && (
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Kaynak</h4>
                  <a 
                    href={editedNews.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {editedNews.sourceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={editedNews.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Haber başlığı"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                value={editedNews.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Haber içeriği"
                className="min-h-[200px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Görsel URL</Label>
              <Input
                id="image"
                value={editedNews.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="Görsel URL'i"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sourceUrl">Kaynak URL</Label>
              <Input
                id="sourceUrl"
                value={editedNews.sourceUrl}
                onChange={(e) => handleChange("sourceUrl", e.target.value)}
                placeholder="Kaynak URL'i"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sport_id">Spor Dalı</Label>
              <Select
                value={editedNews.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Spor dalı seçin" />
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
              <Label htmlFor="published_date">Yayın Tarihi</Label>
              <Input
                id="published_date"
                type="date"
                value={new Date(editedNews.date).toISOString().split('T')[0]}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={editedNews.status}
                onValueChange={(value) => handleChange("status", value as NewsStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Pasif">Pasif</SelectItem>
                  <SelectItem value="Taslak">Taslak</SelectItem>
                  <SelectItem value="Onay Bekliyor">Onay Bekliyor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleEditNews}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Kaydet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsPreview; 