"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Eye, Calendar, User, Tag, Eye as EyeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Announcement, AnnouncementStatus } from "@/types/announcement";

interface AnnouncementPreviewProps {
  announcement: Announcement | null;
  viewMode: "preview" | "edit";
  handleChange: (name: string, value: string | number | string[] | boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getStatusBadge: (status: AnnouncementStatus) => React.ReactNode;
  formatDate: (dateString: string) => string;
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
        <CardTitle>Duyuru Önizleme</CardTitle>
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
            <div className="relative h-48 w-full rounded-lg overflow-hidden">
              <Image
                src={announcement.image || defaultImage}
                alt={announcement.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{announcement.title}</h3>
                {getStatusBadge(announcement.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(announcement.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{announcement.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>{announcement.views} görüntülenme</span>
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
            <div className="grid gap-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={announcement.status}
                onValueChange={(value) => handleChange("status", value)}
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
            <div className="grid gap-2">
              <Label htmlFor="image">Görsel URL</Label>
              <Input
                id="image"
                value={announcement.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="Görsel URL'i"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sourceUrl">Kaynak URL</Label>
              <Input
                id="sourceUrl"
                value={announcement.sourceUrl}
                onChange={(e) => handleChange("sourceUrl", e.target.value)}
                placeholder="Kaynak URL'i"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewMode("preview")}>
                İptal
              </Button>
              <Button onClick={handleEditAnnouncement}>
                Kaydet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementPreview; 