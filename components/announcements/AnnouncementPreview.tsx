"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Eye, Calendar, User, Tag, ClockIcon, AlarmClockIcon, Eye as EyeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Announcement, AnnouncementStatus } from "@/interfaces/announcement";

// Genişletilmiş duyuru tipi
interface ExtendedAnnouncement extends Announcement {
  sourceUrl?: string;
  category?: string; // category bir gereklilik olarak tanımlanmışsa optional olarak ekleyin
}

interface AnnouncementPreviewProps {
  announcement: ExtendedAnnouncement | null;
  viewMode: "preview" | "edit";
  handleChange: (name: string, value: string | number | string[] | boolean | null) => void;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getStatusBadge: (status: AnnouncementStatus | boolean) => React.ReactNode;
  formatDate: (dateString: string | null | undefined) => string;
  defaultImage: string;
  setViewMode: React.Dispatch<React.SetStateAction<"preview" | "edit">>;
  handleEditAnnouncement: () => Promise<void>;
}

const AnnouncementPreview: React.FC<AnnouncementPreviewProps> = ({
  announcement,
  viewMode,
  handleChange,
  handleImageUpload,
  getStatusBadge,
  formatDate,
  defaultImage,
  setViewMode,
  handleEditAnnouncement
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Kaydetme fonksiyonu
  const saveAnnouncement = async () => {
    if (!announcement) {
      console.error("Duyuru verisi eksik, kaydetme işlemi iptal edildi.");
      return;
    }
    
    setIsSaving(true);
    console.log("%c Kaydetme işlemi başlatıldı", "background: #e0f7fa; color: #00695c; font-weight: bold;");
    console.log("Güncellenecek duyuru:", JSON.stringify(announcement, null, 2));
    
    try {
      // API için veri hazırlama - bazı alanlar undefined olabilir veya farklı tiplerde olabilir
      // Burada veriyi temizleyelim
      
      // Kaydetme işlemini çağır
      console.log("%c handleEditAnnouncement fonksiyonu çağrılıyor...", "color: blue;");
      await handleEditAnnouncement();
      console.log("%c Kaydetme işlemi başarıyla tamamlandı", "background: #e8f5e9; color: #2e7d32; font-weight: bold;");
    } catch (error) {
      console.error("%c Kaydetme işlemi sırasında hata oluştu", "background: #ffebee; color: #c62828; font-weight: bold;");
      console.error("Hata detayı:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!announcement) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Duyuru Önizleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Görüntülenecek duyuru seçilmedi</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{viewMode === "edit" ? "Duyuru Düzenle" : "Duyuru Önizleme"}</CardTitle>
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
      </CardHeader>
      <CardContent>
        {viewMode === "preview" ? (
          <div className="space-y-6">
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
              {announcement.image ? (
                <Image
                  src={announcement.image || defaultImage}
                  alt={announcement.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Görsel yüklenemezse default görseli göster
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.src = defaultImage;
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="text-gray-400 text-sm">Görsel bulunamadı</div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{announcement.title}</h3>
                {getStatusBadge(announcement.published !== undefined ? announcement.published : (announcement.status || 'draft'))}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Oluşturulma: {formatDate(announcement.created_at || announcement.createdAt || announcement.date)}</span>
                </div>
                {(announcement.start_date || announcement.end_date) && (
                  <>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Başlangıç: {formatDate(announcement.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlarmClockIcon className="h-4 w-4" />
                      <span>Bitiş: {formatDate(announcement.end_date)}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{announcement.creator?.name || announcement.author || 'Bilinmiyor'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>{announcement.views || 0} görüntülenme</span>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2">Duyuru İçeriği</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{announcement.content}</p>
              </div>
              {announcement.sourceUrl && (
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Kaynak</h4>
                  <a 
                    href={announcement.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {announcement.sourceUrl}
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
                value={announcement.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Duyuru başlığı"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                value={announcement.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Duyuru içeriği"
                className="min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={announcement.start_date ? new Date(announcement.start_date).toISOString().substring(0, 10) : ''}
                  onChange={(e) => handleChange("start_date", e.target.value ? e.target.value : null)}
                  placeholder="Başlangıç tarihi"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">Bitiş Tarihi</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={announcement.end_date ? new Date(announcement.end_date).toISOString().substring(0, 10) : ''}
                  onChange={(e) => handleChange("end_date", e.target.value ? e.target.value : null)}
                  placeholder="Bitiş tarihi"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={(announcement.published !== undefined 
                  ? (announcement.published ? "published" : "draft") 
                  : (announcement.status || "draft")) as string}
                onValueChange={(value) => {
                  if (value === "published" || value === "draft") {
                    handleChange("published", value === "published");
                  } else {
                    handleChange("status", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Yayında</SelectItem>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="archived">Arşivlenmiş</SelectItem>
                  <SelectItem value="pending">Onay Bekliyor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Görsel URL</Label>
              <Input
                id="image"
                value={announcement.image || ''}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="Görsel URL'i"
              />
            </div>
            {handleImageUpload && (
              <div className="grid gap-2">
                <Label htmlFor="imageUpload">Görsel Yükle</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="sourceUrl">Kaynak URL</Label>
              <Input
                id="sourceUrl"
                value={announcement.sourceUrl || ''}
                onChange={(e) => handleChange("sourceUrl", e.target.value)}
                placeholder="Kaynak URL'i"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setViewMode("preview")}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button 
                onClick={saveAnnouncement}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kaydet</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementPreview; 