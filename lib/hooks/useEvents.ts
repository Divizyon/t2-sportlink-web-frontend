import { useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { Event, EventFilterParams } from '@/interfaces/event';

/**
 * Etkinlik hook'u - Zustand store'dan etkinlik işlemlerini alır
 */
const useEvents = () => {
  const store = useStore();
  
  // Etkinlikleri farklı filtreleme seçenekleriyle getirme fonksiyonu
  const getFilteredEvents = useCallback((params?: EventFilterParams) => {
    store.getEvents(params);
  }, [store]);
  
  // Yaklaşan etkinlikleri getir
  const getUpcomingEvents = useCallback(() => {
    const params: EventFilterParams = {
      status: ['active']
      // API filtrelemede bugünden sonraki etkinlikleri döndürecek şekilde ayarlanmalı
    };
    store.getEvents(params);
  }, [store]);
  
  // Arama sonuçlarını getir
  const searchEvents = useCallback((keyword: string) => {
    const params: EventFilterParams = {
      search: keyword
    };
    store.getEvents(params);
  }, [store]);
  
  // Etkinlik detayı getir
  const getEventDetails = useCallback((eventId: string) => {
    store.getEventById(eventId);
  }, [store]);
  
  // Etkinlik detayı slug ile getir
  const getEventBySlug = useCallback((slug: string) => {
    store.getEventBySlug(slug);
  }, [store]);
  
  // Kullanıcının etkinliklerini getir
  const getUserEvents = useCallback(() => {
    store.getUserEvents();
  }, [store]);
  
  // Kullanıcının oluşturduğu etkinlikleri getir
  const getUserCreatedEvents = useCallback(() => {
    store.getUserCreatedEvents();
  }, [store]);
  
  return {
    // State
    events: store.events,
    userEvents: store.userEvents,
    userCreatedEvents: store.userCreatedEvents,
    currentEvent: store.currentEvent,
    pagination: store.pagination,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    getFilteredEvents,
    getUpcomingEvents,
    searchEvents,
    getEventDetails,
    getEventBySlug,
    getUserEvents,
    getUserCreatedEvents,
    createEvent: store.createEvent,
    updateEvent: store.updateEvent,
    deleteEvent: store.deleteEvent,
    joinEvent: store.joinEvent,
    leaveEvent: store.leaveEvent,
    clearError: store.clearEventError,
    setPage: store.setPage
  };
};

export default useEvents; 