import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { 
  FriendRequest, 
  FriendRequestListParams, 
  FriendListParams,
  FriendRequestResponse,
  FriendListResponse,
  FriendStatusResponse
} from '@/interfaces/friend';

/**
 * Arkadaşlık servisi - arkadaşlık istekleri ve arkadaş yönetimi
 */
class FriendService {
  private readonly BASE_PATH = '/friends';

  /**
   * Arkadaşlık isteği gönderir
   */
  async sendFriendRequest(userId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.post(`${this.BASE_PATH}/request/${userId}`);
      
      return {
        success: true,
        message: response.data.message || 'Arkadaşlık isteği gönderildi'
      };
    } catch (error) {
      console.error('Arkadaşlık isteği gönderilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Arkadaşlık isteğini kabul eder
   */
  async acceptFriendRequest(requestId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/accept/${requestId}`);
      
      return {
        success: true,
        message: response.data.message || 'Arkadaşlık isteği kabul edildi'
      };
    } catch (error) {
      console.error('Arkadaşlık isteği kabul edilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Arkadaşlık isteğini reddeder
   */
  async rejectFriendRequest(requestId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/reject/${requestId}`);
      
      return {
        success: true,
        message: response.data.message || 'Arkadaşlık isteği reddedildi'
      };
    } catch (error) {
      console.error('Arkadaşlık isteği reddedilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Arkadaşlıktan çıkarır
   */
  async removeFriend(userId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.delete(`${this.BASE_PATH}/${userId}`);
      
      return {
        success: true,
        message: response.data.message || 'Arkadaşlıktan çıkarıldı'
      };
    } catch (error) {
      console.error('Arkadaşlıktan çıkarılırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Arkadaşlık isteklerini listeler
   */
  async listFriendRequests(params?: FriendRequestListParams): Promise<FriendRequestResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      // Durum filtresi
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      
      const response = await api.get(`${this.BASE_PATH}/requests?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Arkadaşlık istekleri listelenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        message: apiError.message
      };
    }
  }

  /**
   * Tüm arkadaşları listeler
   */
  async listFriends(params?: FriendListParams): Promise<FriendListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const response = await api.get(`${this.BASE_PATH}?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Arkadaşlar listelenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        message: apiError.message
      };
    }
  }

  /**
   * Arkadaşlık durumunu kontrol eder
   */
  async getFriendshipStatus(userId: string): Promise<FriendStatusResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/status/${userId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Arkadaşlık durumu kontrol edilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: { status: 'none' },
        message: apiError.message
      };
    }
  }
}

const friendService = new FriendService();
export default friendService; 