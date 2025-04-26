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
import type { Announcement, AnnouncementStatus, CreateAnnouncementDTO, UpdateAnnouncementDTO } from '@/interfaces/announcement';

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
}

const defaultAnnouncement: FormDataType = {
  title: '',
  content: '',
  summary: '',
  status: 'draft',
  imageUrl: '',
  publishNow: false,
};

export function AnnouncementFormModal({
  isOpen,
  onOpenChange,
  announcement,
  onSuccess,
}: AnnouncementFormModalProps) {
  const [formData, setFormData] = useState<FormDataType>(defaultAnnouncement);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createAnnouncement, updateAnnouncement, isLoading, error } = useStore();
  const isEditing = !!announcement;

  // İçerik önizlemesi için state
  const [showPreview, setShowPreview] = useState(false);

  // Markdown/HTML içeriği güvenli bir şekilde render etmek için 
  const createMarkup = (content: string) => {
    return { __html: content };
  };

  // İçerik önizlemesini toggle et
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Form verilerini düzenleme modunda doldur
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        summary: announcement.summary || '',
        status: announcement.status,
        imageUrl: announcement.imageUrl || '',
        publishNow: announcement.status === 'published',
        tags: announcement.tags,
        priority: announcement.priority,
        pinned: announcement.pinned,
      });
    } else {
      setFormData(defaultAnnouncement);
    }
  }, [announcement]);

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
    
    try {
      // Form doğrulama - boş başlık ve içerik kontrolü
      if (!formData.title.trim()) {
        toast({
          title: "Hata",
          description: "Duyuru başlığı boş olamaz",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.content.trim()) {
        toast({
          title: "Hata",
          description: "Duyuru içeriği boş olamaz",
          variant: "destructive",
        });
        return;
      }
      
      let success = false;
      
      // Log the data being sent
      console.log("Gönderilecek duyuru verisi:", formData);
      
      if (isEditing && announcement) {
        // Veri nesnesini hazırla
        const requestData = {
          title: formData.title,
          content: formData.content,
          summary: formData.summary || undefined,
          status: formData.publishNow ? 'published' : formData.status,
          imageUrl: formData.imageUrl || undefined,
          tags: formData.tags || undefined,
          priority: formData.priority || undefined,
          pinned: formData.pinned || undefined
        };
        
        // Type-casting ile tip uyumsuzluğunu gider
        success = await updateAnnouncement(announcement.id, requestData as UpdateAnnouncementDTO);
      } else {
        // Veri nesnesini hazırla
        const requestData = {
          title: formData.title,
          content: formData.content,
          summary: formData.summary || undefined,
          status: formData.publishNow ? 'published' : formData.status,
          imageUrl: formData.imageUrl || undefined,
          tags: formData.tags || undefined,
          priority: formData.priority || undefined,
          pinned: formData.pinned || undefined
        };
        
        // Type-casting ile tip uyumsuzluğunu gider
        success = await createAnnouncement(requestData as CreateAnnouncementDTO);
      }
      
      if (success) {
        toast({
          title: "Başarılı",
          description: isEditing ? "Duyuru güncellendi" : "Duyuru oluşturuldu",
        });
        
        // Önce modalı kapat
        onOpenChange(false);
        
        // Sonra, requestAnimationFrame kullanarak DOM güncellendikten sonra onSuccess'i çağır
        // Bu, modal kapanırken state değişimlerinin çakışmasını önler
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 100);
      } else {
        // Başarısız işlem
        console.error("Duyuru işlemi başarısız oldu");
        toast({
          title: "Hata",
          description: isEditing 
            ? "Duyuru güncellenirken bir sorun oluştu" 
            : "Duyuru eklenirken bir sorun oluştu",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Duyuru işlemi sırasında hata:', err);
      toast({
        title: "Beklenmeyen Hata",
        description: "İşlem sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
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
    if (!open) {
      // Modal kapanırken formda yapılan değişiklikleri temizle
      setFormData(defaultAnnouncement);
    }
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
              <Label htmlFor="status" className="text-right">
                Durum
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: AnnouncementStatus) => setFormData({
                  ...formData,
                  status: value,
                })}
              >
                <SelectTrigger className="col-span-3">
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
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={togglePreview}
                  >
                    {showPreview ? "Düzenleme Moduna Dön" : "Önizleme Göster"}
                  </Button>
                </div>
                
                {showPreview && (
                  <div className="border rounded-md p-4 mt-2 max-h-[300px] overflow-y-auto">
                    <h3 className="text-lg font-medium mb-2">Önizleme</h3>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={createMarkup(formData.content || '')}
                    />
                  </div>
                )}
              </div>
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                isEditing ? "Güncelle" : "Ekle"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 