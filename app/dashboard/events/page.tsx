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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/lib/hooks/useAuth";
import eventService from "@/lib/services/eventService";
import type { Event, Participant, Sport, User } from "@/interfaces/event";

export default function EventsPage() {
  const { toast } = useToast();
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
    location_latitude: 41.0082,
    location_longitude: 28.9784,
    max_participants: 10,
    status: "pending",
    approval_status: "pending",
    sport_id: "",
    creator_id: "",
    category: "",
    price: 0,
    organizer: "",
    image: ""
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"title" | "description">("title");
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
    approval_status: string[];
  }>({
    category: [],
    status: [],
    approval_status: []
  });
  
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Katılımcı istatistikleri için popup state'leri
  const [showAttendedEvents, setShowAttendedEvents] = useState(false);
  const [showSportsList, setShowSportsList] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);

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
      fetchEvents();
    }
  }, [pagination.page, pagination.limit, searchQuery, searchField, selectedFilters, authLoading, isAuthenticated, hasRequiredRole]);

  // Sonuçlar içinden ilk etkinliği seç
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0] || null);
    }
  }, [events, selectedEvent]);

  // Etkinlikleri API'den yükle
  const fetchEvents = async () => {
    // Eğer kullanıcının yetkisi yoksa veya giriş yapmamışsa, hemen çık
    if (!isAuthenticated || !hasRequiredRole) {
      return;
    }
    
    try {
      setLoading(true);
      console.log("Dashboard/events: Etkinlikler yükleniyor...");
      
      const params: {
        page: number;
        limit: number;
        search?: string;
        searchField?: string;
        category?: string[];
        status?: string[];
        approval_status?: string[];
      } = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (searchQuery.length > 2) {
        params.search = searchQuery;
        params.searchField = searchField;
      }
      
      if (selectedFilters.category.length > 0) {
        params.category = selectedFilters.category;
      }
      
      if (selectedFilters.status.length > 0) {
        params.status = selectedFilters.status;
      }
      
      if (selectedFilters.approval_status.length > 0) {
        params.approval_status = selectedFilters.approval_status;
      }
      
      const response = await eventService.listEvents(params);
      
      if (response.success && response.data) {
        console.log("Dashboard/events - Etkinlikler yüklendi:", response.data.length);
        setEvents(response.data);
        if (response.pagination) {
          setPagination({
            total: response.pagination.total || 0,
            page: response.pagination.page || 1,
            limit: response.pagination.limit || 10,
            pages: response.pagination.totalPages || 0
          });
        }
      } else {
        console.error("Dashboard/events - API başarısız yanıt:", response);
        
        toast({
          title: "Hata",
          description: response.message || "Etkinlikler yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Dashboard/events - Etkinlikler yüklenirken hata:", error);
      
      toast({
        title: "Hata",
        description: error.message || "Etkinlikler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Etkinlik detaylarını yükle
  const fetchEventDetails = async (eventId: string) => {
    try {
      setDetailLoading(true);
      const response = await eventService.getEventById(eventId);
      
      console.log("Dashboard/events - Etkinlik detayları API yanıtı:", response);
      
      if (response.success && response.data) {
        setSelectedEvent(response.data);
      } else {
        toast({
          title: "Hata",
          description: "Etkinlik detayları yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Dashboard/events - Etkinlik detayları yükleme hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Etkinlik detayları yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      const response = await eventService.createEvent(newEvent);
      
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
      const response = await eventService.updateEvent(editingEvent.id, editingEvent);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla güncellendi",
        });
        
        // Etkinlik listesini güncelle
        fetchEvents();
        
        // Seçili etkinliği güncelle
        if (selectedEvent && selectedEvent.id === editingEvent.id) {
          await fetchEventDetails(editingEvent.id);
        }
        
        setEditingEvent(null);
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
        
        // Eğer silinen etkinlik seçili ise, ilk etkinliği seç
        if (selectedEvent && selectedEvent.id === id) {
          if (events.length > 1) {
            const remainingEvents = events.filter(event => event.id !== id);
            if (remainingEvents[0]) {
              setSelectedEvent(remainingEvents[0]);
            } else {
              setSelectedEvent(null);
            }
          } else {
            setSelectedEvent(null);
          }
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
        
        // Seçili etkinliği güncelle
        if (selectedEvent && selectedEvent.id === id) {
          await fetchEventDetails(id);
        }
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
        
        // Seçili etkinliği güncelle
        if (selectedEvent && selectedEvent.id === id) {
          await fetchEventDetails(id);
        }
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
      location_latitude: 41.0082,
      location_longitude: 28.9784,
      max_participants: 10,
      status: "pending",
      approval_status: "pending",
      sport_id: "",
      creator_id: "",
      category: "",
      price: 0,
      organizer: "",
      image: ""
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

  // Katılımcılar tablosunu oluşturan yardımcı fonksiyon
  const renderParticipants = (participants: Participant[] | undefined) => {
    if (!participants || participants.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
          Henüz katılımcı bulunmamaktadır.
        </div>
      );
    }

    return (
      <div className="overflow-auto max-h-60 bg-gray-50 rounded-md">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.map((participant) => {
              const user = participant.user;
              if (!user) return null;
              
              return (
                <tr 
                  key={participant.user_id} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    const participantInfo: Participant = {
                      event_id: participant.event_id,
                      user_id: participant.user_id,
                      joined_at: participant.joined_at,
                      role: participant.role,
                      // Opsiyonel alanlar
                      name: `${user.first_name} ${user.last_name}`,
                      email: user.email,
                      phone: user.phone,
                      registration_date: participant.joined_at
                    };
                    
                    setSelectedParticipant(participantInfo);
                  }}
                >
                  <td className="py-2 px-3">{`${user.first_name} ${user.last_name}`}</td>
                  <td className="py-2 px-3 text-blue-600">{user.email}</td>
                  <td className="py-2 px-3">{user.phone || "-"}</td>
                  <td className="py-2 px-3">{formatDate(participant.joined_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
        
        {/* Üst bölüm - Etkinlik Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Etkinlik ara..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                          {['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'Yüzme', 'Diğer'].map((category) => (
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
                          {['Aktif', 'Tamamlandı', 'İptal Edildi'].map((status) => (
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
                      <div className="space-y-4">
                        <h4 className="font-medium">Onay Durumu</h4>
                        <div className="space-y-2">
                          {['Onaylanmış', 'Onay Bekliyor'].map((approval_status) => (
                            <div key={approval_status} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`approval_status-${approval_status}`}
                                checked={selectedFilters.approval_status.includes(approval_status)}
                                onChange={() => handleFilterChange('approval_status', approval_status)}
                                className="h-4 w-4"
                              />
                              <label htmlFor={`approval_status-${approval_status}`}>{approval_status}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Etkinlik Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Etkinlik Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Başlık</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image">Resim</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                        {newEvent.image && (
                          <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                            <Image
                              src={newEvent.image}
                              alt="Etkinlik Önizleme"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-500 mt-1">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Tarih</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Saat</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Konum</Label>
                      <Input
                        id="location"
                        value={newEvent.location_name}
                        onChange={(e) => setNewEvent({ ...newEvent, location_name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={newEvent.category ?? ""}
                        onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="capacity">Kapasite</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={newEvent.max_participants}
                        onChange={(e) => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Ücret (TL)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="organizer">Organizatör</Label>
                      <Input
                        id="organizer"
                        value={newEvent.organizer}
                        onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="status">Durum</Label>
                          <Select
                            value={newEvent.status ?? "pending"}
                            onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Durum seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Onay Bekliyor</SelectItem>
                              <SelectItem value="approved">Onaylanmış</SelectItem>
                              <SelectItem value="rejected">Reddedildi</SelectItem>
                              <SelectItem value="cancelled">İptal Edildi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="approval_status">Onay Durumu</Label>
                          <Select
                            value={newEvent.approval_status ?? "pending"}
                            onValueChange={(value) => setNewEvent({ ...newEvent, approval_status: value as "pending" | "approved" | "rejected" | "cancelled" })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Onay Durumu seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Onay Bekliyor</SelectItem>
                              <SelectItem value="approved">Onaylanmış</SelectItem>
                              <SelectItem value="rejected">Reddedildi</SelectItem>
                              <SelectItem value="cancelled">İptal Edildi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddEvent}>Etkinlik Ekle</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-auto">
              <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onay</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr 
                      key={event.id}
                      className={`
                        hover:bg-green-50 cursor-pointer
                        ${selectedEvent?.id === event.id ? 'bg-green-100' : ''}
                      `}
                      style={{
                        borderLeft: selectedEvent?.id === event.id ? '6px solid #059669' : 'none'
                      }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.event_date)}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {event.sport ? event.sport.name : 'Belirtilmemiş'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {getApprovalBadge(event.approval_status)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Alt bölüm - Admin Onay Alanı */}
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Onay Merkezi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Onay Bekleyen Etkinlikler ({events.filter(e => e.status === "pending").length})</h3>
            </div>
            {events.filter(e => e.status === "pending").length > 0 ? (
              <div className="overflow-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader>
              <TableRow>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizatör</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {events.filter(e => e.status === "pending").map((event) => (
                      <tr 
                        key={event.id}
                        className="hover:bg-orange-50 cursor-pointer"
                        onClick={() => {
                          setSelectedEvent(event);
                          setViewMode("preview");
                        }}
                      >
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                          {event.creator ? `${event.creator.first_name} ${event.creator.last_name}` : 'Bilinmiyor'}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.event_date)}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                          {event.sport ? event.sport.name : 'Belirtilmemiş'}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveEvent(event.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Onayla
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectEvent(event.id);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Reddet
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
                  </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-gray-500">Onay bekleyen etkinlik bulunmamaktadır</div>
                  </div>
            )}
          </CardContent>
        </Card>
                  </div>

      {/* Sağ taraf (2/5) - Etkinlik Önizleme */}
      <div className="lg:col-span-2 overflow-y-auto">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Etkinlik Önizleme</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === "preview" ? "default" : "outline"} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setViewMode("preview")}
              >
                <Eye className="h-4 w-4" />
                  </Button>
              <Button 
                variant={viewMode === "edit" ? "default" : "outline"} 
                size="icon" 
                className="h-8 w-8" 
                disabled={!selectedEvent}
                onClick={() => setViewMode("edit")}
              >
                <Pencil className="h-4 w-4" />
                  </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              viewMode === "preview" ? (
                <div className="space-y-6">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <Image
                      src={selectedEvent.image || defaultImage}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold">{selectedEvent.title}</h3>
                      {getStatusBadge(selectedEvent.status)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedEvent.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedEvent.start_time ? formatDate(selectedEvent.start_time).split(',')[1] : ''} - {selectedEvent.end_time ? formatDate(selectedEvent.end_time).split(',')[1] : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEvent.location_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Kapasite: {selectedEvent.max_participants} kişi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>Spor: {selectedEvent.sport ? selectedEvent.sport.name : 'Belirtilmemiş'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>Organizatör: {selectedEvent.creator ? `${selectedEvent.creator.first_name} ${selectedEvent.creator.last_name}` : 'Belirtilmemiş'}</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Etkinlik Detayları</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedEvent.description}</p>
                    </div>
                    
                    {/* Sadece onaylanmış etkinlikler için katılımcılar bölümünü göster */}
                    {selectedEvent.approval_status === "approved" && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">
                          Katılımcılar ({selectedEvent.participants ? selectedEvent.participants.length : 0} / {selectedEvent.max_participants})
                        </h4>
                        {renderParticipants(selectedEvent.participants)}
                        <div className="mt-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sm"
                          >
                            Katılımcıları Dışa Aktar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-title">Başlık</Label>
                      <Input
                        id="edit-title"
                        value={selectedEvent.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Açıklama</Label>
                      <Textarea
                        id="edit-description"
                        value={selectedEvent.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-image">Resim</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="edit-image"
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(e) => handleImageUpload(e, false)}
                        />
                        {selectedEvent.image && (
                          <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                            <Image
                              src={selectedEvent.image}
                              alt="Etkinlik Resmi"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-500 mt-1">Sadece PNG, JPG ve JPEG formatları desteklenmektedir.</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Tarih</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={selectedEvent.event_date}
                        onChange={(e) => handleChange('event_date', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-time">Saat</Label>
                      <Input
                        id="edit-time"
                        type="time"
                        value={selectedEvent.start_time}
                        onChange={(e) => handleChange('start_time', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Konum</Label>
                      <Input
                        id="edit-location"
                        value={selectedEvent.location_name}
                        onChange={(e) => handleChange('location_name', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Kategori</Label>
                      <Select
                        value={selectedEvent.category || ""}
                        onValueChange={(value) => handleChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-capacity">Kapasite</Label>
                      <Input
                        id="edit-capacity"
                        type="number"
                        value={selectedEvent.max_participants}
                        onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price">Ücret (TL)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={selectedEvent.price}
                        onChange={(e) => handleChange('price', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-organizer">Organizatör</Label>
                      <Input
                        id="edit-organizer"
                        value={selectedEvent.organizer}
                        onChange={(e) => handleChange('organizer', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-status">Durum</Label>
                          <Select
                            value={selectedEvent.status}
                            onValueChange={(value) => handleChange('status', value as "pending" | "approved" | "rejected" | "cancelled")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Durum seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Onay Bekliyor</SelectItem>
                              <SelectItem value="approved">Onaylanmış</SelectItem>
                              <SelectItem value="rejected">Reddedildi</SelectItem>
                              <SelectItem value="cancelled">İptal Edildi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="approval_status">Onay Durumu</Label>
                          <Select
                            value={selectedEvent.approval_status}
                            onValueChange={(value) => handleChange('approval_status', value as "pending" | "approved" | "rejected" | "cancelled")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Onay Durumu seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Onay Bekliyor</SelectItem>
                              <SelectItem value="approved">Onaylanmış</SelectItem>
                              <SelectItem value="rejected">Reddedildi</SelectItem>
                              <SelectItem value="cancelled">İptal Edildi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => {
                        if (selectedEvent) {
                          setEvents(events.map(event => 
                            event.id === selectedEvent.id ? selectedEvent : event
                          ));
                          setViewMode("preview");
                        }
                      }}>Değişiklikleri Kaydet</Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                Önizlemek için bir etkinlik seçin
              </div>
            )}
        </CardContent>
      </Card>
      </div>

      {/* Katılımcı Detay Popup */}
      {selectedParticipant && (
        <Dialog open={!!selectedParticipant} onOpenChange={(open) => !open && setSelectedParticipant(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-6 pt-5 pb-3 bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {selectedParticipant?.name ? (
                        <>
                          {selectedParticipant.name.split(' ').map(n => n[0]).join('')}
                        </>
                      ) : (
                        <>
                          UK
                        </>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl text-gray-800">
                      {selectedParticipant?.name ? (
                        <>
                          {selectedParticipant.name}
                        </>
                      ) : (
                        <>
                          Kullanıcı
                        </>
                      )}
                    </DialogTitle>
                    <CardDescription className="text-sm flex items-center gap-2 mt-1">
                      {selectedParticipant?.name && (
                        <>
                          @{selectedParticipant.name.toLowerCase().replace(/\s+/g, '')}
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 pt-5 pb-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">E-posta</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{selectedParticipant?.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Telefon</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{selectedParticipant?.phone || "Belirtilmemiş"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Etkinlik Bilgileri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {selectedParticipant?.registration_date && formatDate(selectedParticipant.registration_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">Etkinlik</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {selectedEvent?.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Rol Yönetimi</h3>
                  <div className="flex items-center justify-between px-1 mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Kullanıcı Rolü</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value="user"
                        onValueChange={() => {}}
                      >
                        <SelectTrigger id="edit-role" className="w-[120px] h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">Üye</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => {}} className="w-full bg-green-600 hover:bg-green-700 text-sm h-9">
                    Kaydet
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Katılımcı İstatistikleri</h3>
                  <div className="space-y-3">
                    <div 
                      onClick={() => setShowAttendedEvents(true)}
                      className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium">Katıldığı Etkinlikler</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs mr-1">1</Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setShowSportsList(true)}
                      className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Spor Dalları</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex flex-wrap gap-1 justify-end items-center mr-1">
                          <Badge variant="outline" className="text-xs">{selectedEvent?.category || "Genel"}</Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div 
                      onClick={() => setShowReportsList(true)}
                      className="flex items-center justify-between cursor-pointer bg-white hover:bg-gray-100 p-3 rounded border mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Hakkında Raporlar</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs bg-red-500 text-red-600 border-red-200 mr-1">2</Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Katıldığı Etkinlikler Popup */}
      <Dialog open={showAttendedEvents} onOpenChange={setShowAttendedEvents}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Katıldığı Etkinlikler</DialogTitle>
            <DialogDescription>
              Kullanıcının katıldığı tüm etkinliklerin listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{selectedEvent?.title}</h4>
                  <span className="text-xs text-gray-500">{selectedEvent?.event_date && formatDate(selectedEvent.event_date)}</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{selectedEvent?.location_name}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Spor Dalları Popup */}
      <Dialog open={showSportsList} onOpenChange={setShowSportsList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tercih Ettiği Spor Dalları</DialogTitle>
            <DialogDescription>
              Kullanıcının tercih ettiği spor dalları
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Badge className="mr-2">{selectedEvent?.category || "Genel"}</Badge>
                  <span className="text-sm text-gray-700">
                    {selectedEvent?.category === "Futbol" ? "11 kişilik takım sporu" : 
                     selectedEvent?.category === "Basketbol" ? "5 kişilik takım sporu" : 
                     selectedEvent?.category === "Voleybol" ? "6 kişilik takım sporu" : 
                     "Spor dalı hakkında bilgi bulunmuyor"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hakkında Raporlar Popup */}
      <Dialog open={showReportsList} onOpenChange={setShowReportsList}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hakkında Yapılan Raporlar</DialogTitle>
            <DialogDescription>
              Kullanıcı hakkında yapılan raporların listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2 text-red-600 border-red-200 bg-red-50">
                      Uygunsuz Davranış
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">22.06.2024</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Etkinlik sırasında diğer katılımcılara karşı uygunsuz davranışlar sergiledi.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">Rapor Eden: Ahmet Demir</span>
                  </div>
                  <Badge className="text-xs bg-green-500">
                    Çözüldü
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2 text-red-600 border-red-200 bg-red-50">
                      Katılmama
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">15.05.2024</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Kayıt olduğu halde etkinliğe katılmadı ve haber vermedi.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">Rapor Eden: Mehmet Yılmaz</span>
                  </div>
                  <Badge className="text-xs bg-blue-500">
                    İncelemede
                  </Badge>
                </div>
              </div>

              <div className="p-3 border rounded-md hover:bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2 text-red-600 border-red-200 bg-red-50">
                      Sözlü Taciz
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">03.04.2024</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Etkinlik sırasında sözlü tacizde bulunduğu iddia edildi.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">Rapor Eden: Zeynep Kaya</span>
                  </div>
                  <Badge className="text-xs bg-gray-500">
                    İncelenmedi
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 