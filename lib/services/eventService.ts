import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';

// API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface Sport {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  role: string;
}

interface Participant {
  user_id: string;
  joined_at: string;
  event_id?: string;
  role?: string;
}

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
  status: 'active' | 'canceled' | 'completed' | 'passive' | 'pending';
  created_at: string;
  updated_at: string;
  sport?: Sport;
  creator?: User;
  participants?: Participant[];
  participantCount?: number;
  category?: string;
  price?: number;
  organizer?: string;
  requirements?: string[];
  prizes?: string[];
  ratings?: Array<{
    user_id: string;
    rating: number;
    comment?: string;
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
      
      // Add sorting parameters if provided
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

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
        // Handle status values consistently - convert backend status to frontend status
        const status = String(event.status).toLowerCase();
        if (status === 'draft' || status === 'pending') {
          return {...event, status: 'pending' as Event['status']};
        } else if (status === 'active') {
          return {...event, status: 'active' as Event['status']};
        } else if (status === 'canceled') {
          return {...event, status: 'canceled' as Event['status']};
        } else if (status === 'passive') {
          return {...event, status: 'passive' as Event['status']};
        } else {
          // Default fallback
          return {...event, status: 'pending' as Event['status']};
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
      console.log('Oluşturulacak etkinlik verileri:', JSON.stringify(eventData, null, 2));
      
      // Status kontrolü - eğer status yoksa veya geçersizse 'active' olarak ayarla
      if (!eventData.status || !['active', 'passive', 'pending', 'canceled'].includes(eventData.status)) {
        console.log('Status geçersiz veya eksik, active olarak ayarlanıyor');
        eventData.status = 'active';
      }
      
      // Kesinlikle string olduğundan emin olalım
      eventData.status = String(eventData.status).toLowerCase() as Event['status'];
      console.log('Son status değeri:', eventData.status);
      
      const response = await api.post('/events', eventData);
      console.log('Oluşturulan etkinlik cevabı:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Etkinlik başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error);
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
            case 'pending':
              dataToSend.status = 'pending'; 
              break;
            case 'active':
              dataToSend.status = 'active';
              break;
            case 'passive':
              dataToSend.status = 'passive'; // Backend passive'i kabul ediyor
              break;
            case 'canceled':
              dataToSend.status = 'canceled';
              break;
            default:
              // Keep original value if no mapping exists
              break;
          }
        }
      
      console.log(`[EventService] updateEvent isteği başlıyor: ${eventId}`);
      const apiEndpoint = `/events/${eventId}`;
      console.log(`[EventService] Request URL: ${apiEndpoint}`);
      console.log(`[EventService] Request payload:`, JSON.stringify(dataToSend, null, 2));
      
      // Clear all cache entries that might contain this event
      Object.keys(this.requestCache).forEach(key => {
        if (key.startsWith('listEvents:') || key.includes('/events/')) {
          delete this.requestCache[key];
        }
      });

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
   * Cancel event
   */
  async cancelEvent(id: string): Promise<ApiResponse<Event>> {
    try {
      const response = await api.put<ApiResponse<Event>>(`/events/${id}/cancel`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error as AxiosError).message
      };
    }
  }
}

// Helper function to safely type a status string to the Event status type
export function getSafeStatus(status: string): 'active' | 'canceled' | 'completed' | 'passive' | 'pending' {
  const safeStatus = status.toLowerCase();
  if (safeStatus === 'active' || safeStatus === 'passive' || safeStatus === 'pending' || 
      safeStatus === 'canceled' || safeStatus === 'completed') {
    return safeStatus as 'active' | 'canceled' | 'completed' | 'passive' | 'pending';
  }
  
  // Map 'draft' to 'pending'
  if (safeStatus === 'draft') {
    return 'pending';
  }
  
  // Default fallback for unexpected values
  return 'pending';
}

// Helper function to map frontend status to backend status
function mapStatusToBackend(status: string): 'active' | 'canceled' | 'completed' | 'passive' | 'pending' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'active';
    case 'passive':
      return 'passive';
    case 'pending':
      return 'pending';
    case 'canceled':
      return 'canceled';
    case 'completed':
      return 'completed';
    default:
      return 'pending';
  }
}

export default new EventService(); 