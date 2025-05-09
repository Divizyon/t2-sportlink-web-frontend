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
  status: 'active' | 'canceled' | 'completed' | 'draft';
  approval_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
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

class EventService {
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
      if (params?.status) params.status.forEach(s => queryParams.append('status', s));
      if (params?.keyword) queryParams.append('keyword', params.keyword);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/events?${queryParams.toString()}`);

      console.log('Raw API response:', response.data);

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
        console.error('Could not find events array in API response:', rawData);
      }

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

      console.log('Standardized response data:', standardizedData);

      return {
        success: true,
        data: standardizedData
      };
    } catch (error) {
      console.error('Error in listEvents:', error);
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
        data: response.data,
        message: 'Etkinlik başarıyla güncellendi'
      };
    } catch (error) {
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