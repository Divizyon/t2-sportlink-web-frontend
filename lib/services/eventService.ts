import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';

export interface Event {
  id: string;
  creator_id: string;
  sport_id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  status: 'draft' | 'active' | 'passive';
  created_at: string;
  updated_at: string;
  participants?: Array<{
    user_id: string;
    joined_at: string;
    event_id?: string;
    role?: string;
  }>;
  ratings?: Array<{
    user_id: string;
    rating: number;
    review: string;
    created_at: string;
  }>;
  average_rating?: number;
}

export interface EventFilterParams {
  page?: number;
  limit?: number;
  sportId?: string | undefined;
  status?: string[];
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedEventResponse {
  data: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    pages?: number;
  };
}

export interface EventRating {
  rating: number;
  review: string;
}

// Simple request cache for frequently called endpoints
interface CacheEntry {
  timestamp: number;
  data: any;
}

class EventService {
  private requestCache: Record<string, CacheEntry> = {};
  private cacheTTL = 30 * 1000; // 30 seconds TTL
  
  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }
  
  private getCachedData(key: string): any | null {
    const entry = this.requestCache[key];
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.cacheTTL) {
      // Cache expired
      delete this.requestCache[key];
      return null;
    }
    
    return entry.data;
  }
  
  private setCachedData(key: string, data: any): void {
    this.requestCache[key] = {
      timestamp: Date.now(),
      data
    };
  }

  /**
   * List events with optional filters
   */
  async listEvents(params?: EventFilterParams): Promise<{
    success: boolean;
    data?: PaginatedEventResponse;
    message?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      queryParams.append('limit', '10');
      if (params?.sportId) queryParams.append('sportId', params.sportId);
      
      // Status parametresini API'ye gönderme
      if (params?.status && params.status.length > 0) {
        // 'all' parametresi veya özel durumlar
        if (params.status.includes('all')) {
          queryParams.append('status', 'all');
        } else {
          params.status.forEach(s => queryParams.append('status', s));
        }
      } else {
        // Default olarak 'all' gönder
        queryParams.append('status', 'all');
      }
      
      if (params?.keyword) queryParams.append('keyword', params.keyword);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const apiUrl = `/events?${queryParams.toString()}`;
      
      // Check cache first before making request
      const cacheKey = this.getCacheKey('listEvents', queryParams.toString());
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return {
          success: true,
          data: cachedData
        };
      }
      
      const response = await api.get(apiUrl);
      const rawData = response.data;

      let events: Event[] = [];

      if (rawData.data && Array.isArray(rawData.data)) {
        events = rawData.data;
      } else if (rawData.data && rawData.data.data && Array.isArray(rawData.data.data)) {
        events = rawData.data.data;
      } else if (rawData.events && Array.isArray(rawData.events)) {
        events = rawData.events;
      } else if (rawData.data && rawData.data.events && Array.isArray(rawData.data.events)) {
        events = rawData.data.events;
      } else {
        events = [];
      }

      // Standardize status values for UI consistency
      events = events.map(event => {
        // Handle status values consistently - now just ensuring it's one of our 3 allowed values
        const status = String(event.status).toLowerCase();
        if (status === 'inactive' || status === 'draft') {
          return {...event, status: 'draft' as Event['status']};
        } else if (status === 'active') {
          return {...event, status: 'active' as Event['status']};
        } else {
          return {...event, status: 'passive' as Event['status']};
        }
      });

      let pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false
      };

      if (rawData.pagination) {
        pagination = {
          total: rawData.pagination.total || 0,
          page: rawData.pagination.page || 1,
          limit: rawData.pagination.limit || 10,
          totalPages: rawData.pagination.totalPages || rawData.pagination.pages || 1,
          hasMore: rawData.pagination.hasMore || false
        };
      } else if (rawData.data && rawData.data.pagination) {
        pagination = {
          total: rawData.data.pagination.total || 0,
          page: rawData.data.pagination.page || 1,
          limit: rawData.data.pagination.limit || 10,
          totalPages: rawData.data.pagination.totalPages || rawData.data.pagination.pages || 1,
          hasMore: rawData.data.pagination.hasMore || false
        };
      }

      const standardizedData: PaginatedEventResponse = {
        data: events,
        pagination: pagination
      };
      
      // Store in cache
      this.setCachedData(cacheKey, standardizedData);

      return {
        success: true,
        data: standardizedData
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get event details by ID
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
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get event details by slug
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
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Create new event
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
        data: response.data,
        message: 'Etkinlik başarıyla oluşturuldu'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Update event
   * API Endpoint: PUT {{baseUrl}}/api/events/{{eventId}}
   */
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<{
    success: boolean;
    data?: Event;
    message?: string;
  }> {
    try {
      if (!eventId) {
        console.error('Event ID is missing in updateEvent call');
        return {
          success: false,
          message: 'Etkinlik ID bilgisi eksik'
        };
      }

      // Create a copy of the data we will send to the API
      let dataToSend: Record<string, any> = { ...eventData };
      
      // If status is being updated, map it to what the backend expects
      if (eventData.status) {
        // Map frontend status to backend status
        // Backend accepts: 'active' | 'canceled' | 'completed' | 'draft' | 'pending'
        switch (eventData.status) {
          case 'draft':
            dataToSend.status = 'pending'; 
            break;
          case 'active':
            dataToSend.status = 'active';
            break;
          case 'passive':
            dataToSend.status = 'passive'; // Map to 'draft' instead of 'inactive'
            break;
          default:
            // Keep original value if no mapping exists
            break;
        }
      }
      
      console.log(`[EventService] updateEvent isteği başlıyor: ${eventId}`);
      const apiEndpoint = `/events/${eventId}`;
      console.log(`[EventService] Request URL: ${apiEndpoint}`);
      console.log(`[EventService] Request payload:`, dataToSend);

      const response = await api.put(apiEndpoint, dataToSend);
      console.log(`[EventService] Update response received:`, response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Etkinlik başarıyla güncellendi'
      };
    } catch (error: unknown) {
      console.error('[EventService] Update event error:', error);
      // AxiosError detaylarını logle
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Sunucudan cevap geldi ancak 2xx status kodu değil
        console.error('Response error data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
        console.error('Response headers:', axiosError.response.headers);
      } else if (axiosError.request) {
        // İstek yapıldı fakat cevap alınamadı
        console.error('Request made but no response received:', axiosError.request);
      } else {
        // İstek oluşturulurken hata oluştu
        console.error('Error in setting up the request:', axiosError.message);
      }
      
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await api.delete(`/events/${eventId}`);
      return {
        success: true,
        message: 'Etkinlik başarıyla silindi'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Join event
   */
  async joinEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await api.post(`/events/${eventId}/join`);
      return {
        success: true,
        message: 'Etkinliğe başarıyla katıldınız'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Leave event
   */
  async leaveEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await api.delete(`/events/${eventId}/leave`);
      return {
        success: true,
        message: 'Etkinlikten başarıyla ayrıldınız'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Rate event
   */
  async rateEvent(eventId: string, ratingData: EventRating): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await api.post(`/events/${eventId}/rate`, ratingData);
      return {
        success: true,
        message: 'Etkinlik başarıyla değerlendirildi'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get event ratings
   */
  async getEventRatings(eventId: string): Promise<{
    success: boolean;
    data?: {
      averageRating: number;
      ratings: Array<EventRating & { user_id: string }>;
    };
    message?: string;
  }> {
    try {
      const response = await api.get(`/events/${eventId}/ratings`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get user's events
   */
  async getUserEvents(params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data?: PaginatedEventResponse;
    message?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      queryParams.append('limit', '10');

      const response = await api.get(`/events/my-events?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get user's created events
   */
  async getUserCreatedEvents(params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data?: PaginatedEventResponse;
    message?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      queryParams.append('limit', '10');

      const response = await api.get(`/events/created-events?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get nearby events
   */
  async getNearbyEvents(latitude: number, longitude: number, radius: number): Promise<{
    success: boolean;
    data?: Event[];
    message?: string;
  }> {
    try {
      const response = await api.get(`/events/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Get recommended events
   */
  async getRecommendedEvents(): Promise<{
    success: boolean;
    data?: Event[];
    message?: string;
  }> {
    try {
      const response = await api.get('/events/recommended');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Approve event
   */
  async approveEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await api.post(`/events/${eventId}/approve`);
      return {
        success: true,
        message: 'Etkinlik başarıyla onaylandı'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }

  /**
   * Reject event
   */
  async rejectEvent(eventId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await api.post(`/events/${eventId}/reject`);
      return {
        success: true,
        message: 'Etkinlik başarıyla reddedildi'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }
}

export default new EventService(); 