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
  const [imageError, setImageError] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNews) {
      setEditedNews(JSON.parse(JSON.stringify(selectedNews)));
      setImageError(false);
      // Extract URL when selectedNews changes
      if (selectedNews.content) {
        const { content, url } = extractUrlFromContent(selectedNews.content);
        if (url) {
          setExtractedUrl(url);
        }
      }
    }
  }, [selectedNews]);

  useEffect(() => {
    if (onEditModeChange) {
      onEditModeChange(viewMode === "edit");
    }
  }, [viewMode, onEditModeChange]);

  // Function to extract URL from content
  const extractUrlFromContent = (content: string): { content: string, url: string | null } => {
    const urlRegex = /\[(https?:\/\/[^\s\]]+)\]/;
    const match = content.match(urlRegex);
    
    if (match && match[1]) {
      // Return the content without the bracketed URL and the extracted URL
      return {
        content: content.replace(urlRegex, '').trim(),
        url: match[1]
      };
    }
    
    return { content, url: null };
  };

  const handleChange = (name: string, value: string | number | string[] | boolean) => {
    if (!editedNews) return;
    setEditedNews({ ...editedNews, [name]: value });
    
    // If content is being updated, check for URLs
    if (name === 'content') {
      const { url } = extractUrlFromContent(value as string);
      setExtractedUrl(url);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editedNews) return;
    
    const file = e.target.files[0];
    
    // Dosya boyutu kontrolü (örn. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu çok büyük! Maksimum 5MB olmalıdır.');
      return;
    }
    
    // Dosya tipi kontrolü
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      alert('Sadece JPEG, PNG, GIF ve WEBP formatları desteklenmektedir.');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setEditedNews({
          ...editedNews,
          image: event.target.result as string
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error('Dosya okuma hatası:', error);
      alert('Dosya okunurken bir hata oluştu.');
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
        // If we have an extracted URL and it's not already in the content with brackets
        if (extractedUrl && !editedNews.content.includes(`[${extractedUrl}]`)) {
          // Add the URL in brackets at the end of the content
          editedNews.content = `${editedNews.content} [${extractedUrl}]`;
        }
        
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

  // Process content for display (remove URLs in brackets)
  const { content: displayContent } = extractUrlFromContent(editedNews.content);

  return (
    <Card className="h-full flex flex-col">
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
      <CardContent className="flex-1 overflow-hidden">
        {viewMode === "preview" ? (
          <div className="space-y-6 h-full overflow-y-auto overflow-x-hidden">
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
              {editedNews.image && !imageError ? (
                <Image
                  src={editedNews.image.startsWith('data:') || editedNews.image.startsWith('http') ? editedNews.image : defaultImage}
                  alt={editedNews.title}
                  fill
                  className="object-cover"
                  onError={() => {
                    console.error(`Görsel yüklenemedi: ${editedNews.image}`);
                    setImageError(true);
                  }}
                  unoptimized={editedNews.image.startsWith('data:')}
                />  
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">Görsel bulunamadı veya yüklenemedi</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-2xl font-semibold break-words">{editedNews.title}</h3>
                {getStatusBadge(editedNews.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{formatDate(editedNews.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{editedNews.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{editedNews.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{editedNews.views} görüntülenme</span>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2">Haber İçeriği</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line break-words">{displayContent}</p>
              </div>
              {(editedNews.sourceUrl || extractedUrl) && (
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Kaynak</h4>
                  <a 
                    href={extractedUrl || editedNews.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {extractedUrl || editedNews.sourceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2">
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
                  className="min-h-[150px]"
              />
            </div>
              {extractedUrl && (
                <div className="grid gap-2">
                  <Label htmlFor="extractedUrl">Çıkartılan URL</Label>
                  <Input
                    id="extractedUrl"
                    value={extractedUrl}
                    onChange={(e) => setExtractedUrl(e.target.value)}
                    placeholder="URL"
                  />
                  <p className="text-xs text-gray-500">Bu URL, içerikten çıkartılmıştır ve kaynak olarak kullanılacaktır.</p>
                </div>
              )}
            <div className="grid gap-2">
                <Label htmlFor="image">Görsel</Label>
                <div className="space-y-2">
              <Input
                id="image"
                  placeholder="Görsel URL'i"
                  value={editedNews.image && (editedNews.image.startsWith('http') ? editedNews.image : '')}
                onChange={(e) => handleChange("image", e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="imageUpload" className="text-xs text-gray-500">veya bir dosya yükle:</Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {editedNews.image && (
                    <div className="mt-2">
                      <div className="relative h-32 w-48 rounded-md overflow-hidden">
                        <Image
                          src={editedNews.image.startsWith('data:') || editedNews.image.startsWith('http') ? editedNews.image : defaultImage}
                          alt="Önizleme"
                          fill
                          className="object-cover"
                          onError={() => {
                            console.error(`Önizleme görseli yüklenemedi: ${editedNews.image}`);
                          }}
                          unoptimized={editedNews.image.startsWith('data:')}
                        />
                      </div>
                    </div>
                  )}
                </div>
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
              <div className="flex justify-end mt-4 pb-2">
              <Button 
                onClick={handleEditNews}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Kaydet
              </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsPreview; 