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
  Announcement,
  AnnouncementStatus
} from "@/types/announcement"
import type { 
  CreateAnnouncementDTO
} from "@/interfaces/announcement"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  
  const defaultAnnouncement: Announcement = {
    id: "",
    title: "",
    slug: "",
    content: "",
    published: false,
    startDate: null,
    endDate: null,
    creatorId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Taslak",
    date: new Date().toISOString(),
    author: "Admin",
    views: 0,
    image: null,
    sourceUrl: null,
    category: "Bilgilendirme",
    visibility: "Herkese Açık"
  }
  
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<keyof Announcement>("title")
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
  }>({
    category: [],
    status: []
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  
  // Pagination için state'ler
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>(defaultAnnouncement);

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
      (item[searchField]?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesCategory = selectedFilters.category.length === 0 || 
      (item.category && selectedFilters.category.includes(item.category));

    const matchesStatus = selectedFilters.status.length === 0 || 
      selectedFilters.status.includes(item.status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
      if (!newAnnouncement.title || !newAnnouncement.content) {
        toast({
          title: "Hata",
          description: "Başlık ve içerik alanları zorunludur",
          variant: "destructive",
        });
        return;
      }

      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        isPublished: newAnnouncement.status === "Aktif",
        endDate: newAnnouncement.endDate
      };
      
      const response = await announcementService.createAnnouncement(announcementData);
      
      if (response.success && response.data) {
        const createdAnnouncement: Announcement = {
          ...defaultAnnouncement,
          ...response.data,
          title: response.data.title || "",
          content: response.data.content || "",
          status: response.data.published ? "Aktif" : "Pasif"
        };
        
        setAnnouncements(prev => [...prev, createdAnnouncement]);
        setSelectedAnnouncement(createdAnnouncement);
        setNewAnnouncement(defaultAnnouncement);
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
      console.error("Duyuru oluşturulurken hata:", error);
      toast({
        title: "Hata",
        description: "Duyuru oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement) return;
    
    try {
      const response = await announcementService.updateAnnouncement(
        editingAnnouncement.id,
        {
          title: editingAnnouncement.title,
          content: editingAnnouncement.content,
          isPublished: editingAnnouncement.status === "Aktif",
          endDate: editingAnnouncement.endDate
        }
      );
      
      if (response.success) {
        const updatedAnnouncements = announcements.map(ann => 
          ann.id === editingAnnouncement.id ? editingAnnouncement : ann
        );
        setAnnouncements(updatedAnnouncements);
        setSelectedAnnouncement(editingAnnouncement);
        setEditingAnnouncement(null);
        
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
      console.error("Duyuru güncellenirken hata:", error);
      toast({
        title: "Hata",
        description: "Duyuru güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewMode("preview");
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setViewMode("edit");
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    try {
      const response = await announcementService.deleteAnnouncement(announcement.id);
      
      if (response.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
        if (selectedAnnouncement?.id === announcement.id) {
          setSelectedAnnouncement(null);
        }
        if (editingAnnouncement?.id === announcement.id) {
          setEditingAnnouncement(null);
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
      console.error("Duyuru silinirken hata:", error);
      toast({
        title: "Hata",
        description: "Duyuru silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (announcement: Announcement, newStatus: AnnouncementStatus) => {
    try {
      const updatedAnnouncement = {
        ...announcement,
        status: newStatus,
        published: newStatus === "Aktif"
      };

      const response = await announcementService.updateAnnouncement(
        announcement.id,
        {
          title: updatedAnnouncement.title,
          content: updatedAnnouncement.content,
          isPublished: updatedAnnouncement.published,
          endDate: updatedAnnouncement.endDate
        }
      );
      
      if (response.success) {
        setAnnouncements(prev => 
          prev.map(a => a.id === announcement.id ? updatedAnnouncement : a)
        );
        if (selectedAnnouncement?.id === announcement.id) {
          setSelectedAnnouncement(updatedAnnouncement);
        }
        if (editingAnnouncement?.id === announcement.id) {
          setEditingAnnouncement(updatedAnnouncement);
        }
        
        toast({
          title: "Başarılı",
          description: "Duyuru durumu güncellendi",
        });
      } else {
        toast({
          title: "Hata",
          description: "Duyuru durumu güncellenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Duyuru durumu güncellenirken hata:", error);
      toast({
        title: "Hata",
        description: "Duyuru durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (selectedAnnouncement) {
          setSelectedAnnouncement({
            ...selectedAnnouncement,
            image: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAnnouncements();
      if (response.success && response.data) {
        const formattedAnnouncements: Announcement[] = response.data.map((item: any) => ({
          id: item.id,
          title: item.title || "",
          slug: item.slug || "",
          content: item.content || "",
          published: item.published || false,
          startDate: item.startDate || null,
          endDate: item.endDate || null,
          creatorId: item.creatorId || null,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          status: item.published ? "Aktif" : "Pasif",
          date: item.createdAt || new Date().toISOString(),
          author: item.author || "Admin",
          views: item.views || 0,
          image: item.image || null,
          sourceUrl: item.sourceUrl || null,
          category: item.category || "Bilgilendirme",
          visibility: item.visibility || "Herkese Açık"
        }));
        
        setAnnouncements(formattedAnnouncements);
        
        if (formattedAnnouncements.length > 0 && !selectedAnnouncement) {
          setSelectedAnnouncement(formattedAnnouncements[0]);
        }
      }
    } catch (error) {
      console.error("Duyurular yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Duyurular yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchAnnouncements();
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleUpdateSelectedAnnouncement = async () => {
    if (selectedAnnouncement) {
      try {
        setIsUpdating(true);
        
        const updateData = {
          title: selectedAnnouncement.title,
          content: selectedAnnouncement.content,
          isPublished: selectedAnnouncement.status === "Aktif",
          endDate: selectedAnnouncement.endDate,
          category: selectedAnnouncement.category || "Bilgilendirme",
          visibility: selectedAnnouncement.visibility || "Herkese Açık",
          image: selectedAnnouncement.image || null
        };
        
        const response = await announcementService.updateAnnouncement(selectedAnnouncement.id, updateData);
        
        if (response.success && response.data) {
          const updatedAnnouncement: Announcement = {
            ...selectedAnnouncement,
            ...response.data,
            status: response.data.published ? "Aktif" : "Pasif"
          };
          
          setAnnouncements(prev => 
            prev.map(item => item.id === updatedAnnouncement.id ? updatedAnnouncement : item)
          );
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
                            onValueChange={(value: AnnouncementStatus) => {
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
                              accept="image/*"
                              onChange={handleImageChange}
                              value={selectedAnnouncement?.image || ""}
                            />
                            {selectedAnnouncement?.image && (
                              <div className="mt-2">
                                <img 
                                  src={selectedAnnouncement.image} 
                                  alt="Duyuru görseli" 
                                  className="max-w-full h-auto rounded"
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
                              handleDeleteAnnouncement(announcement)
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
                    {viewMode === "preview" ? (
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
                              value={selectedAnnouncement.category || "Bilgilendirme"}
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
                            <Label htmlFor="edit-endDate">Son Tarih</Label>
                            <Input
                              id="edit-endDate"
                              type="date"
                              value={selectedAnnouncement.endDate || ""}
                              onChange={(e) => {
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  endDate: e.target.value || null
                                });
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-image">Görsel URL</Label>
                            <Input
                              id="edit-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              value={selectedAnnouncement?.image || ""}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-status">Durum</Label>
                            <Select
                              value={selectedAnnouncement.status}
                              onValueChange={(value: AnnouncementStatus) => {
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
                              value={selectedAnnouncement.visibility || "Herkese Açık"}
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