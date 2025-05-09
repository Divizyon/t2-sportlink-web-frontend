'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/lib/store';
import { Switch } from '@/components/ui/switch';
import type { Announcement, AnnouncementStatus, CreateAnnouncementDTO, UpdateAnnouncementDTO, AnnouncementVisibility } from '@/interfaces/announcement';

type AnnouncementFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onSuccess?: () => void;
};

interface FormDataType {
  title: string;
  content: string; 
  summary?: string;
  status: AnnouncementStatus;
  imageUrl?: string;
  publishNow?: boolean;
  tags?: string[] | undefined;
  priority?: number | undefined;
  pinned?: boolean | undefined;
  start_date?: string | null;
  end_date?: string | null;
  visibility?: AnnouncementVisibility;
}

const defaultAnnouncement: FormDataType = {
  title: '',
  content: '',
  summary: '',
  status: 'draft',
  imageUrl: '',
  publishNow: false,
  tags: [],
  priority: 0,
  pinned: false,
  start_date: null,
  end_date: null,
  visibility: 'public',
};

export function AnnouncementFormModal({
  isOpen,
  onOpenChange,
  announcement,
  onSuccess,
}: AnnouncementFormModalProps) {
  const [formData, setFormData] = useState<FormDataType>(defaultAnnouncement);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createAnnouncement, updateAnnouncement, isLoading, error, setCurrentAnnouncement } = useStore();
  const isEditing = !!announcement && !!announcement.id;

  // Form açıldığında mevcut duyuru bilgilerini yükle veya sıfırla
  useEffect(() => {
    if (isOpen) {
      console.log('Modal açıldı, isEditing:', isEditing, 'announcement:', announcement);
      // Eğer düzenleme modundaysa ve geçerli bir duyuru varsa
      if (isEditing && announcement) {
        console.log('Duyuru düzenleme modu, duyuru ID:', announcement.id);
        setFormData({
          title: announcement.title,
          content: announcement.content,
          summary: announcement.summary || '',
          status: announcement.status || 'draft',
          imageUrl: announcement.imageUrl || '',
          publishNow: announcement.status === 'published',
          tags: announcement.tags,
          priority: announcement.priority,
          pinned: announcement.pinned,
          start_date: announcement.start_date || null,
          end_date: announcement.end_date || null,
          visibility: announcement.visibility || 'public',
        });
      } else {
        // Yeni duyuru ekleme modu
        console.log('Yeni duyuru ekleme modu - form sıfırlanıyor');
        // Form verilerini varsayılan değerlere sıfırla
        setFormData({...defaultAnnouncement});
        // Store'daki mevcut duyuruyu da temizle
        setCurrentAnnouncement(null);
      }
    }
  }, [isOpen, announcement, isEditing, setCurrentAnnouncement]);

  // Hata durumunda kullanıcıya bildir
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ANNOUNCEMENT FORM] Form submit edildi");
    
    try {
      setIsSubmitting(true);
      
      // Form doğrulama - boş başlık ve içerik kontrolü
      if (!formData.title.trim()) {
        toast({
          title: "Hata",
          description: "Duyuru başlığı boş olamaz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.content.trim()) {
        toast({
          title: "Hata",
          description: "Duyuru içeriği boş olamaz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("[ANNOUNCEMENT FORM] Form doğrulaması geçildi, gönderiliyor:", formData);
      
      // Belirli propertyler için kesin değerlerden oluşan DTO hazırla
      const baseData = {
        title: formData.title,
        content: formData.content,
        status: formData.publishNow ? 'published' as const : formData.status,
      };
      
      // İsteğe bağlı alanları ekle
      const optionalFields: Partial<CreateAnnouncementDTO | UpdateAnnouncementDTO> = {};
      
      if (formData.summary && formData.summary.trim() !== '') {
        optionalFields.summary = formData.summary;
      }
      
      if (formData.imageUrl && formData.imageUrl.trim() !== '') {
        optionalFields.imageUrl = formData.imageUrl;
      }
      
      if (formData.tags && formData.tags.length > 0) {
        optionalFields.tags = formData.tags;
      }
      
      if (formData.priority !== undefined) {
        optionalFields.priority = formData.priority;
      }
      
      if (formData.pinned !== undefined) {
        optionalFields.pinned = formData.pinned;
      }
      
      if (formData.visibility) {
        optionalFields.visibility = formData.visibility;
      }

      // DTO'ları birleştir
      const requestData = {
        ...baseData,
        ...optionalFields
      };
      
      console.log("[ANNOUNCEMENT FORM] Hazırlanan veri:", requestData);
      
      // Düzenleme modu mu yoksa ekleme modu mu kontrol et
      let success = false;
      
      if (isEditing && announcement && announcement.id) {
        console.log("[ANNOUNCEMENT FORM] Mevcut duyuru güncelleniyor, ID:", announcement.id);
        // Store üzerinden duyuru güncelleme fonksiyonunu çağır
        success = await updateAnnouncement(announcement.id, requestData as UpdateAnnouncementDTO);
      } else {
        console.log("[ANNOUNCEMENT FORM] Yeni duyuru oluşturuluyor");
        // Store üzerinden duyuru oluşturma fonksiyonunu çağır  
        success = await createAnnouncement(requestData as CreateAnnouncementDTO);
      }
      
      console.log("[ANNOUNCEMENT FORM] API yanıtı:", success);
      
      if (success) {
        console.log("[ANNOUNCEMENT FORM] İşlem başarılı");
        toast({
          title: isEditing ? "Duyuru Güncellendi" : "Duyuru Oluşturuldu",
          description: isEditing 
            ? "Duyuru başarıyla güncellendi." 
            : "Yeni duyuru başarıyla oluşturuldu.",
        });
        
        // Form başarıyla tamamlandı, modal'ı kapat
        handleModalClose(false);
        
        // Duyuru listesini güncelle (sadece başarılı olduğunda)
        if (onSuccess) {
          console.log("[ANNOUNCEMENT FORM] Duyuru listesi yenileniyor");
          onSuccess();
        }
      } else {
        console.error("[ANNOUNCEMENT FORM] İşlem başarısız oldu");
        toast({
          title: "Hata",
          description: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[ANNOUNCEMENT FORM] Beklenmeyen bir hata oluştu:", error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Gerçek uygulamada dosyayı sunucuya yükleyip URL'ini alırdık
      // Bu örnek için sadece dosyanın adını kaydediyoruz
      setFormData({
        ...formData,
        imageUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Gerçek uygulamada dosyayı sunucuya yükleyip URL'ini alırdık
      setFormData({
        ...formData,
        imageUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageUrl: ''
    });
  };

  // Modal kapatma işlemini ele al
  const handleModalClose = (open: boolean) => {
    console.log('Modal durumu değişiyor:', open);
    
    // Modalı kapatıyoruz
    if (!open) {
      // Modal kapanırken formda yapılan değişiklikleri temizle
      console.log('Modal kapatılıyor - form sıfırlanıyor');
      setFormData({...defaultAnnouncement});
      // Store'daki mevcut duyuruyu da temizle
      setCurrentAnnouncement(null);
    }
    
    // onOpenChange fonksiyonunu çağır
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Duyuru Düzenle" : "Yeni Duyuru Ekle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Başlık
              </Label>
              <Input
                id="title"
                placeholder="Duyuru başlığı"
                className="col-span-3"
                value={formData.title || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  title: e.target.value,
                })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="summary" className="text-right">
                Özet
              </Label>
              <Input
                id="summary"
                placeholder="Duyuru özeti"
                className="col-span-3"
                value={formData.summary || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  summary: e.target.value,
                })}
              />
            </div>

           

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publishNow" className="text-right">
                Hemen Yayınla
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="publishNow"
                  checked={!!formData.publishNow}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    publishNow: checked,
                  })}
                />
                <span className="ml-2 text-sm text-gray-600">
                  {formData.publishNow ? "Duyuru kaydedildiğinde hemen yayınlanacak" : "Duyuru taslak olarak kaydedilecek"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                İçerik
              </Label>
              <div className="col-span-3 space-y-2">
                <Textarea
                  id="content"
                  placeholder="Duyuru içeriği"
                  className="min-h-[120px]"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: e.target.value,
                  })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Başlangıç Tarihi
              </Label>
              <Input
                id="start_date"
                type="date"
                className="col-span-3"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  start_date: e.target.value,
                })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                Bitiş Tarihi
              </Label>
              <Input
                id="end_date"
                type="date"
                className="col-span-3"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  end_date: e.target.value,
                })}
              />
            </div>
           
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visibility" className="text-right">
                Görünürlük
              </Label>
              <Select
                value={formData.visibility || 'public'}
                onValueChange={(value: AnnouncementVisibility) => setFormData({
                  ...formData,
                  visibility: value,
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Görünürlük seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Herkese Açık</SelectItem>
                  <SelectItem value="members">Sadece Üyeler</SelectItem>
                  <SelectItem value="admin">Yöneticiler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Görsel</Label>
              {formData.imageUrl ? (
                <div className="col-span-3 relative">
                  <img
                    src={formData.imageUrl}
                    alt="Duyuru görseli"
                    className="w-full h-auto max-h-[200px] object-cover rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white rounded-full"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={`col-span-3 border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? "border-primary bg-primary/10" : "border-gray-300"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Dosyayı buraya sürükleyin veya tıklayarak seçin
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleModalClose(false)}
              disabled={isLoading || isSubmitting}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting}
              onClick={() => console.log("Ekle butonu tıklandı")}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                isEditing ? "Kaydet" : "Ekle"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 