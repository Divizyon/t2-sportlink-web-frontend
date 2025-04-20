import api, { handleApiError } from './api';
import type { Event, EventFilterParams, PaginatedEventResponse, Participant } from '@/interfaces/event';
import { AxiosError } from 'axios';

/**
 * Etkinlik servisi - etkinliklerle ilgili API operasyonları
 */
class EventService {
  
  /**
   * Etkinlikleri listele
   */
  async listEvents(params?: EventFilterParams): Promise<{
    success: boolean;
    data?: Event[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      // Arama ve filtre parametreleri ekle
      if (params?.search && params.search.length > 2) {
        queryParams.append('search', params.search);
        if (params.searchField) {
          queryParams.append('searchField', params.searchField);
        }
      }
      
      // Sayfalama bilgileri
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      // Kategori filtresi
      if (params?.category && params.category.length > 0) {
        params.category.forEach(cat => {
          queryParams.append('category', cat);
        });
      }
      
      // Durum filtresi
      if (params?.status && params.status.length > 0) {
        params.status.forEach(status => {
          queryParams.append('status', status);
        });
      }
      
      // Onay durumu filtresi
      if (params?.approval_status && params.approval_status.length > 0) {
        params.approval_status.forEach(status => {
          queryParams.append('approval_status', status);
        });
      }
      
      const response = await api.get(`/events?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Etkinlikler listelenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Etkinlik detaylarını getir
   */
  async getEventById(eventId: string): Promise<{
    success: boolean;
    data?: Event;
    message?: string;
  }> {
    try {
      const response = await api.get(`/events/${eventId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Etkinlik detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Etkinlik detaylarını slug ile getir
   */
  async getEventBySlug(slug: string): Promise<{
    success: boolean;
    data?: Event;
    message?: string;
  }> {
    try {
      const response = await api.get(`/events/slug/${slug}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Etkinlik detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Yeni etkinlik oluştur
   */
  async createEvent(eventData: Partial<Event>): Promise<{
    success: boolean;
    data?: Event;
    message?: string;
  }> {
    try {
      const response = await api.post('/events', eventData);
      
      return {
        success: true,
        data: response.data.event,
        message: response.data.message || 'Etkinlik başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Etkinlik güncelle
   */
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<{
    success: boolean;
    data?: Event;
    message?: string;
  }> {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      
      return {
        success: true,
        data: response.data.event,
        message: response.data.message || 'Etkinlik başarıyla güncellendi'
      };
    } catch (error) {
      console.error('Etkinlik güncellenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Etkinlik sil
   */
  async deleteEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.delete(`/events/${eventId}`);
      
      return {
        success: true,
        message: response.data.message || 'Etkinlik başarıyla silindi'
      };
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Etkinliğe katıl
   */
  async joinEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.post(`/events/${eventId}/join`);
      
      return {
        success: true,
        message: response.data.message || 'Etkinliğe başarıyla katıldınız'
      };
    } catch (error) {
      console.error('Etkinliğe katılırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Etkinlikten ayrıl
   */
  async leaveEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.delete(`/events/${eventId}/leave`);
      
      return {
        success: true,
        message: response.data.message || 'Etkinlikten başarıyla ayrıldınız'
      };
    } catch (error) {
      console.error('Etkinlikten ayrılırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Kullanıcının katıldığı etkinlikleri getir
   */
  async getUserEvents(): Promise<{
    success: boolean;
    data?: PaginatedEventResponse;
    message?: string;
  }> {
    try {
      const response = await api.get('/events/my/events');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı etkinlikleri alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Kullanıcının oluşturduğu etkinlikleri getir
   */
  async getUserCreatedEvents(): Promise<{
    success: boolean;
    data?: PaginatedEventResponse;
    message?: string;
  }> {
    try {
      const response = await api.get('/events/my/created');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcının oluşturduğu etkinlikler alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Admin: Onay bekleyen etkinlikleri getir
   */
  async getPendingEvents(): Promise<{
    success: boolean;
    data?: PaginatedEventResponse;
    message?: string;
  }> {
    try {
      const response = await api.get('/events/admin/pending');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Onay bekleyen etkinlikler alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Admin: Etkinliği onayla
   */
  async approveEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.post(`/events/admin/${eventId}/approve`);
      
      return {
        success: true,
        message: response.data.message || 'Etkinlik başarıyla onaylandı'
      };
    } catch (error) {
      console.error('Etkinlik onaylanırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
  
  /**
   * Admin: Etkinliği reddet
   */
  async rejectEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.post(`/events/admin/${eventId}/reject`);
      
      return {
        success: true,
        message: response.data.message || 'Etkinlik başarıyla reddedildi'
      };
    } catch (error) {
      console.error('Etkinlik reddedilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
}

const eventService = new EventService();
export default eventService; 