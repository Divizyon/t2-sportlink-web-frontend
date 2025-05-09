"use client";

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Calendar, Users, MapPin, Pencil, Clock, Trophy, Tag, Trash, Eye, Check, Ban, X, Mail, Phone, Shield, Award, ChevronRight, AlertCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/lib/hooks/useAuth";
import eventService from "@/lib/services/eventService";
import type { Event, Participant } from "@/interfaces/event";
import EventList from "@/components/events/EventList";
import ApprovalCenter from "@/components/events/ApprovalCenter";
import EventPreview from "@/components/events/EventPreview";

export default function EventsPage() {
  const { toast } = useToast();
  // Use the role check again now that we've added default role
  const { user, isLoading: authLoading, isAuthenticated, hasRequiredRole } = useAuth('admin');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location_name: "",
    max_participants: 10,
    status: "draft" as 'draft',
    approval_status: "pending" as "pending",
    sport_id: "",
    creator_id: user?.id || ""
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
    approval_status: string[];
  }>({
    category: [],
    status: [],
    approval_status: []
  });
  
  const [detailLoading, setDetailLoading] = useState(false);

  // Kullanıcı doğrulamasını kontrol et
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Kullanıcı giriş yapmamışsa, toast ile bildir
      toast({
        title: "Yetki Hatası",
        description: "Bu sayfayı görüntülemek için giriş yapmanız gerekiyor",
        variant: "destructive",
      });
    } else if (!authLoading && !hasRequiredRole) {
      // Kullanıcı giriş yapmış ama admin değilse, toast ile bildir
      toast({
        title: "Yetki Hatası",
        description: "Bu sayfayı görüntülemek için admin yetkisine sahip olmanız gerekiyor",
        variant: "destructive",
      });
    }
  }, [authLoading, isAuthenticated, hasRequiredRole, toast]);

  // Sayfa yüklendiğinde ve filtreler değiştiğinde etkinlikleri yükle
  useEffect(() => {
    // Eğer kimlik doğrulama tamamlandıysa ve gerekli yetkiler varsa, etkinlikleri getir
    if (!authLoading && isAuthenticated && hasRequiredRole) {
      console.log('Fetching events with params:', {
        page: pagination.page,
        limit: pagination.limit,
        searchQuery,
        selectedFilters
      });
      fetchEvents();
    } else {
      console.log('Not fetching events because:', {
        authLoading,
        isAuthenticated,
        hasRequiredRole
      });
    }
  }, [pagination.page, pagination.limit, searchQuery, selectedFilters, authLoading, isAuthenticated, hasRequiredRole]);

  // Sonuçlar içinden ilk etkinliği seç
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0] || null);
    }
  }, [events, selectedEvent]);

  // Etkinlikleri API'den yükle
  const fetchEvents = async () => {
    try {
      console.log('Starting fetchEvents...');
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        keyword: searchQuery,
        status: selectedFilters.status.length > 0 ? selectedFilters.status : undefined,
        approval_status: selectedFilters.approval_status.length > 0 ? selectedFilters.approval_status : undefined,
        sportId: selectedFilters.category.length > 0 ? selectedFilters.category[0] : undefined
      };
      
      console.log('Calling eventService.listEvents with params:', params);
      const response = await eventService.listEvents(params);
      console.log('EventService response:', response);

      if (response.success && response.data) {
        console.log('Setting events data:', response.data.data);
        
        // Now we can directly use the standardized data from the service
        setEvents(response.data.data as any);
        
        // Handle pagination data safely
        const paginationInfo = response.data.pagination;
        if (paginationInfo) {
          setPagination(prev => ({
            ...prev,
            total: paginationInfo.total || 0,
            pages: paginationInfo.totalPages || 1
          }));
        }
      } else {
        console.error('Error in fetchEvents:', response.message);
        toast({
          title: "Hata",
          description: response.message || "Etkinlikler yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in fetchEvents:", error);
      toast({
        title: "Hata",
        description: "Etkinlikler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      // Check if required fields are filled
      if (!newEvent.title || !newEvent.description || !newEvent.event_date || 
          !newEvent.start_time || !newEvent.end_time || !newEvent.location_name || 
          !newEvent.sport_id) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen tüm zorunlu alanları doldurun",
          variant: "destructive",
        });
        return;
      }

      // Format dates for proper API submission
      const formattedEvent = {
        ...newEvent,
        event_date: new Date(newEvent.event_date).toISOString(),
        start_time: new Date(`${newEvent.event_date}T${newEvent.start_time}`).toISOString(),
        end_time: new Date(`${newEvent.event_date}T${newEvent.end_time}`).toISOString(),
        status: newEvent.status as 'active' | 'canceled' | 'completed' | 'draft'
      };
      
      const response = await eventService.createEvent(formattedEvent);
      
      if (response.success && response.data) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla oluşturuldu",
        });
        
        // Etkinlik listesini güncelle
        fetchEvents();
        resetEvent();
      } else {
        toast({
          title: "Hata",
          description: response.message || "Etkinlik oluşturulurken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Etkinlik oluşturma hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Etkinlik oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;
    
    try {
      // Use selectedEvent for update payload if editingEvent is not the source of truth for the form
      const updatePayload = viewMode === 'edit' && selectedEvent ? selectedEvent : editingEvent;
      
      // Ensure the status is one of the expected types
      const typedPayload = {
        ...updatePayload,
        status: updatePayload.status as 'active' | 'canceled' | 'completed' | 'draft',
        approval_status: updatePayload.approval_status as 'pending' | 'approved' | 'rejected'
      };
      
      const response = await eventService.updateEvent(typedPayload.id, typedPayload);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla güncellendi",
        });
        
        // Etkinlik listesini güncelle
        fetchEvents();
        
        // Seçili etkinliği güncelle (no longer need fetchEventDetails if list update is sufficient)
        // if (selectedEvent && selectedEvent.id === updatePayload.id) {
          // The list update should handle this implicitly
        // }
        
        setEditingEvent(null); // Reset editing state if used
        setViewMode("preview"); // Switch back to preview after successful edit
      } else {
        toast({
          title: "Hata",
          description: response.message || "Etkinlik güncellenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Etkinlik güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Etkinlik güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await eventService.deleteEvent(id);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla silindi",
        });
        
        // Etkinlik listesini güncelle
        fetchEvents();
        
        // Eğer silinen etkinlik seçili ise, seçimi kaldır veya ilkini seç
        if (selectedEvent && selectedEvent.id === id) {
           setSelectedEvent(null); // Clear selection after delete
        }
      } else {
        toast({
          title: "Hata",
          description: response.message || "Etkinlik silinirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Etkinlik silme hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Etkinlik silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleApproveEvent = async (id: string) => {
    try {
      const response = await eventService.approveEvent(id);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla onaylandı",
        });
        
        // Etkinlik listesini güncelle
        fetchEvents();
        
        // Seçili etkinliği güncelle (list update should handle this)
        // if (selectedEvent && selectedEvent.id === id) {
          // Fetch updated list instead of single detail
        // }
      } else {
        toast({
          title: "Hata",
          description: response.message || "Etkinlik onaylanırken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Etkinlik onaylama hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Etkinlik onaylanırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleRejectEvent = async (id: string) => {
    try {
      const response = await eventService.rejectEvent(id);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla reddedildi",
        });
        
        // Etkinlik listesini güncelle
        fetchEvents();
        
        // Seçili etkinliği güncelle (list update should handle this)
        // if (selectedEvent && selectedEvent.id === id) {
          // Fetch updated list instead of single detail
        // }
      } else {
        toast({
          title: "Hata",
          description: response.message || "Etkinlik reddedilirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Etkinlik reddetme hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Etkinlik reddedilirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (type: 'category' | 'status' | 'approval_status', value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      
      // Eğer "all" seçildiyse, tüm filtreleri temizle
      if (value === 'all') {
        return {
          ...prev,
          [type]: []
        };
      }
      
      // Eğer zaten seçiliyse, kaldır
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [type]: currentFilters.filter(item => item !== value)
        };
      } 
      // Değilse ekle
      else {
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      }
    });
  };

  const getTotalSelectedFilters = () => {
    return selectedFilters.category.length + selectedFilters.status.length + selectedFilters.approval_status.length;
  };

  const resetEvent = () => {
    setNewEvent({
      title: "",
      description: "",
      event_date: "",
      start_time: "",
      end_time: "",
      location_name: "",
      max_participants: 10,
      status: "draft" as 'draft',
      approval_status: "pending" as "pending",
      sport_id: "",
      creator_id: user?.id || ""
    });
  };

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Tarih geçerli mi kontrol et
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      // Sabit bir formatta tarih döndür (hydration hatalarını önlemek için)
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      console.error("Tarih formatı hatası:", error);
      return '-';
    }
  };

  // Dosya yükleme için yardımcı fonksiyon
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, isNewEvent: boolean) => {
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
      
      console.log("Dosya yüklendi, ancak işleme alınmadı. Backend API bu özelliği desteklemiyor.");
      toast({
        title: "Bilgi",
        description: "Dosya yükleme şu anda desteklenmiyor.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (name: string, value: string | number | string[] | boolean) => {
    if (selectedEvent) {
      if (name === "status") {
        const statusValue = value as string;
        setSelectedEvent({ ...selectedEvent, [name]: statusValue });
      } else if (name === "approval_status") {
        const approvalStatusValue = value as "pending" | "approved" | "rejected" | "cancelled";
        setSelectedEvent({ ...selectedEvent, [name]: approvalStatusValue });
      } else {
        setSelectedEvent({ ...selectedEvent, [name]: value });
      }
    }
  };

  // İmage komponenti için varsayılan resim
  const defaultImage = "/images/event-placeholder.jpg";

  // Select komponentleri için
  const renderSelectWithFallback = (value: string | undefined, onChange: (value: string) => void, placeholder: string, options: { value: string, label: string }[]) => {
    return (
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // Durum etiketleri için yardımcı fonksiyon
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            Aktif
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-500">
            Pasif
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
            Beklemede
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Onay durumu için yardımcı fonksiyon
  const getApprovalBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
            Onaylanmış
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
            Reddedilmiş
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
            Onay Bekliyor
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-600 bg-gray-50">
            İptal Edildi
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-4rem)]">
      {/* Sol taraf (3/5) - İki parçaya bölünmüş */}
      <div className="lg:col-span-3 grid grid-cols-1 gap-6 overflow-y-auto">
        <EventList
          events={events}
          selectedEvent={selectedEvent}
          searchQuery={searchQuery}
          selectedFilters={selectedFilters}
          newEvent={newEvent}
          setSelectedEvent={setSelectedEvent}
          handleDeleteEvent={handleDeleteEvent}
          setSearchQuery={setSearchQuery}
          handleFilterChange={handleFilterChange}
          getTotalSelectedFilters={getTotalSelectedFilters}
          setNewEvent={setNewEvent}
          handleAddEvent={handleAddEvent}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getApprovalBadge={getApprovalBadge}
          loading={loading}
        />

        <ApprovalCenter
          events={events}
          setSelectedEvent={setSelectedEvent}
          handleApproveEvent={handleApproveEvent}
          handleRejectEvent={handleRejectEvent}
          formatDate={formatDate}
        />
      </div>

      {/* Sağ taraf (2/5) - Etkinlik Önizleme */}
      <div className="lg:col-span-2 overflow-y-auto">
        <EventPreview
          selectedEvent={selectedEvent}
          viewMode={viewMode}
          handleChange={handleChange}
          handleImageUpload={handleImageUpload}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          defaultImage={defaultImage}
          setSelectedEvent={setSelectedEvent}
          setViewMode={setViewMode}
          renderSelectWithFallback={renderSelectWithFallback}
          handleEditEvent={handleEditEvent}
        />
      </div>
    </div>
  );
} 