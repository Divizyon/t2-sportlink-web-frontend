"use client"

import { useState } from "react"
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
import Image from "next/image"

interface Announcement {
  id: number
  title: string
  content: string
  category: string
  date: string
  status: "Aktif" | "Pasif" | "Taslak"
  priority: "Düşük" | "Orta" | "Yüksek" | "Kritik"
  image?: string
  author: string
  targetAudience: string[]
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
      priority: "Yüksek",
      image: "/images/summer-camp.jpg",
      author: "Spor Koordinatörü",
      targetAudience: ["Üyeler", "Veliler"],
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
      priority: "Kritik",
      image: "/images/maintenance.jpg",
      author: "Tesis Müdürü",
      targetAudience: ["Tüm Üyeler"],
      views: 567,
      expiryDate: "2023-06-25"
    }
  ])
  
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    category: "",
    status: "Aktif",
    priority: "Orta",
    author: "",
    targetAudience: [],
    expiryDate: ""
  })
  
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(
    announcements.length > 0 ? announcements[0] : undefined
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAnnouncements = announcements.filter(
    (announcement) => 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      priority: "Orta",
      author: "",
      targetAudience: [],
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Düşük": return "bg-blue-100 text-blue-800"
      case "Orta": return "bg-green-100 text-green-800"
      case "Yüksek": return "bg-orange-100 text-orange-800"
      case "Kritik": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Duyurular</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Duyuru ara..."
              className="w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>
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
                  <Label htmlFor="priority" className="text-right">
                    Öncelik
                  </Label>
                  <Select
                    value={editingAnnouncement?.priority || newAnnouncement.priority || "Orta"}
                    onValueChange={(value: "Düşük" | "Orta" | "Yüksek" | "Kritik") => {
                      if (editingAnnouncement) {
                        setEditingAnnouncement({
                          ...editingAnnouncement,
                          priority: value,
                        })
                      } else {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          priority: value,
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Düşük">Düşük</SelectItem>
                      <SelectItem value="Orta">Orta</SelectItem>
                      <SelectItem value="Yüksek">Yüksek</SelectItem>
                      <SelectItem value="Kritik">Kritik</SelectItem>
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
                  <Label htmlFor="author" className="text-right">
                    Yazar
                  </Label>
                  <Input
                    id="author"
                    placeholder="Duyuru yazarı"
                    className="col-span-3"
                    value={editingAnnouncement?.author || newAnnouncement.author}
                    onChange={(e) => {
                      if (editingAnnouncement) {
                        setEditingAnnouncement({
                          ...editingAnnouncement,
                          author: e.target.value,
                        })
                      } else {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          author: e.target.value,
                        })
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetAudience" className="text-right">
                    Hedef Kitle
                  </Label>
                  <Input
                    id="targetAudience"
                    placeholder="Hedef kitle (virgülle ayırın)"
                    className="col-span-3"
                    value={editingAnnouncement?.targetAudience.join(", ") || newAnnouncement.targetAudience?.join(", ") || ""}
                    onChange={(e) => {
                      const audiences = e.target.value.split(",").map(item => item.trim()).filter(Boolean)
                      if (editingAnnouncement) {
                        setEditingAnnouncement({
                          ...editingAnnouncement,
                          targetAudience: audiences,
                        })
                      } else {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          targetAudience: audiences,
                        })
                      }
                    }}
                  />
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

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-130px)]">
        <div className="overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Öncelik</TableHead>
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
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell>{announcement.category}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                  </TableCell>
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
                          setEditingAnnouncement(announcement)
                          setIsDialogOpen(true)
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
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
                    <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                      {selectedAnnouncement.priority}
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
                    <UsersIcon className="mr-1 h-4 w-4" />
                    <span>Yazar: {selectedAnnouncement.author}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="mr-1 h-4 w-4" />
                    <span>Görüntülenme: {selectedAnnouncement.views}</span>
                  </div>
                  <div className="flex items-center">
                    <InfoIcon className="mr-1 h-4 w-4" />
                    <span>Hedef Kitle: {selectedAnnouncement.targetAudience.join(", ")}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto pt-2">
                <Tabs defaultValue="content">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">İçerik</TabsTrigger>
                    <TabsTrigger value="preview">Önizleme</TabsTrigger>
                  </TabsList>
                  <TabsContent value="content" className="mt-4 min-h-[250px]">
                    <div className="whitespace-pre-wrap">
                      {selectedAnnouncement.content}
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4 min-h-[250px]">
                    <div className="border rounded-lg p-4 bg-card text-card-foreground">
                      <div className="flex flex-col gap-4">
                        {selectedAnnouncement.image && (
                          <div className="rounded-md overflow-hidden">
                            <div className="relative h-56 w-full rounded-md bg-muted">
                              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                <MegaphoneIcon className="h-10 w-10" />
                                <span className="ml-2">Görsel Önizlemesi</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{selectedAnnouncement.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedAnnouncement.author} | {selectedAnnouncement.date}
                          </p>
                        </div>
                        <div className="whitespace-pre-wrap">
                          {selectedAnnouncement.content}
                        </div>
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