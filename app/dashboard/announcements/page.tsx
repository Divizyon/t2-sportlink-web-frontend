"use client"

import { useState, useEffect } from "react"
import type { ChangeEvent } from "react"
import { 
  MegaphoneIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  InfoIcon,
  EyeIcon,
  UsersIcon,
  SearchIcon,
  PencilIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import { announcementService } from "@/lib/services"
import type { 
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  Announcement
} from "@/interfaces/announcement"

// Tüm isteğe bağlı özellikleri açıkça işaretledim
interface AnnouncementDisplay {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  startDate: string | null;
  endDate: string | null;
  creatorId: string | null;
  createdAt: string;
  updatedAt: string;
  category: string;
  status: "Aktif" | "Pasif" | "Taslak";
  visibility: "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler";
  views: number;
  image?: string | undefined;
  date?: string | undefined;
  expiryDate?: string | undefined;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementDisplay[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<AnnouncementDisplay>>({
    title: "",
    content: "",
    category: "",
    status: "Aktif",
    visibility: "Herkese Açık",
    expiryDate: ""
  })
  
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementDisplay | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDisplay | undefined>(
    announcements.length > 0 ? announcements[0] : undefined
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<"title" | "content" | "category">("title")
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
  }>({
    category: [],
    status: []
  });
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Yeni viewMode state'i ekleyelim, haber sayfasındaki gibi
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  
  // Pagination için yeni state'ler
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const handleFilterChange = (type: 'category' | 'status', value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [type]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      }
    });
  };

  const filteredAnnouncements = announcements.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item[searchField].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedFilters.category.length === 0 || 
      selectedFilters.category.includes(item.category);

    const matchesStatus = selectedFilters.status.length === 0 || 
      selectedFilters.status.includes(item.status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Automatically select the first announcement from filtered list
  useEffect(() => {
    if (filteredAnnouncements.length > 0 && 
        (!selectedAnnouncement || !filteredAnnouncements.some(a => a.id === selectedAnnouncement.id))) {
      setSelectedAnnouncement(filteredAnnouncements[0]);
    }
  }, [filteredAnnouncements, selectedAnnouncement]);

  const getTotalSelectedFilters = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const handleAddAnnouncement = async () => {
    try {
      // Backend API'ye gönderilecek veriyi hazırla
      const announcementData: CreateAnnouncementDTO = {
        title: newAnnouncement.title || "",
        content: newAnnouncement.content || "",
        isPublished: newAnnouncement.status === "Aktif",
        endDate: newAnnouncement.expiryDate || null
      };
      
      const response = await announcementService.createAnnouncement(announcementData);
      
      if (response.success && response.data) {
        // Backend yanıtını frontend formatına dönüştür
        const createdAnnouncement: AnnouncementDisplay = {
          id: response.data.id,
          title: response.data.title,
          slug: response.data.slug,
          content: response.data.content,
          published: response.data.published,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          creatorId: response.data.creatorId,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          category: newAnnouncement.category || "Bilgilendirme",
          status: response.data.published ? "Aktif" : "Pasif",
          visibility: newAnnouncement.visibility || "Herkese Açık",
          views: 0,
          image: newAnnouncement.image,
          date: response.data.createdAt ? new Date(response.data.createdAt).toISOString().split('T')[0] : undefined,
          expiryDate: newAnnouncement.expiryDate
        };
        
        // State'i güncelle
        setAnnouncements([...announcements, createdAnnouncement]);
        setSelectedAnnouncement(createdAnnouncement);
        
        // Form alanlarını temizle
        setNewAnnouncement({
          title: "",
          content: "",
          category: "",
          status: "Aktif",
          visibility: "Herkese Açık",
          expiryDate: ""
        });
        
        // Dialog'u kapat
        setIsDialogOpen(false);
        
        toast({
          title: "Başarılı",
          description: "Duyuru başarıyla oluşturuldu",
        });
      } else {
        toast({
          title: "Hata",
          description: "Duyuru oluşturulurken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Duyuru oluşturma hatası:", error);
      toast({
        title: "Hata",
        description: "Duyuru oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleEditAnnouncement = async () => {
    if (editingAnnouncement) {
      try {
        // Backend API'ye gönderilecek veriyi hazırla
        const updateData: UpdateAnnouncementDTO = {
          title: editingAnnouncement.title,
          content: editingAnnouncement.content,
          isPublished: editingAnnouncement.status === "Aktif",
          endDate: editingAnnouncement.expiryDate || null
        };
        
        const response = await announcementService.updateAnnouncement(editingAnnouncement.id, updateData);
        
        if (response.success && response.data) {
          // Backend yanıtını frontend formatına dönüştür
          const updatedAnnouncement: AnnouncementDisplay = {
            id: response.data.id,
            title: response.data.title,
            slug: response.data.slug,
            content: response.data.content,
            published: response.data.published,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            creatorId: response.data.creatorId,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            category: editingAnnouncement.category,
            status: response.data.published ? "Aktif" : "Pasif",
            visibility: editingAnnouncement.visibility,
            views: editingAnnouncement.views,
            image: editingAnnouncement.image,
            date: response.data.createdAt ? new Date(response.data.createdAt).toISOString().split('T')[0] : undefined,
            expiryDate: editingAnnouncement.expiryDate
          };
          
          // State'i güncelle
          const updatedAnnouncements = announcements.map((item) =>
            item.id === updatedAnnouncement.id ? updatedAnnouncement : item
          );
          
          setAnnouncements(updatedAnnouncements);
          setSelectedAnnouncement(updatedAnnouncement);
          setEditingAnnouncement(null);
          setIsDialogOpen(false);
          
          toast({
            title: "Başarılı",
            description: "Duyuru başarıyla güncellendi",
          });
        } else {
          toast({
            title: "Hata",
            description: "Duyuru güncellenirken bir hata oluştu",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Duyuru güncelleme hatası:", error);
        toast({
          title: "Hata", 
          description: "Duyuru güncellenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) {
      try {
        const response = await announcementService.deleteAnnouncement(id);
        
        if (response.success) {
          // State'i güncelle
          const updatedAnnouncements = announcements.filter((item) => item.id !== id);
          setAnnouncements(updatedAnnouncements);
          
          // Seçili duyuru silindiyse, ilk duyuruyu seç
          if (selectedAnnouncement && selectedAnnouncement.id === id) {
            setSelectedAnnouncement(updatedAnnouncements.length > 0 ? updatedAnnouncements[0] : undefined);
          }
          
          toast({
            title: "Başarılı",
            description: "Duyuru başarıyla silindi",
          });
        } else {
          toast({
            title: "Hata",
            description: "Duyuru silinirken bir hata oluştu",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Duyuru silme hatası:", error);
        toast({
          title: "Hata",
          description: "Duyuru silinirken bir hata oluştu",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif": return "bg-green-100 text-green-800"
      case "Pasif": return "bg-gray-100 text-gray-800"
      case "Taslak": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Resim yükleme için yardımcı fonksiyon
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Yalnızca PNG, JPG ve JPEG formatlarını kabul et
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Lütfen sadece PNG, JPG veya JPEG formatında dosya yükleyiniz.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      if (editingAnnouncement) {
        setEditingAnnouncement({
          ...editingAnnouncement,
          image: base64String
        });
      } else {
        setNewAnnouncement({
          ...newAnnouncement,
          image: base64String
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // API'den duyuruları çekme
  const fetchAnnouncements = async (page = 1, itemsPerPage = 10) => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements(page, itemsPerPage, false);
      
      if (response.success && response.data) {
        // Pagination bilgilerini set et
        if (response.pagination) {
          setCurrentPage(response.pagination.page);
          setTotalPages(response.pagination.totalPages);
          setPageSize(response.pagination.pageSize);
          setTotalCount(response.pagination.totalCount);
        }
        
        // Backend API'den gelen verileri frontend için uygun formata dönüştürüyoruz
        const formattedAnnouncements = response.data.map((item: Announcement) => {
          // Duyuruya göre uygun kategori atama
          let category = "Bilgilendirme";
          if (item.title.toLowerCase().includes("etkinlik") || item.content.toLowerCase().includes("etkinlik")) {
            category = "Etkinlik";
          } else if (item.title.toLowerCase().includes("bakım") || item.content.toLowerCase().includes("bakım")) {
            category = "Bakım";
          }
          
          // Tarih formatları için dönüştürme
          const startDateDisplay = item.startDate ? new Date(item.startDate).toLocaleDateString('tr-TR') : undefined;
          const endDateDisplay = item.endDate ? new Date(item.endDate).toLocaleDateString('tr-TR') : undefined;
          
          // Görsel seçimi için mantık oluşturma
          let image = "/images/default-announcement.jpg";
          if (category === "Etkinlik") {
            image = "/images/event-announcement.jpg";
          } else if (category === "Bakım") {
            image = "/images/maintenance.jpg";
          } else if (item.id && parseInt(item.id) % 2 === 0) {
            image = "/images/summer-camp.jpg";
          }
          
          const announcement: AnnouncementDisplay = {
            id: item.id,
            title: item.title,
            slug: item.slug,
            content: item.content,
            published: item.published,
            startDate: item.startDate,
            endDate: item.endDate,
            creatorId: item.creatorId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            category: category,
            status: item.published ? "Aktif" : "Pasif", 
            visibility: item.creatorId ? "Sadece Üyeler" : "Herkese Açık", // CreatorId varsa sadece üyelere görünür
            views: Math.floor(Math.random() * 1000), // Mock veri
            image: image,
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : undefined,
            expiryDate: endDateDisplay
          };
          return announcement;
        });
        
        setAnnouncements(formattedAnnouncements);
        
        // İlk duyuruyu seç eğer herhangi bir duyuru seçili değilse
        if (formattedAnnouncements.length > 0 && !selectedAnnouncement) {
          setSelectedAnnouncement(formattedAnnouncements[0]);
        }
      } else {
        toast({
          title: "Hata",
          description: "Duyurular yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Duyurular alınırken hata:", error);
      toast({
        title: "Hata",
        description: "Duyurular yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchAnnouncements(page, pageSize);
    }
  };

  // Sayfa yüklendiğinde duyuruları çek
  useEffect(() => {
    fetchAnnouncements(currentPage, pageSize);
  }, []);

  // Seçili duyuruyu güncelleme fonksiyonu (edit tabındaki kaydet butonu için)
  const handleUpdateSelectedAnnouncement = async () => {
    if (selectedAnnouncement) {
      try {
        setIsUpdating(true);
        
        // Backend API'ye gönderilecek veriyi hazırla
        const updateData: UpdateAnnouncementDTO = {
          title: selectedAnnouncement.title,
          content: selectedAnnouncement.content,
          isPublished: selectedAnnouncement.status === "Aktif",
          endDate: selectedAnnouncement.expiryDate || null
        };
        
        const response = await announcementService.updateAnnouncement(selectedAnnouncement.id, updateData);
        
        if (response.success && response.data) {
          // Backend yanıtını frontend formatına dönüştür
          const updatedAnnouncement: AnnouncementDisplay = {
            id: response.data.id,
            title: response.data.title,
            slug: response.data.slug,
            content: response.data.content,
            published: response.data.published,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            creatorId: response.data.creatorId,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            category: selectedAnnouncement.category,
            status: response.data.published ? "Aktif" : "Pasif",
            visibility: selectedAnnouncement.visibility,
            views: selectedAnnouncement.views,
            image: selectedAnnouncement.image,
            date: response.data.createdAt ? new Date(response.data.createdAt).toISOString().split('T')[0] : undefined,
            expiryDate: selectedAnnouncement.expiryDate
          };
          
          // State'i güncelle
          const updatedAnnouncements = announcements.map((item) =>
            item.id === updatedAnnouncement.id ? updatedAnnouncement : item
          );
          
          setAnnouncements(updatedAnnouncements);
          setSelectedAnnouncement(updatedAnnouncement);
          
          toast({
            title: "Başarılı",
            description: "Duyuru başarıyla güncellendi",
          });
        } else {
          toast({
            title: "Hata",
            description: "Duyuru güncellenirken bir hata oluştu",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Duyuru güncelleme hatası:", error);
        toast({
          title: "Hata",
          description: "Duyuru güncellenirken bir hata oluştu",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <Toaster />
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Duyurular yükleniyor...</p>
          </div>
        </div>
      ) : (
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Duyurular</h1>
          
        </div>

        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-180px)]">
          <div className="overflow-auto border rounded-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Duyuru ara..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <SearchIcon className="h-4 w-4" />
                </Button>
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
                          {['Etkinlik', 'Bilgilendirme'].map((category) => (
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
                          {['Aktif', 'Pasif', 'Taslak'].map((status) => (
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
              <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Yeni duyuru ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAnnouncement ? "Duyuru Düzenle" : "Yeni Duyuru Ekle"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Başlık
                        </Label>
                        <Input
                          id="title"
                          placeholder="Duyuru başlığı"
                          className="col-span-3"
                          value={editingAnnouncement?.title || newAnnouncement.title}
                          onChange={(e) => {
                            if (editingAnnouncement) {
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                title: e.target.value,
                              })
                            } else {
                              setNewAnnouncement({
                                ...newAnnouncement,
                                title: e.target.value,
                              })
                            }
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Kategori
                        </Label>
                        <Select
                          value={editingAnnouncement?.category || newAnnouncement.category || ""}
                          onValueChange={(value: string) => {
                            if (editingAnnouncement) {
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                category: value,
                              })
                            } else {
                              setNewAnnouncement({
                                ...newAnnouncement,
                                category: value,
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Etkinlik">Etkinlik</SelectItem>
                            <SelectItem value="Bilgilendirme">Bilgilendirme</SelectItem>
                            <SelectItem value="Bakım">Bakım</SelectItem>
                            <SelectItem value="Diğer">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Durum
                        </Label>
                        <Select
                          value={editingAnnouncement?.status || newAnnouncement.status || "Aktif"}
                          onValueChange={(value: "Aktif" | "Pasif" | "Taslak") => {
                            if (editingAnnouncement) {
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                status: value,
                              })
                            } else {
                              setNewAnnouncement({
                                ...newAnnouncement,
                                status: value,
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Pasif">Pasif</SelectItem>
                            <SelectItem value="Taslak">Taslak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="visibility" className="text-right">
                          Görünürlük
                        </Label>
                        <Select
                          value={editingAnnouncement?.visibility || newAnnouncement.visibility || "Herkese Açık"}
                          onValueChange={(value: "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler") => {
                            if (editingAnnouncement) {
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                visibility: value,
                              })
                            } else {
                              setNewAnnouncement({
                                ...newAnnouncement,
                                visibility: value,
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Görünürlük seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Herkese Açık">Herkese Açık</SelectItem>
                            <SelectItem value="Sadece Üyeler">Sadece Üyeler</SelectItem>
                            <SelectItem value="Yöneticiler">Yöneticiler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiryDate" className="text-right">
                          Son Tarih
                        </Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          className="col-span-3"
                          value={editingAnnouncement?.expiryDate || newAnnouncement.expiryDate}
                          onChange={(e) => {
                            if (editingAnnouncement) {
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                expiryDate: e.target.value,
                              })
                            } else {
                              setNewAnnouncement({
                                ...newAnnouncement,
                                expiryDate: e.target.value,
                              })
                            }
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                          Görsel
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <Input
                            id="image"
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleImageUpload}
                          />
                          {(editingAnnouncement?.image || newAnnouncement.image) && (
                            <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                              <Image
                                src={editingAnnouncement?.image || newAnnouncement.image || ""}
                                alt="Duyuru Görseli"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="text-xs text-gray-500">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="content" className="text-right pt-2">
                          İçerik
                        </Label>
                        <Textarea
                          id="content"
                          placeholder="Duyuru içeriği"
                          className="col-span-3 min-h-[120px]"
                          value={editingAnnouncement?.content || newAnnouncement.content}
                          onChange={(e) => {
                            if (editingAnnouncement) {
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                content: e.target.value,
                              })
                            } else {
                              setNewAnnouncement({
                                ...newAnnouncement,
                                content: e.target.value,
                              })
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button
                        onClick={
                          editingAnnouncement
                            ? handleEditAnnouncement
                            : handleAddAnnouncement
                        }
                      >
                        {editingAnnouncement ? "Güncelle" : "Ekle"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[100px]">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow 
                    key={announcement.id} 
                    className={`cursor-pointer ${selectedAnnouncement?.id === announcement.id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <TableCell>
                      <div className="relative h-12 w-20 rounded-md overflow-hidden bg-muted">
                        {announcement.image ? (
                          <Image
                            src={announcement.image}
                            alt={announcement.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MegaphoneIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{announcement.category}</TableCell>
                    <TableCell>{announcement.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(announcement.status)}>
                        {announcement.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnnouncement(announcement.id)
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination kontrolleri */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Önceki
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
                <div className="ml-4 text-sm text-muted-foreground">
                  Toplam {totalCount} duyuru, {currentPage}/{totalPages} sayfa
                </div>
              </div>
            )}
          </div>

          <div className="overflow-auto border rounded-lg bg-muted/5 h-full">
            {selectedAnnouncement ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Duyuru Önizleme</CardTitle>
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
                        disabled={!selectedAnnouncement}
                        onClick={() => setViewMode("edit")}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto pt-2">
                  {selectedAnnouncement ? (
                    viewMode === "preview" ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedAnnouncement.title}</h2>
                            <p className="text-sm text-muted-foreground">
                              {selectedAnnouncement.category} | {selectedAnnouncement.date}
                            </p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(selectedAnnouncement.status)}>
                            {selectedAnnouncement.status}
                          </Badge>
                        </div>
                        {selectedAnnouncement.image && (
                          <div className="relative h-48 w-full rounded-md overflow-hidden">
                            <Image
                              src={selectedAnnouncement.image}
                              alt={selectedAnnouncement.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="prose max-w-none whitespace-pre-wrap">
                          {selectedAnnouncement.content}
                        </div>
                        {selectedAnnouncement.expiryDate && (
                          <div className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Son Geçerlilik Tarihi:</span> {selectedAnnouncement.expiryDate}
                          </div>
                        )}
                        {selectedAnnouncement.visibility !== "Herkese Açık" && (
                          <div className="text-sm text-amber-600 mt-2">
                            <InfoIcon className="inline-block h-4 w-4 mr-1" />
                            <span>Bu duyuru sadece "{selectedAnnouncement.visibility}" için görünür.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-title">Başlık</Label>
                            <Input
                              id="edit-title"
                              value={selectedAnnouncement.title}
                              onChange={(e) => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  title: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-content">İçerik</Label>
                            <Textarea
                              id="edit-content"
                              value={selectedAnnouncement.content}
                              onChange={(e) => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  content: e.target.value,
                                });
                              }}
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-category">Kategori</Label>
                            <Select
                              value={selectedAnnouncement.category}
                              onValueChange={(value) => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  category: value,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Etkinlik">Etkinlik</SelectItem>
                                <SelectItem value="Bilgilendirme">Bilgilendirme</SelectItem>
                                <SelectItem value="Bakım">Bakım</SelectItem>
                                <SelectItem value="Diğer">Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-expiryDate">Son Tarih</Label>
                            <Input
                              id="edit-expiryDate"
                              type="date"
                              value={selectedAnnouncement.expiryDate}
                              onChange={(e) => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  expiryDate: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-image">Görsel URL</Label>
                            <Input
                              id="edit-image"
                              value={selectedAnnouncement.image}
                              onChange={(e) => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  image: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-status">Durum</Label>
                            <Select
                              value={selectedAnnouncement.status}
                              onValueChange={(value: "Aktif" | "Pasif" | "Taslak") => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  status: value,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Durum seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aktif">Aktif</SelectItem>
                                <SelectItem value="Pasif">Pasif</SelectItem>
                                <SelectItem value="Taslak">Taslak</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-visibility">Görünürlük</Label>
                            <Select
                              value={selectedAnnouncement.visibility}
                              onValueChange={(value: "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler") => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  visibility: value,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Görünürlük seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Herkese Açık">Herkese Açık</SelectItem>
                                <SelectItem value="Sadece Üyeler">Sadece Üyeler</SelectItem>
                                <SelectItem value="Yöneticiler">Yöneticiler</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-end pt-4">
                            <Button 
                              onClick={() => {
                                handleUpdateSelectedAnnouncement();
                                setViewMode("preview");
                              }}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <div className="flex items-center">
                                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                  Güncelleniyor...
                                </div>
                              ) : (
                                "Değişiklikleri Kaydet"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Önizlemek için bir duyuru seçin
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Lütfen görüntülemek için bir duyuru seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  )
} 