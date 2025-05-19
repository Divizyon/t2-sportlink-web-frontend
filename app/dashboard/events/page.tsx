"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/lib/hooks/useAuth";
import eventService from "@/lib/services/eventService";
import type { Event } from "@/interfaces/event";
import type { EventFilterParams } from "@/lib/services/eventService";
import EventList from "@/components/events/EventList";
import ApprovalCenter from "@/components/events/ApprovalCenter";
import EventPreview from "@/components/events/EventPreview";
import { EventFormModal } from "@/components/events/EventFormModal";
import { getSafeStatus } from "@/interfaces/event";

export default function EventsPage() {
  const { toast } = useToast();
  // Use the role check again now that we've added default role
  const { isLoading: authLoading, isAuthenticated, hasRequiredRole } = useAuth('admin');

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Add state for pending events
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loadingPendingEvents, setLoadingPendingEvents] = useState(false);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
  }>({
    category: [],
    status: []
  });

  // Event modal için state ekleyelim
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

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

  // Memoize fetchEvents to prevent unnecessary recreations
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);

      const params: EventFilterParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'created_at',
        sortOrder: 'desc' // En yeni etkinlikler önce
      };

      if (searchQuery) {
        params.keyword = searchQuery;
      }

      // Durum filtresini ayarla
      if (selectedFilters.status.length > 0) {
        // Seçili durumları API için hazırla
        params.status = selectedFilters.status;
      } else {
        // Hiçbir durum seçili değilse tüm durumları göster
        params.status = ['all'];
      }
      
      if (selectedFilters.category.length > 0 && selectedFilters.category[0]) {
        params.sportId = selectedFilters.category[0];
      }

      const response = await eventService.listEvents(params);
      
      if (response.success && response.data) {
        const eventsData = response.data.data || [];
        const paginationData = response.data.pagination || {
          total: eventsData.length,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(eventsData.length / pagination.limit)
        };
        
        // Update events state
        setEvents(eventsData);

        // Handle pagination data safely
        setPagination(prev => ({
          ...prev,
          total: paginationData.total || eventsData.length,
          pages: paginationData.totalPages || Math.ceil(eventsData.length / prev.limit),
          page: paginationData.page || prev.page,
          limit: paginationData.limit || prev.limit
        }));
      } else {
        toast({
          title: "Hata",
          description: response.message || "Etkinlikler yüklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Etkinlikler yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, selectedFilters, toast]);

  // Sayfa yüklendiğinde ve filtreler değiştiğinde etkinlikleri yükle
  useEffect(() => {
    // Eğer kimlik doğrulama tamamlandıysa ve gerekli yetkiler varsa, etkinlikleri getir
    if (!authLoading && isAuthenticated && hasRequiredRole) {
      fetchEvents();
    }
  }, [pagination.page, pagination.limit, searchQuery, selectedFilters, authLoading, isAuthenticated, hasRequiredRole, fetchEvents]);

  // Sonuçlar içinden ilk etkinliği seç
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0] || null);
    }
  }, [events, selectedEvent]);

  // Add a function to fetch all pending events
  const fetchPendingEvents = useCallback(async () => {
    try {
      setLoadingPendingEvents(true);

      const params: EventFilterParams = {
        // Don't apply pagination limit for pending events
        limit: 100, // Use a higher limit to get more events
        status: ['pending'],
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const response = await eventService.listEvents(params);
      
      if (response.success && response.data) {
        const eventsData = response.data.data || [];
        // Update pending events state
        setPendingEvents(eventsData);
      } else {
        console.error("Failed to fetch pending events:", response.message);
      }
    } catch (error) {
      console.error("Error fetching pending events:", error);
    } finally {
      setLoadingPendingEvents(false);
    }
  }, []);

  // Fetch pending events when the component mounts or after events are updated
  useEffect(() => {
    if (!authLoading && isAuthenticated && hasRequiredRole) {
      fetchPendingEvents();
    }
  }, [authLoading, isAuthenticated, hasRequiredRole, fetchPendingEvents]);

  // Refresh pending events when a new event is added
  const refreshPendingEvents = () => {
    fetchPendingEvents();
  };

  const handleEditEvent = async () => {
    // Debug için bilgileri logla
    console.log('handleEditEvent çağrıldı');
    console.log('selectedEvent:', selectedEvent);
    
    try {
      // Herzaman selectedEvent kullan, varlığını kontrol et
      if (!selectedEvent) {
        console.error('Güncellenecek etkinlik bulunamadı');
        toast({
          title: "Hata",
          description: "Güncellenecek etkinlik bilgileri bulunamadı",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure the status is one of the expected types
      const typedPayload = {
        ...selectedEvent,
        status: getSafeStatus(selectedEvent.status || 'pending')
      };
      
      console.log('Normalized status for update:', typedPayload.status);

      // Update the UI immediately for a more responsive feel
      setEvents(prevEvents => prevEvents.map(event => 
        event.id === selectedEvent.id ? {...event, ...typedPayload} : event
      ));
      
      // Switch back to preview mode immediately
      setViewMode("preview");

      console.log('API isteği gönderiliyor:', typedPayload);
      const response = await eventService.updateEvent(typedPayload.id, typedPayload);

      if (response.success) {
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla güncellendi",
        });
      } else {
        // If the API call fails, revert the changes
        toast({
          title: "Hata",
          description: response.message || "Etkinlik güncellenirken bir hata oluştu",
          variant: "destructive",
        });
        
        // Refresh events to revert changes
        fetchEvents();
      }
    } catch (error: unknown) {
      console.error("Etkinlik güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Etkinlik güncellenirken bir hata oluştu",
        variant: "destructive",
      });
      
      // Refresh events to revert changes
      fetchEvents();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      // Find the event to delete
      const eventToDelete = events.find(e => e.id === id);
      if (!eventToDelete) return;
      
      // Update UI immediately
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      
      // Update pagination count immediately
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));

      // If the deleted event is selected, clear the selection
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent(null);
      }
      
      // Make API request in the background
      const response = await eventService.deleteEvent(id);

      if (!response.success) {
        // Only show error if something went wrong
        toast({
          title: "Hata",
          description: response.message || "Etkinlik silinirken bir hata oluştu",
          variant: "destructive",
        });
        
        // Refresh events to show correct state
        fetchEvents();
      } else {
        // Show success message
        toast({
          title: "Başarılı",
          description: response.message || "Etkinlik başarıyla silindi",
        });
      }
    } catch (error: unknown) {
      console.error("Etkinlik silme hatası:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Etkinlik silinirken bir hata oluştu",
        variant: "destructive",
      });
      
      // Refresh events to show correct state
      fetchEvents();
    }
  };

  const handleFilterChange = (type: 'category' | 'status', value: string) => {
    if (type === 'status' && value.includes(',')) {
      // Bu, EventFilter'dan gelen çoklu durum değerleri
      const statusValues = value.split(',');
      setSelectedFilters(prev => ({
        ...prev,
        status: statusValues
      }));
      return;
    }

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
    return selectedFilters.category.length + selectedFilters.status.length;
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

  const handleChange = (name: string, value: string | number | string[] | boolean) => {
    if (selectedEvent) {
      if (name === "status") {
        // Make sure status is properly typed
        const statusValue = getSafeStatus(value as string);
        setSelectedEvent({ ...selectedEvent, [name]: statusValue });
      } else {
        setSelectedEvent({ ...selectedEvent, [name]: value });
      }
    }
  };

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
    // Add null check and normalize status before comparing
    if (!status) return <Badge variant="outline">Belirtilmemiş</Badge>;
    
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            Aktif
          </Badge>
        );
      case 'passive':
        return (
          <Badge variant="secondary" className="bg-gray-500 text-white">
            Pasif
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500 text-white">
            Beklemede
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="secondary" className="bg-red-500 text-white">
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

  // Sayfa değişikliği için handler - API çağrılarını azaltmak için basit bir debounce ekleyelim
  const [isPageChangePending, setIsPageChangePending] = useState(false);
  
  const handlePageChange = (page: number) => {
    // Eğer şu anda bir sayfa değişikliği bekliyorsa, işlemi yapma
    if (isPageChangePending) return;
    
    // Sayfa değişikliği yapılıyor işaretini koy
    setIsPageChangePending(true);
    
    // Yeni sayfaya geçerken yükleme gösterecek şekilde state'i güncelle
    setPagination(prev => ({
      ...prev,
      page
    }));
    
    // 500ms sonra işareti kaldır - bu birden fazla hızlı tıklamaları engeller
    setTimeout(() => {
      setIsPageChangePending(false);
    }, 500);
  };

  // Modal açma fonksiyonu ekleyelim
  const openEventModal = () => {
    setIsEventModalOpen(true);
  };

  // Update handleEventAdded to also refresh pending events
  const handleEventAdded = (newEvent?: Event) => {
    if (newEvent) {
      console.log('New event added:', newEvent);
      
      // Ensure the new event has all required fields with proper types
      const completeEvent: Event = {
        ...newEvent,
        // Ensure sport data is available for display (if not already present)
        sport: newEvent.sport || {
          id: newEvent.sport_id,
          name: '' // Will be filled after fetchEvents
        },
        // Ensure status is a valid type with proper case
        status: getSafeStatus(newEvent.status || 'pending'),
        // Ensure we have created_at date for sorting
        created_at: newEvent.created_at || new Date().toISOString()
      };
      
      console.log('Processed event with status:', completeEvent.status);
      
      // Immediately add the new event to the top of the list
      setEvents(prevEvents => {
        // Create a new array with the new event at the beginning
        const updatedEvents = [completeEvent, ...prevEvents];
        
        // If we're at the limit, remove the last item to maintain the page size
        if (updatedEvents.length > pagination.limit) {
          updatedEvents.pop();
        }
        
        return updatedEvents;
      });
      
      // Update pagination count to reflect the addition
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1
      }));
      
      // Automatically select the new event
      setSelectedEvent(completeEvent);
      
      // Refresh the events list in the background to ensure complete data
      fetchEvents();
      
      // Also refresh pending events if the new event is pending
      if (completeEvent.status === 'pending') {
        refreshPendingEvents();
      }
      
      // Show success toast
      toast({
        title: "Başarılı",
        description: "Etkinlik başarıyla eklendi",
      });
    } else {
      // If no event data returned, refresh the list
      fetchEvents();
      refreshPendingEvents();
    }
  };

  // Update handleUpdateStatus to use updateEvent for all status changes
  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'passive' | 'pending' | 'canceled') => {
    try {
      // Güncellenecek etkinliği bul
      const eventToUpdate = events.find(e => e.id === id) || pendingEvents.find(e => e.id === id);
      if (!eventToUpdate) return;
      
      // Normalize the status
      const normalizedStatus = getSafeStatus(newStatus);
      console.log(`Updating event ${id} status to: ${normalizedStatus}`);
      
      // UI'ı hemen güncelle
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === id ? {...event, status: normalizedStatus} : event
        )
      );

      // Seçili etkinlik güncellenenle aynıysa, onu da güncelle
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent({...selectedEvent, status: normalizedStatus});
      }
      
      // Update the pending events list if the status is changed
      if (normalizedStatus !== 'pending') {
        setPendingEvents(prevPendingEvents => 
          prevPendingEvents.filter(event => event.id !== id)
        );
      } else if (normalizedStatus === 'pending') {
        // If changing to pending, make sure it's in the pending list
        refreshPendingEvents();
      }
      
      // Use updateEvent for all status changes
      const response = await eventService.updateEvent(id, {
        status: normalizedStatus
      });

      if (!response.success) {
        // Sadece bir şeyler yanlış giderse hata göster
        toast({
          title: "Hata",
          description: response.message || `Etkinlik durumu güncellenirken bir hata oluştu`,
          variant: "destructive",
        });
        
        // Doğru durumu göstermek için etkinlikleri yenile
        fetchEvents();
        refreshPendingEvents();
      } else {
        // Etkinlik listesini yenile - bu sunucu durumunu almak için önemli
        fetchEvents();
        refreshPendingEvents();
      }
    } catch (error) {
      console.error("Etkinlik durumu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Etkinlik durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
      
      // Doğru durumu göstermek için etkinlikleri yenile
      fetchEvents();
      refreshPendingEvents();
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
          setSelectedEvent={setSelectedEvent}
          handleDeleteEvent={handleDeleteEvent}
          setSearchQuery={setSearchQuery}
          handleFilterChange={handleFilterChange}
          getTotalSelectedFilters={getTotalSelectedFilters}
          handleAddEvent={openEventModal}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          loading={loading}
          totalEvents={pagination.total}
          currentPage={pagination.page}
          pageSize={pagination.limit}
          onPageChange={handlePageChange}
        />

        <ApprovalCenter
          events={pendingEvents}
          setSelectedEvent={setSelectedEvent}
          formatDate={formatDate}
          itemsPerPage={5}
          handleUpdateStatus={handleUpdateStatus}
          loading={loadingPendingEvents}
        />
      </div>

      {/* Sağ taraf (2/5) - Etkinlik Önizleme */}
      <div className="lg:col-span-2 overflow-y-auto">
        <EventPreview
          selectedEvent={selectedEvent}
          viewMode={viewMode}
          handleChange={handleChange}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          setViewMode={setViewMode}
          renderSelectWithFallback={renderSelectWithFallback}
          handleEditEvent={handleEditEvent}
        />
      </div>
      
      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        onSuccess={handleEventAdded}
      />
    </div>
  );
} 