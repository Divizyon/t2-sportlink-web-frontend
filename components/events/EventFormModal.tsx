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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import eventService from '@/lib/services/eventService';
import type { Event } from '@/interfaces/event';
import type { Sport } from '@/interfaces/sport';
import { getSafeStatus } from '@/interfaces/event';

// Helper text for users to understand the coordinates
const LOCATION_HELP_TEXT = "İpucu: Google Maps'te bir konuma sağ tıkladığınızda koordinatları kopyalayabilirsiniz.";

// Sabit spor dalları listesi - property'leri SportInterface'den alarak
const PREDEFINED_SPORTS = [
  { id: "909a0f7f-54f7-4a47-b47f-5d074b88bcc6", name: "Futbol" },
  { id: "5dc3ebe8-3111-47e3-86d4-648cc1c1df98", name: "Basketbol" },
  { id: "bc691491-2143-4781-800d-a63b8e28ac0b", name: "Tenis" },
  { id: "c82d3ffe-340e-494e-92ee-4e43ab376d8c", name: "Voleybol" },
  { id: "36d22b6d-e407-40be-a023-b0e45669d1a3", name: "Yüzme" }
] as Sport[];

type EventFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSuccess?: (event?: Event) => void;
};

interface FormDataType {
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  sport_id: string;
  status: 'active' | 'passive' | 'pending' | 'canceled';
  category?: string;
  price?: number;
  organizer?: string;
  requirements?: string[];
  prizes?: string[];
}

// Default formData values
const defaultEvent: FormDataType = {
  title: '',
  description: '',
  event_date: new Date().toLocaleDateString('en-CA'), // Returns YYYY-MM-DD format
  start_time: '12:00', // Default start time
  end_time: '14:00', // Default end time
  location_name: '',
  location_latitude: 0,
  location_longitude: 0,
  max_participants: 10,
  status: 'active',
  sport_id: '',
  category: '',
  price: undefined,
  organizer: '',
  requirements: [],
  prizes: [],
}

export function EventFormModal({
  isOpen,
  onOpenChange,
  event,
  onSuccess,
}: EventFormModalProps) {
  const [formData, setFormData] = useState<FormDataType>(defaultEvent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const isLoading = false;
  const { toast } = useToast();
  const isEditing = !!event && !!event.id;

  // Mevcut sportService.listSports çağrısı yerine sabit listeyi kullanacak şekilde güncellendi
  useEffect(() => {
    const fetchSports = () => {
      setLoadingSports(true);
      try {
        // API çağrısı yerine önceden tanımlanmış spor dallarını kullan
        setSports(PREDEFINED_SPORTS);
        console.log('Sports loaded:', PREDEFINED_SPORTS);
      } catch (error) {
        console.error('Error setting sports:', error);
        toast({
          title: "Hata", 
          description: "Spor dalları yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      } finally {
        setLoadingSports(false);
      }
    };
    
    if (isOpen) {
      fetchSports();
    }
  }, [isOpen, toast]);

  // Modal açıldığında mevcut etkinlik bilgilerini yükle veya sıfırla
  useEffect(() => {
    if (isOpen) {
      // Eğer düzenleme modundaysa ve geçerli bir etkinlik varsa
      if (isEditing && event) {
        // Formun varsayılan değerlerini hazırlama
        const data: FormDataType = {...defaultEvent};
        
        try {
          // event_date
          if (event.event_date) {
            const eventDate = new Date(event.event_date);
            if (!isNaN(eventDate.getTime())) {
              data.event_date = eventDate.toLocaleDateString('en-CA');
            }
          }
          // Type-safety için non-null assertion
          data.event_date = data.event_date || new Date().toLocaleDateString('en-CA');

          // start_time
          if (event.start_time) {
            const startTime = new Date(event.start_time);
            if (!isNaN(startTime.getTime())) {
              data.start_time = startTime.toTimeString().substring(0, 5);
            }
          }

          // end_time
          if (event.end_time) {
            const endTime = new Date(event.end_time);
            if (!isNaN(endTime.getTime())) {
              data.end_time = endTime.toTimeString().substring(0, 5);
            }
          }

          // Temel alanlar
          data.title = event.title ?? '';
          data.description = event.description ?? '';
          data.location_name = event.location_name ?? '';
          data.location_latitude = event.location_latitude ?? 0;
          data.location_longitude = event.location_longitude ?? 0;
          data.max_participants = event.max_participants ?? 10;
          
          // Use getSafeStatus to handle status mapping properly
          const oldStatus = event.status || 'pending';
          data.status = getSafeStatus(oldStatus);
          
          // sport_id
          if (event.sport_id) {
            data.sport_id = event.sport_id;
          } else if (event.sport && event.sport.id) {
            data.sport_id = event.sport.id;
          } else {
            data.sport_id = '';
          }

          // category
          if (event.category) {
            data.category = event.category;
          }

          // price
          if (event.price) {
            data.price = event.price;
          }

          // organizer
          if (event.organizer) {
            data.organizer = event.organizer;
          }

          // requirements
          if (event.requirements) {
            data.requirements = event.requirements;
          }

          // prizes
          if (event.prizes) {
            data.prizes = event.prizes;
          }
        } catch (error) {
          console.error('Date formatting error:', error);
        }

        setFormData(data);
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
      
      // Validate status field
      if (!formData.status || !['active', 'passive', 'pending', 'canceled'].includes(formData.status)) {
        toast({
          title: "Hata",
          description: "Geçerli bir durum (status) seçiniz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Prevent creating events with 'canceled' status
      if (!isEditing && formData.status === 'canceled') {
        toast({
          title: "Hata",
          description: "Yeni etkinlik 'İptal Edildi' durumu ile oluşturulamaz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate coordinates
      if (isNaN(formData.location_latitude) || formData.location_latitude === 0) {
        toast({
          title: "Hata",
          description: "Geçerli bir enlem (latitude) koordinatı giriniz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (isNaN(formData.location_longitude) || formData.location_longitude === 0) {
        toast({
          title: "Hata",
          description: "Geçerli bir boylam (longitude) koordinatı giriniz",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate that end time is after start time
      const startDateTime = new Date(`${formData.event_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.event_date}T${formData.end_time}`);
      if (endDateTime <= startDateTime) {
        toast({
          title: "Hata",
          description: "Bitiş saati başlangıç saatinden sonra olmalıdır",
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
        // Ensure status is a valid value using getSafeStatus function
        status: getSafeStatus(formData.status || 'active'),
      };
      
      console.log("Oluşturulacak/güncellenecek etkinlik:", JSON.stringify(formattedEvent, null, 2));
      console.log("Status değeri:", formattedEvent.status);
      
      let response;
      
      if (isEditing && event && event.id) {
        // Etkinlik güncelleme
        // PUT işlemi {{baseUrl}}/api/events/{{eventId}} endpoint'ine yapılacak
        console.log(`Etkinlik güncelleniyor: /api/events/${event.id}`);
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
            : "Yeni etkinlik başarıyla oluşturuldu. Listeye eklenmesi birkaç saniye sürebilir.",
        });
        
        // Form başarıyla tamamlandı, modal'ı kapat
        handleModalClose(false);
        
        // Etkinlik listesini güncelle (sadece başarılı olduğunda)
        if (onSuccess && response.data) {
          // Pass the response data directly to ensure complete event data is available
          onSuccess(response.data);
        } else if (onSuccess) {
          // If no data, just call the callback without parameters
          onSuccess();
        }
      } else {
        toast({
          title: "Hata",
          description: response.message || "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-sm text-gray-500">* işaretli alanlar zorunludur</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location_latitude">Enlem*</Label>
                  <Input
                    id="location_latitude"
                    type="number"
                    step="0.000001"
                    placeholder="Örn: 41.015137"
                    value={String(formData.location_latitude)}
                    onChange={(e) => handleChange('location_latitude', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location_longitude">Boylam*</Label>
                  <Input
                    id="location_longitude"
                    type="number"
                    step="0.000001"
                    placeholder="Örn: 28.979530"
                    value={String(formData.location_longitude)}
                    onChange={(e) => handleChange('location_longitude', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 italic mt-1 mb-3">{LOCATION_HELP_TEXT}</p>

              <div className="grid gap-2">
                <Label htmlFor="max_participants">Maksimum Katılımcı Sayısı</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={String(formData.max_participants)}
                  onChange={(e) => handleChange('max_participants', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sport">Spor Dalı*</Label>
                <Select 
                  value={formData.sport_id} 
                  onValueChange={(value) => handleChange('sport_id', value)}
                  disabled={loadingSports}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSports ? "Spor dalları yükleniyor..." : "Spor dalı seçin"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.length > 0 ? (
                      sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))
                    ) : (
                      loadingSports ? (
                        <div className="flex items-center justify-center py-2 px-2 text-sm text-center text-gray-500">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Spor dalları yükleniyor...
                        </div>
                      ) : (
                        <div className="py-2 px-2 text-sm text-center text-gray-500">
                          Spor dalı bulunamadı
                        </div>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Durum*</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value as 'active' | 'passive' | 'pending' | 'canceled')}
                  defaultValue="pending"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="passive">Pasif</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    {isEditing && <SelectItem value="canceled">İptal Edildi</SelectItem>}
                  </SelectContent>
                </Select>
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