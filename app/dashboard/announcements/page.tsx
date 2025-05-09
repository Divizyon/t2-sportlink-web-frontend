"use client"

import { useState, useEffect, useRef } from "react"
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Plus, 
  MegaphoneIcon,
  Loader2,
  ClockIcon, 
  AlarmClockIcon 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import useStore from '@/lib/store'
import type { 
  Announcement,
  AnnouncementStatus
} from "@/interfaces/announcement"
import { AnnouncementFormModal } from "@/components/announcements/AnnouncementFormModal"
import AnnouncementList from "@/components/announcements/AnnouncementList"
import AnnouncementPreview from "@/components/announcements/AnnouncementPreview"

// ExtendedAnnouncement tipi için
interface ExtendedAnnouncement extends Announcement {
  sourceUrl?: string;
  category?: string;
}

export default function AnnouncementsPage() {
  // Modal ve duyuru yönetimi için state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAnnouncement, setModalAnnouncement] = useState<ExtendedAnnouncement | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ExtendedAnnouncement | null>(null)
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview")
  
  // Store'dan gerekli durumları ve fonksiyonları al
  const announcements = useStore(state => state.announcements)
  const isLoading = useStore(state => state.isLoading)
  const error = useStore(state => state.error)
  const getAnnouncements = useStore(state => state.getAnnouncements)
  const updateAnnouncement = useStore(state => state.updateAnnouncement)
  const setCurrentAnnouncement = useStore(state => state.setCurrentAnnouncement)
  
  const { toast } = useToast()

  // Varsayılan görsel
  const defaultImage = "/images/announcement-placeholder.jpg";

  // Veri durumunu takip etmek için ek state
  const [dataLoaded, setDataLoaded] = useState(false)

  // Ref ile ilk montaj durumunu kontrol et
  const isFirstMount = useRef(true);

  // İlk yükleme, sadece bir kez çalışacak
  useEffect(() => {
    // İlk montaj sırasında sadece bir kez çalışır
    if (isFirstMount.current) {
      console.log("Dashboard Announcements: İlk yükleme yapılıyor - Component ID:", Math.random().toString(36).substring(7));
      
      // API'den verileri al
      getAnnouncements();
      
      isFirstMount.current = false;
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // API yanıtını izle
  useEffect(() => {
    // Yükleme tamamlandıysa ve veriler (boş olsa bile) geldiyse
    if (!isLoading) {
      console.log("Veri yükleme tamamlandı, announcements:", announcements);
      setDataLoaded(true);
      
      // Eğer duyurular varsa ve henüz seçili duyuru yoksa otomatik olarak ilk duyuruyu seç
      if (announcements && announcements.length > 0 && !selectedAnnouncement) {
        setSelectedAnnouncement(announcements[0] as ExtendedAnnouncement);
        setViewMode("preview");
      }
    }
  }, [isLoading, announcements, selectedAnnouncement]);

  // Hata durumunda kullanıcıya bildir
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Duyuru düzenleme
  const handleEdit = (announcement: Announcement) => {
    console.log("handleEdit çağrıldı:", announcement);
    setModalAnnouncement(announcement as ExtendedAnnouncement);
    setIsModalOpen(true);
  }

  // Duyuru görüntüleme
  const handleView = (announcement: Announcement) => {
    console.log("handleView çağrıldı:", announcement);
    setSelectedAnnouncement(announcement as ExtendedAnnouncement);
    setViewMode("preview");
  }

  // Yeni duyuru ekleme
  const handleAdd = () => {
    console.log("handleAdd çağrıldı - Yeni duyuru ekleme butonu tıklandı");
    // Modalda gösterilecek duyuruyu null olarak ayarla (yeni duyuru oluşturma)
    setModalAnnouncement(null);
    // Store'daki mevcut duyuruyu temizle
    setCurrentAnnouncement(null);
    // Sonra modal'ı aç
    console.log("Modal açılıyor, isModalOpen değeri:", isModalOpen, " -> true");
    setIsModalOpen(true);
  }

  // Duyuru verilerini güncelleme
  const handleChange = (name: string, value: string | number | string[] | boolean | null) => {
    if (selectedAnnouncement) {
      setSelectedAnnouncement({
        ...selectedAnnouncement,
        [name]: value
      });
    }
  }

  // Önizleme modunda duyuruyu güncelleme
  const handleEditAnnouncement = async () => {
    if (!selectedAnnouncement) {
      console.error("Seçili duyuru bulunamadı:", selectedAnnouncement);
      toast({
        title: "Hata",
        description: "Duyuru bulunamadı.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedAnnouncement.id) {
      console.error("Duyuru ID'si bulunamadı:", selectedAnnouncement);
      toast({
        title: "Hata",
        description: "Duyuru ID'si bulunamadı veya henüz kaydedilmemiş.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("%c Duyuru güncelleme işlemi başlatıldı", "background: #e0f7fa; color: #00695c; font-weight: bold;");
      console.log("Güncellenecek duyuru verileri:", JSON.stringify(selectedAnnouncement, null, 2));
      
      // Daha güvenli yaklaşım - API için gerekli veri yapısını oluştur
      const updateData: Partial<Record<string, any>> = {
        title: selectedAnnouncement.title,
        content: selectedAnnouncement.content
      };
      
      // Optional fields - only add if they exist and are valid
      if (typeof selectedAnnouncement.summary === 'string') {
        updateData.summary = selectedAnnouncement.summary;
      }
      
      // Status kontrolü
      if (selectedAnnouncement.status) {
        updateData.status = selectedAnnouncement.status;
      } else if (selectedAnnouncement.published !== undefined) {
        updateData.status = selectedAnnouncement.published ? "published" : "draft";
      }
      
      // Diğer alanlar
      if (selectedAnnouncement.start_date) {
        updateData.start_date = selectedAnnouncement.start_date;
      }
      
      if (selectedAnnouncement.end_date) {
        updateData.end_date = selectedAnnouncement.end_date;
      }
      
      if (selectedAnnouncement.imageUrl) {
        updateData.imageUrl = selectedAnnouncement.imageUrl;
      } else if (selectedAnnouncement.image) {
        updateData.imageUrl = selectedAnnouncement.image;
      }
      
      if (Array.isArray(selectedAnnouncement.tags)) {
        updateData.tags = selectedAnnouncement.tags;
      }
      
      if (typeof selectedAnnouncement.priority === 'number') {
        updateData.priority = selectedAnnouncement.priority;
      }
      
      if (typeof selectedAnnouncement.pinned === 'boolean') {
        updateData.pinned = selectedAnnouncement.pinned;
      }
      
      if (selectedAnnouncement.visibility) {
        updateData.visibility = selectedAnnouncement.visibility;
      }
      
      console.log("API için hazırlanan veri:", JSON.stringify(updateData, null, 2));
      console.log("API call - updateAnnouncement fonksiyonu çağrılıyor, ID:", selectedAnnouncement.id);
      
      // Doğrudan store'dan updateAnnouncement fonksiyonunu çağır
      const success = await updateAnnouncement(selectedAnnouncement.id, updateData);
      console.log("Duyuru güncelleme sonucu:", success);
      
      if (success) {
        console.log("%c Duyuru güncelleme işlemi başarılı", "background: #e8f5e9; color: #2e7d32; font-weight: bold;");
        toast({
          title: "Başarılı",
          description: "Duyuru başarıyla güncellendi.",
        });
        setViewMode("preview");
        // Güncel listeyi almak için bekle
        setTimeout(() => {
          getAnnouncements();
        }, 500);
      } else {
        console.error("%c Duyuru güncelleme işlemi başarısız", "background: #ffebee; color: #c62828; font-weight: bold;");
        toast({
          title: "Hata",
          description: "Duyuru güncellenemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("%c Duyuru güncellenirken hata oluştu", "background: #ffebee; color: #c62828; font-weight: bold;");
      console.error("Hata detayı:", error);
      toast({
        title: "Hata",
        description: "Duyuru güncellenirken bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"),
        variant: "destructive",
      });
    }
  }

  // Modal kapandığında
  const handleModalOpenChange = (open: boolean) => {
    console.log("handleModalOpenChange çağrıldı - Modal durumu değişiyor:", open);
    setIsModalOpen(open);
    
    // Modal kapandığında modalAnnouncement'ı sıfırla
    if (!open) {
      setModalAnnouncement(null);
    }
  }

  // İşlemler başarılı olduğunda
  const handleSuccess = () => {
    // Duyuru ekleme/düzenleme sonrası listeyi güncelle
    console.log("handleSuccess: Duyuru işlemi başarılı, liste yenileme başlatılıyor...");
    
    // Şu anda yükleme var mı kontrol et
    if (isLoading) {
      console.log("handleSuccess: Şu anda yükleme devam ediyor, yenileme erteleniyor");
      return;
    }
    
    // Modal kapanma olayından sonra listeyi yenile (300ms gecikme)
    setTimeout(() => {
      console.log("handleSuccess: Liste yenileme başlatılıyor (gecikmeli)");
      // Şu anda yükleme var mı yeniden kontrol et 
      if (!isLoading) {
        getAnnouncements();
      } else {
        console.log("handleSuccess: Yenileme zamanında yükleme devam ediyor, isteği atlıyoruz");
      }
    }, 300);
  }

  // Durum badge'i oluştur
  const getStatusBadge = (status: AnnouncementStatus | boolean) => {
    // Boolean değer ise string'e çevir
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

  // Tarih formatla
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ""; // Eğer tarih yoksa boş string döndür
    
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: tr });
      } catch (error) {
      return dateString;
    }
  };

  // Debug için her render'ı logla
  console.log("AnnouncementsPage RENDER edildi", new Date().toISOString(), "isModalOpen:", isModalOpen, "modalAnnouncement:", modalAnnouncement);

  return (
    <div className="container mx-auto py-6">
      <Toaster />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Duyuru Yönetimi</h1>
      </div>

      {/* Yükleme durumu */}
      {isLoading && !dataLoaded ? (
        <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-md border">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <span className="text-muted-foreground">Duyurular yükleniyor...</span>
        </div>
      ) : dataLoaded && (!announcements || announcements.length === 0) ? (
        // Veri yüklendi ancak boş
        <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-md border">
          <div className="text-center">
            <MegaphoneIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz duyuru bulunmuyor</h3>
            <p className="text-muted-foreground mb-4">İlk duyuruyu eklemek için "Yeni Duyuru" butonuna tıklayın.</p>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Duyuru Ekle
            </Button>
          </div>
        </div>
      ) : (
        // Veri yüklenmiş ve duyurular var - İki kolonlu düzen
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Mobilde sekme tabanlı görünüm */}
          <div className="md:hidden w-full">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4 grid grid-cols-2 w-full">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="preview">Önizleme</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <AnnouncementList
                  onEdit={handleEdit}
                  onDelete={() => {}} // Silme işlemi AnnouncementList içinde yapılıyor
                  onView={handleView}
                  onAdd={handleAdd}
                />
              </TabsContent>
              
              <TabsContent value="preview">
                <Card>
                  <CardContent className="pt-6">
                    {selectedAnnouncement ? (
                      <AnnouncementPreview
                        announcement={selectedAnnouncement}
                        viewMode={viewMode}
                        handleChange={handleChange}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        defaultImage={defaultImage}
                        setViewMode={setViewMode}
                        handleEditAnnouncement={handleEditAnnouncement}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">Duyuru Seçilmedi</h3>
                        <p className="text-gray-500 mb-4">Önizleme için sol taraftan bir duyuru seçin</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Masaüstü ve tablet için yan yana görünüm */}
          <div className="hidden md:block md:col-span-7">
            <AnnouncementList
              onEdit={handleEdit}
              onDelete={() => {}} // Silme işlemi AnnouncementList içinde yapılıyor
              onView={handleView}
              onAdd={handleAdd}
            />
          </div>
          
          <div className="hidden md:block md:col-span-5">
            <Card>
              <CardContent className="pt-6">
                {selectedAnnouncement ? (
                  <AnnouncementPreview
                    announcement={selectedAnnouncement}
                    viewMode={viewMode}
                    handleChange={handleChange}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                    defaultImage={defaultImage}
                    setViewMode={setViewMode}
                    handleEditAnnouncement={handleEditAnnouncement}
                  />
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">Duyuru Seçilmedi</h3>
                    <p className="text-gray-500 mb-4">Önizleme için sol taraftan bir duyuru seçin</p>
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tüm modal props'larını güncelledik */}
      <AnnouncementFormModal
        isOpen={isModalOpen}
        onOpenChange={handleModalOpenChange}
        announcement={modalAnnouncement}
        onSuccess={handleSuccess}
      />
    </div>
  )
} 