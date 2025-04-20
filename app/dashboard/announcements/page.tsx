"use client"

import { useState, useEffect } from "react"
import type { ChangeEvent } from "react"
import { 
  MegaphoneIcon,
  MoreHorizontalIcon, 
  PencilIcon, 
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  InfoIcon,
  EyeIcon,
  UsersIcon,
  SearchIcon
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

interface Announcement {
  id: number
  title: string
  content: string
  category: string
  date: string
  status: "Aktif" | "Pasif" | "Taslak"
  image?: string
  visibility: "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler"
  views: number
  expiryDate: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Yaz Spor Kampı Kayıtları Başladı",
      content: "Değerli üyelerimiz,\n\nBu yıl 5. kez düzenleyeceğimiz Yaz Spor Kampı kayıtları başlamıştır. 7-15 yaş arası tüm çocuklar katılabilir.\n\nKamp programında:\n- Yüzme\n- Basketbol\n- Futbol\n- Voleybol\n- Tenis\nbranşlarında eğitimler verilecektir.\n\nKontenjan sınırlıdır, erken kayıt yaptıran aileler indirimden faydalanacaktır.\n\nKayıt ve detaylı bilgi için resepsiyon personelimizle iletişime geçebilirsiniz.",
      category: "Etkinlik",
      date: "2023-05-15",
      status: "Aktif",
      image: "/images/summer-camp.jpg",
      visibility: "Herkese Açık",
      views: 342,
      expiryDate: "2023-06-30"
    },
    {
      id: 2,
      title: "Tesis Bakım Çalışması Hakkında Bilgilendirme",
      content: "Değerli üyelerimiz,\n\nTesisimizde 20-25 Haziran tarihleri arasında yıllık bakım çalışması yapılacaktır.\n\nBu süre zarfında:\n- Havuz kullanıma kapalı olacaktır\n- Fitness salonu 09:00-17:00 saatleri arasında hizmet verecektir\n- Tenis kortları normal şekilde kullanılabilecektir\n\nBakım çalışmalarımız tesisimizin daha kaliteli hizmet verebilmesi için gerçekleştirilmektedir. Anlayışınız için teşekkür ederiz.",
      category: "Bilgilendirme",
      date: "2023-06-10",
      status: "Aktif",
      image: "/images/maintenance.jpg",
      visibility: "Herkese Açık",
      views: 567,
      expiryDate: "2023-06-25"
    }
  ])
  
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    category: "",
    status: "Aktif",
    visibility: "Herkese Açık",
    expiryDate: ""
  })
  
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(
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

  const handleAddAnnouncement = () => {
    const newAnnouncementWithId = {
      ...newAnnouncement,
      id: announcements.length + 1,
      date: new Date().toISOString().split("T")[0],
      views: 0
    } as Announcement
    
    const updatedAnnouncements = [...announcements, newAnnouncementWithId]
    setAnnouncements(updatedAnnouncements)
    setSelectedAnnouncement(newAnnouncementWithId)
    setNewAnnouncement({
      title: "",
      content: "",
      category: "",
      status: "Aktif",
      visibility: "Herkese Açık",
      expiryDate: ""
    })
    setIsDialogOpen(false)
  }

  const handleEditAnnouncement = () => {
    if (editingAnnouncement) {
      const updatedAnnouncements = announcements.map((announcement) =>
        announcement.id === editingAnnouncement.id ? editingAnnouncement : announcement
      )
      setAnnouncements(updatedAnnouncements)
      setSelectedAnnouncement(editingAnnouncement)
      setEditingAnnouncement(null)
      setIsDialogOpen(false)
    }
  }

  const handleDeleteAnnouncement = (id: number) => {
    const updatedAnnouncements = announcements.filter((announcement) => announcement.id !== id)
    setAnnouncements(updatedAnnouncements)
    
    if (selectedAnnouncement?.id === id) {
      setSelectedAnnouncement(updatedAnnouncements.length > 0 ? updatedAnnouncements[0] : undefined)
    }
  }

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

  return (
    <div className="h-full p-4 space-y-4">
      <Toaster />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Duyurular</h1>
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

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-130px)]">
        <div className="overflow-auto border rounded-lg">
          <div className="flex items-center gap-4 p-4">
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
            </div>
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
        </div>

        <div className="overflow-auto border rounded-lg bg-muted/5 h-full">
          {selectedAnnouncement ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{selectedAnnouncement.title}</CardTitle>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getStatusColor(selectedAnnouncement.status)}>
                      {selectedAnnouncement.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <span>Oluşturulma: {selectedAnnouncement.date}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <span>Son Tarih: {selectedAnnouncement.expiryDate}</span>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="mr-1 h-4 w-4" />
                    <span>Kategori: {selectedAnnouncement.category}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="mr-1 h-4 w-4" />
                    <span>Görüntülenme: {selectedAnnouncement.views}</span>
                  </div>
                  <div className="flex items-center">
                    <InfoIcon className="mr-1 h-4 w-4" />
                    <span>Görünürlük: {selectedAnnouncement.visibility}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto pt-2">
                <Tabs defaultValue="preview">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Önizleme</TabsTrigger>
                    <TabsTrigger value="edit">Düzenle</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4 min-h-[250px]">
                    <div className="border rounded-lg p-4 bg-card text-card-foreground">
                      <div className="flex flex-col gap-4">
                        {selectedAnnouncement.image && (
                          <div className="rounded-md overflow-hidden">
                            <div className="relative h-56 w-full rounded-md bg-muted">
                              <Image
                                src={selectedAnnouncement.image}
                                alt={selectedAnnouncement.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{selectedAnnouncement.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedAnnouncement.date}
                          </p>
                        </div>
                        <div className="whitespace-pre-wrap">
                          {selectedAnnouncement.content}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="edit" className="mt-4 min-h-[250px]">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-title" className="text-right">
                          Başlık
                        </Label>
                        <Input
                          id="edit-title"
                          placeholder="Duyuru başlığı"
                          className="col-span-3"
                          value={selectedAnnouncement.title}
                          onChange={(e) => {
                            setSelectedAnnouncement({
                              ...selectedAnnouncement,
                              title: e.target.value,
                            });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-category" className="text-right">
                          Kategori
                        </Label>
                        <Select
                          value={selectedAnnouncement.category}
                          onValueChange={(value: string) => {
                            setSelectedAnnouncement({
                              ...selectedAnnouncement,
                              category: value,
                            });
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
                        <Label htmlFor="edit-status" className="text-right">
                          Durum
                        </Label>
                        <Select
                          value={selectedAnnouncement.status}
                          onValueChange={(value: "Aktif" | "Pasif" | "Taslak") => {
                            setSelectedAnnouncement({
                              ...selectedAnnouncement,
                              status: value,
                            });
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
                        <Label htmlFor="edit-visibility" className="text-right">
                          Görünürlük
                        </Label>
                        <Select
                          value={selectedAnnouncement.visibility}
                          onValueChange={(value: "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler") => {
                            setSelectedAnnouncement({
                              ...selectedAnnouncement,
                              visibility: value,
                            });
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
                        <Label htmlFor="edit-expiryDate" className="text-right">
                          Son Tarih
                        </Label>
                        <Input
                          id="edit-expiryDate"
                          type="date"
                          className="col-span-3"
                          value={selectedAnnouncement.expiryDate}
                          onChange={(e) => {
                            setSelectedAnnouncement({
                              ...selectedAnnouncement,
                              expiryDate: e.target.value,
                            });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-image" className="text-right">
                          Görsel
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <Input
                            id="edit-image"
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => {
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
                                setSelectedAnnouncement({
                                  ...selectedAnnouncement,
                                  image: base64String
                                });
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          {selectedAnnouncement.image && (
                            <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                              <Image
                                src={selectedAnnouncement.image}
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
                        <Label htmlFor="edit-content" className="text-right pt-2">
                          İçerik
                        </Label>
                        <Textarea
                          id="edit-content"
                          placeholder="Duyuru içeriği"
                          className="col-span-3 min-h-[120px]"
                          value={selectedAnnouncement.content}
                          onChange={(e) => {
                            setSelectedAnnouncement({
                              ...selectedAnnouncement,
                              content: e.target.value,
                            });
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          onClick={() => {
                            setIsUpdating(true);
                            // Simulate a short delay to show loading state
                            setTimeout(() => {
                              const updatedAnnouncements = announcements.map((announcement) =>
                                announcement.id === selectedAnnouncement.id ? selectedAnnouncement : announcement
                              );
                              setAnnouncements(updatedAnnouncements);
                              setIsUpdating(false);
                              toast({
                                title: "Duyuru güncellendi",
                                description: "Duyuru başarıyla güncellendi.",
                                variant: "default",
                              });
                            }, 500);
                          }}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <div className="flex items-center">
                              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                              Güncelleniyor...
                            </div>
                          ) : (
                            "Güncelle"
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
  )
} 