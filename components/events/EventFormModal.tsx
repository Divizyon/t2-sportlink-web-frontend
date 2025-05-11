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
import eventService from '@/lib/services/eventService';
import Image from 'next/image';
import type { Event } from '@/interfaces/event';

type EventFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSuccess?: () => void;
};

interface FormDataType {
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  max_participants: number;
  status: 'active' | 'draft' | 'canceled' | 'completed';
  approval_status: 'pending' | 'approved' | 'rejected';
  sport_id: string;
  image?: string;
  creator_id?: string;
}

const defaultEvent: FormDataType = {
  title: '',
  description: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location_name: '',
  max_participants: 10,
  status: 'draft',
  approval_status: 'pending',
  sport_id: '',
  image: '',
};

export function EventFormModal({
  isOpen,
  onOpenChange,
  event,
  onSuccess,
}: EventFormModalProps) {
  const [formData, setFormData] = useState<FormDataType>(defaultEvent);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = false;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isEditing = !!event && !!event.id;

  // Modal açıldığında mevcut etkinlik bilgilerini yükle veya sıfırla
  useEffect(() => {
    if (isOpen) {
      // Eğer düzenleme modundaysa ve geçerli bir etkinlik varsa
      if (isEditing && event) {
        // Tarih dönüşümlerini güvenli şekilde yapalım
        let formattedEventDate = '';
        let formattedStartTime = '';
        let formattedEndTime = '';
        let sportId = '';
        let creatorId = '';
        
        try {
          // Safely convert to string to avoid type errors
          if (event.event_date) {
            const date = new Date(String(event.event_date));
            if (!isNaN(date.getTime())) {
              formattedEventDate = date.toISOString().split('T')[0];
            }
          }
          
          if (event.start_time) {
            const date = new Date(String(event.start_time));
            if (!isNaN(date.getTime())) {
              formattedStartTime = date.toTimeString().substring(0, 5);
            }
          }
          
          if (event.end_time) {
            const date = new Date(String(event.end_time));
            if (!isNaN(date.getTime())) {
              formattedEndTime = date.toTimeString().substring(0, 5);
            }
          }

          // Convert IDs to strings safely
          sportId = event.sport_id ? String(event.sport_id) : '';
          creatorId = event.creator_id ? String(event.creator_id) : '';
        } catch (error) {
          console.error('Data formatting error:', error);
        }

        setFormData({
          title: event.title || '',
          description: event.description || '',
          event_date: formattedEventDate,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          location_name: event.location_name || '',
          max_participants: event.max_participants || 10,
          status: (event.status as 'active' | 'draft' | 'canceled' | 'completed') || 'draft',
          approval_status: (event.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
          sport_id: sportId,
          image: event.image || '',
          creator_id: creatorId,
        });
      } else {
        // Yeni etkinlik ekleme modu
        setFormData({...defaultEvent});
      }
    }
  }, [isOpen, event, isEditing]);

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Form doğrulama - zorunlu alanların kontrolü
      if (!formData.title.trim()) {
        toast({
          title: "Hata",
          description: "Etkinlik başlığı boş olamaz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.description.trim()) {
        toast({
          title: "Hata",
          description: "Etkinlik açıklaması boş olamaz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.event_date) {
        toast({
          title: "Hata",
          description: "Etkinlik tarihi seçilmeli",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.start_time) {
        toast({
          title: "Hata",
          description: "Başlangıç saati seçilmeli",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.end_time) {
        toast({
          title: "Hata",
          description: "Bitiş saati seçilmeli",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.location_name.trim()) {
        toast({
          title: "Hata",
          description: "Konum bilgisi boş olamaz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.sport_id) {
        toast({
          title: "Hata",
          description: "Lütfen bir spor dalı seçin",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Format dates for proper API submission
      const formattedEvent = {
        ...formData,
        event_date: new Date(formData.event_date).toISOString(),
        start_time: new Date(`${formData.event_date}T${formData.start_time}`).toISOString(),
        end_time: new Date(`${formData.event_date}T${formData.end_time}`).toISOString(),
      };
      
      let response;
      
      if (isEditing && event && event.id) {
        // Etkinlik güncelleme
        response = await eventService.updateEvent(event.id, formattedEvent);
      } else {
        // Yeni etkinlik oluşturma
        response = await eventService.createEvent(formattedEvent);
      }
      
      if (response.success) {
        toast({
          title: isEditing ? "Etkinlik Güncellendi" : "Etkinlik Oluşturuldu",
          description: isEditing 
            ? "Etkinlik başarıyla güncellendi." 
            : "Yeni etkinlik başarıyla oluşturuldu.",
        });
        
        // Form başarıyla tamamlandı, modal'ı kapat
        handleModalClose(false);
        
        // Etkinlik listesini güncelle (sadece başarılı olduğunda)
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Hata",
          description: response.message || "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Gerçek bir uygulamada, bu dosyayı bir API'ye yükleyecektik
      // Bu basitleştirilmiş örnekte sadece bir dosya adını kaydediyoruz
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      // Modal kapanıyor, temizlik işlemleri
      if (!isSubmitting) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Başlık*</Label>
                <Input
                  id="title"
                  placeholder="Etkinlik başlığı"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Açıklama*</Label>
                <Textarea
                  id="description"
                  placeholder="Etkinlik açıklaması"
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="event_date">Etkinlik Tarihi*</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleChange('event_date', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Başlangıç Saati*</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end_time">Bitiş Saati*</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location_name">Konum*</Label>
                <Input
                  id="location_name"
                  placeholder="Etkinlik konumu"
                  value={formData.location_name}
                  onChange={(e) => handleChange('location_name', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max_participants">Maksimum Katılımcı Sayısı</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sport">Spor Dalı*</Label>
                <Select 
                  value={formData.sport_id} 
                  onValueChange={(value) => handleChange('sport_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Spor dalı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Futbol</SelectItem>
                    <SelectItem value="2">Basketbol</SelectItem>
                    <SelectItem value="3">Voleybol</SelectItem>
                    <SelectItem value="4">Tenis</SelectItem>
                    <SelectItem value="5">Yüzme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Durum</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="canceled">İptal Edildi</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Etkinlik Görseli</Label>
                <div
                  className={`border-2 border-dashed rounded-md p-6 text-center ${
                    dragOver ? 'border-primary bg-primary/10' : 'border-input'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {formData.image ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={formData.image}
                        alt="Etkinlik görseli"
                        fill
                        className="object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground mb-2">
                        Görsel yüklemek için sürükleyip bırakın veya tıklayın
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Görsel Seç
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>
              </div>
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