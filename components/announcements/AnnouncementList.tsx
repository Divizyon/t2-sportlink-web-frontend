"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Loader2, MegaphoneIcon, Filter, CheckIcon, ListFilter, CheckCircle2, FileText, Archive, Clock } from "lucide-react";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import useStore from '@/lib/store';
import type { Announcement, AnnouncementStatus } from '@/interfaces/announcement';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from "@/components/ui/checkbox";

// StatusFilter için özel tip tanımı
type StatusFilterType = AnnouncementStatus | "all" | "filtered" | "";

interface AnnouncementListProps {
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onView: (announcement: Announcement) => void;
  onAdd: () => void;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  // Store'dan gerekli durumları ve fonksiyonları al
  const announcements = useStore(state => state.announcements);
  const isLoading = useStore(state => state.isLoading);
  const error = useStore(state => state.error);
  const pagination = useStore(state => state.pagination);
  const getAnnouncements = useStore(state => state.getAnnouncements);
  const deleteAnnouncement = useStore(state => state.deleteAnnouncement);
  const setCurrentAnnouncement = useStore(state => state.setCurrentAnnouncement);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const { toast } = useToast();

  // Ref ile ilk yükleme durumunu takip et
  const didMount = useRef(false);

  // Sayfa yüklendiğinde duyuruları getir
  useEffect(() => {
    // İlk montaj sırasında sadece bir kez çalışır
    console.log("AnnouncementList useEffect çalıştı - didMount değeri:", didMount.current, "Component ID:", Math.random().toString(36).substring(7));
    
    if (!didMount.current) {
      console.log("  → AnnouncementList ilk yükleme - API çağrısı yapılıyor:", pagination.page, pagination.limit);
      // API çağrısı yaparken hata oluşursa bile bileşen çalışmaya devam etmeli
      try {
        getAnnouncements(pagination.page, pagination.limit);
      } catch (error) {
        console.error("Duyuru verileri alınırken bir hata oluştu:", error);
        // Hata durumunda toast göster
        toast({
          title: "Hata",
          description: "Duyurular yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.",
          variant: "destructive",
        });
      }
      didMount.current = true;
      console.log("  → didMount true olarak işaretlendi");
    } else {
      console.log("  → AnnouncementList zaten yüklendi, API çağrısı yapılmıyor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hata oluştuğunda kullanıcıya bildir
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Tarih formatla
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ""; // Eğer tarih yoksa boş string döndür
    
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  // Durum badge'i oluştur
  const getStatusBadge = (status: AnnouncementStatus | boolean) => {
    // Eğer boolean bir değer gelirse (published), onu string'e çevirelim
    const statusKey = typeof status === 'boolean' 
      ? (status ? 'published' : 'draft') 
      : status;
    
    const statusColors: Record<string, string> = {
      "published": "bg-green-100 text-green-800",
      "draft": "bg-yellow-100 text-yellow-800",
      "archived": "bg-red-100 text-red-800",
      "pending": "bg-blue-100 text-blue-800"
    };

    // Türkçe durum metinlerini tanımla
    const statusTexts: Record<string, string> = {
      "published": "Yayında",
      "draft": "Taslak",
      "archived": "Arşivlenmiş",
      "pending": "Onay Bekliyor"
    };

    const colorClass = statusColors[statusKey] || "bg-gray-100 text-gray-800";
    const text = statusTexts[statusKey] || statusKey;

    return (
      <Badge className={colorClass}>
        {text}
      </Badge>
    );
  };

  // Duyuru silme işlemi
  const handleDelete = async (id: string) => {
    if (window.confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
      const success = await deleteAnnouncement(id);
      if (success) {
        toast({
          title: "Başarılı",
          description: "Duyuru başarıyla silindi",
        });
      }
    }
  };

  // Durum filtreleme işlemi
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => {
      // Eğer zaten seçiliyse, kaldır
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } 
      // Değilse ekle
      else {
        return [...prev, status];
      }
    });
    
    // Eğer seçili durum yoksa, tüm durumları göster
    if (selectedStatuses.length === 0) {
      setStatusFilter("all");
    } else {
      setStatusFilter("filtered");
    }
  };

  // Duyuruları filtrele
  const filteredAnnouncements = React.useMemo(() => {
    // Önce announcements'in bir dizi olup olmadığını kontrol et
    console.log("Duyuru filtreleme, mevcut veri:", announcements);
    
    if (!announcements || !Array.isArray(announcements)) {
      console.error("Filtrelenemedi: announcements bir dizi değil!", announcements);
      return [];
    }
    
    return announcements.filter(announcement => {
      const matchesSearch = !searchTerm || 
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Eğer hiçbir filtre seçilmemişse veya "all" ise
      if (statusFilter === "all" || selectedStatuses.length === 0) {
        return matchesSearch;
      }
      
      // Seçili durumlardan herhangi birine uyuyorsa göster
      const matchesStatus = selectedStatuses.some(status => {
        if (status === 'published') {
          return announcement.published === true || announcement.status === 'published';
        } else if (status === 'draft') {
          return announcement.published === false || announcement.status === 'draft';
        } else {
          return announcement.status === status;
        }
      });
      
      return matchesSearch && matchesStatus;
    });
  }, [announcements, searchTerm, statusFilter, selectedStatuses]);

  // Sayfa değiştirme işlemi
  const handlePageChange = (page: number) => {
    console.log(`handlePageChange çağrıldı: yeni sayfa=${page}, mevcut sayfa=${pagination.page}`);
    // Zaten aynı sayfadaysak gereksiz API çağrısı yapmayalım
    if (page !== pagination.page) {
      console.log(`  → Sayfa değişikliği onaylandı, yeni veri çekiliyor: sayfa=${page}, limit=${pagination.limit}`);
      getAnnouncements(page, pagination.limit);
    } else {
      console.log(`  → Aynı sayfa (${page}) seçildi, API çağrısı yapılmadı`);
    }
  };

  // ID oluşturma yardımcı fonksiyonu
  const generateUniqueId = (announcement: Announcement): string => {
    if (announcement.id && announcement.id.trim() !== "") return announcement.id;
    
    // ID yoksa, içerikten bir hash oluştur
    const content = announcement.title + (announcement.created_at || announcement.createdAt || new Date().toISOString());
    return `temp-${content.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)}`;
  };

  // Yeni duyuru ekleme işlemi için wrapper fonksiyon
  const handleAddAnnouncement = () => {
    // Store'daki mevcut duyuruyu temizle ve onAdd'i çağır
    setCurrentAnnouncement(null);
    onAdd();
  };

  // Debug için her render'ı logla
  console.log("AnnouncementList RENDER edildi", new Date().toISOString());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
            <Input
              placeholder="Duyuru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button 
              variant="outline" 
              className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
              onClick={() => {
                // Arama işlemi burada gerçekleşecek (şu anda anlık filtreleme yaptığımız için boş bırakıyoruz)
                console.log("Arama yapılıyor:", searchTerm);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterType)}>
            <SelectTrigger className="w-10 h-10 p-0 [&>svg]:hidden">
              <div className="flex items-center justify-center w-full h-full relative">
                <Filter className="h-5 w-5" />
                {selectedStatuses.length > 0 && (
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
                    checked={selectedStatuses.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStatuses([]);
                        setStatusFilter("all");
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
                    id="filter-published" 
                    checked={selectedStatuses.includes("published")}
                    onCheckedChange={() => toggleStatus("published")}
                  />
                  <div className="flex items-center text-sm cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    <label htmlFor="filter-published">Yayında</label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filter-draft" 
                    checked={selectedStatuses.includes("draft")}
                    onCheckedChange={() => toggleStatus("draft")}
                  />
                  <div className="flex items-center text-sm cursor-pointer">
                    <FileText className="mr-2 h-4 w-4 text-yellow-600" />
                    <label htmlFor="filter-draft">Taslak</label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filter-archived" 
                    checked={selectedStatuses.includes("archived")}
                    onCheckedChange={() => toggleStatus("archived")}
                  />
                  <div className="flex items-center text-sm cursor-pointer">
                    <Archive className="mr-2 h-4 w-4 text-red-600" />
                    <label htmlFor="filter-archived">Arşivlenmiş</label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filter-pending" 
                    checked={selectedStatuses.includes("pending")}
                    onCheckedChange={() => toggleStatus("pending")}
                  />
                  <div className="flex items-center text-sm cursor-pointer">
                    <Clock className="mr-2 h-4 w-4 text-blue-600" />
                    <label htmlFor="filter-pending">Onay Bekliyor</label>
                  </div>
                </div>
              </div>
              {selectedStatuses.length > 0 && (
                <>
                  <div className="border-t my-2"></div>
                  <div 
                    className="px-2 py-1.5 text-sm text-center cursor-pointer hover:bg-gray-100 rounded-sm"
                    onClick={() => {
                      setSelectedStatuses([]);
                      setStatusFilter("all");
                    }}
                  >
                    Filtreleri Temizle
                  </div>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddAnnouncement}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Duyuru Ekle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Oluşturulma Tarihi</TableHead>
              <TableHead>Başlangıç Tarihi</TableHead>
              <TableHead>Bitiş Tarihi</TableHead>
              <TableHead>Yazar</TableHead>
              <TableHead>Görüntülenme</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <span className="text-muted-foreground">Duyurular yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <MegaphoneIcon className="h-10 w-10 text-muted-foreground mb-4" />
                    {searchTerm || statusFilter !== "all" ? (
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Arama kriterlerine uygun duyuru bulunamadı</h3>
                        <p className="text-muted-foreground mb-2">Farklı filtreler kullanmayı veya arama terimini değiştirmeyi deneyin.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                          }}
                          className="mt-2"
                        >
                          Filtreleri Temizle
                        </Button>
                      </div>
                    ) : (
                      <div className="text-gray-500">Duyuru bulunamadı</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <TableRow 
                  key={generateUniqueId(announcement)}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onView(announcement)}
                >
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell>{formatDate(announcement.created_at || announcement.createdAt)}</TableCell>
                  <TableCell>{formatDate(announcement.start_date)}</TableCell>
                  <TableCell>{formatDate(announcement.end_date)}</TableCell>
                  <TableCell>{announcement.creator?.name || announcement.author || 'Bilinmiyor'}</TableCell>
                  <TableCell>{announcement.views || 0}</TableCell>
                  <TableCell>
                    {getStatusBadge(
                      announcement.published !== undefined 
                      ? announcement.published 
                      : (announcement.status as AnnouncementStatus || 'draft')
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Eğer ID yoksa silme işlemini engelle
                          if (!announcement.id || announcement.id.trim() === "") {
                            toast({
                              title: "Hata",
                              description: "Bu duyuru henüz kaydedilmemiş, silinemiyor.",
                              variant: "destructive",
                            });
                            return;
                          }
                          handleDelete(announcement.id);
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

      {/* Sayfalama */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList; 