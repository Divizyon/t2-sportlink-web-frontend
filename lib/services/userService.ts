import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { User } from '@/interfaces/user';

export interface UserListResponse {
  success: boolean;
  data?: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

// Telefon verisini işlemek için yardımcı fonksiyon
const formatPhoneNumber = (phone: any): string | null => {
  if (phone === null || phone === undefined) return null;
  if (phone === '') return null;
  
  // Number tipinde gelirse string'e çevir
  const phoneStr = phone.toString().trim();
  return phoneStr === '' ? null : phoneStr;
};

/**
 * Kullanıcı servisi - kullanıcı profili yönetimi işlemleri
 */
class UserService {
  private readonly BASE_PATH = '/users';

  /**
   * Kullanıcı profil bilgilerini getirir
   */
  async getProfile(): Promise<{
    success: boolean;
    data?: User;
    message?: string;
  }> {
    try {
      const response = await api.get(`${this.BASE_PATH}/profile`);

      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data as User
        };
      } else if (response.data) {
        return {
          success: true,
          data: response.data as User
        };
      }

      console.warn('Beklenmeyen API yanıt formatı:', response.data);
      return {
        success: false,
        message: 'Profil verisi beklenmeyen formatta'
      };
    } catch (error) {
      console.error('Profil bilgileri alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcı profil bilgilerini günceller
   */
  async updateProfile(profileData: Partial<User>): Promise<{
    success: boolean;
    data?: User;
    message?: string;
  }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/profile`, profileData);

      return {
        success: true,
        data: response.data.user,
        message: response.data.message || 'Profil başarıyla güncellendi'
      };
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcı şifresini değiştirir
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/change-password`, data);

      return {
        success: true,
        message: response.data.message || 'Şifre başarıyla değiştirildi'
      };
    } catch (error) {
      console.error('Şifre değiştirilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcı profil fotoğrafını günceller
   */
  async updateProfilePicture(imageFile: File): Promise<{
    success: boolean;
    data?: { profile_picture: string };
    message?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('profile_picture', imageFile);

      const response = await api.post(`${this.BASE_PATH}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Profil fotoğrafı başarıyla güncellendi'
      };
    } catch (error) {
      console.error('Profil fotoğrafı güncellenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Tüm kullanıcıları listeler (admin için)
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    searchQuery?: string;
  }): Promise<UserListResponse> {
    try {
      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.role) queryParams.append('role', params.role);

      // Not: Backend'de isActive filtresi destekleniyorsa bu satırı aktif edin
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      if (params?.searchQuery) queryParams.append('q', params.searchQuery);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get(`${this.BASE_PATH}/admin/users${queryString}`);

      // Pagination bilgilerini konsola yazdır (debug için)
      console.log('API Response:', {
        users: response.data.data?.users?.length,
        pagination: response.data.data?.pagination,
      });

      // Telefon verilerini düzenle
      if (response.data.data && response.data.data.users) {
        response.data.data.users = response.data.data.users.map((user: any) => ({
          ...user,
          phone: formatPhoneNumber(user.phone)
        }));
      }

      // Pagination verilerini ayarla
      let total = 0;
      let page = params?.page || 1;
      let limit = params?.limit || 10;
      
      // API yanıtından sayfalama verilerini al
      if (response.data.data) {
        if (response.data.data.pagination) {
          // API'den gelen pagination objesi varsa kullan
          total = response.data.data.pagination.total || 0;
          page = response.data.data.pagination.page || page;
          limit = response.data.data.pagination.limit || limit;
        } else if (response.data.data.total !== undefined) {
          // Doğrudan data içinde total değeri varsa kullan
          total = response.data.data.total;
          page = response.data.data.page || page;
          limit = response.data.data.limit || limit;
        } else {
          // Hiçbir sayfalama verisi yoksa, kullanıcı sayısını kullan
          total = response.data.data.users?.length || 0;
        }
      }
      
      return {
        success: true,
        data: {
          users: response.data.data?.users || [],
          total: total,
          page: page,
          limit: limit
        },
        message: response.data.message
      };
    } catch (error) {
      console.error('Kullanıcılar listelenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Belirli bir kullanıcıyı ID'sine göre getirir
   */
  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/admin/users/${userId}`);

      // Telefon verisini düzenle
      if (response.data.data) {
        response.data.data.phone = formatPhoneNumber(response.data.data.phone);
      }

      // Debug: Kullanıcı telefon verisini incele
      if (response.data.data) {
        console.log("API'den gelen kullanıcı telefon verisi:", {
          id: response.data.data.id,
          phone: response.data.data.phone,
          phoneType: typeof response.data.data.phone
        });
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Kullanıcı detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Yeni kullanıcı oluşturur (admin için)
   */
  async createUser(userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await api.post(`${this.BASE_PATH}/admin/users`, userData);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Kullanıcı başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Kullanıcı oluşturulurken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcı bilgilerini günceller (admin için)
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await api.put(`${this.BASE_PATH}/admin/users/${userId}`, userData);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Kullanıcı başarıyla güncellendi'
      };
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcıyı siler (admin için)
   */
  async deleteUser(userId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await api.delete(`${this.BASE_PATH}/admin/users/${userId}`);

      return {
        success: true,
        message: response.data.message || 'Kullanıcı başarıyla silindi'
      };
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcının rolünü değiştirir (admin için)
   */
  async changeUserRole(userId: string, role: string): Promise<UserResponse> {
    try {
      const response = await api.put(`${this.BASE_PATH}/admin/users/${userId}/role`, { role });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Kullanıcı rolü başarıyla değiştirildi'
      };
    } catch (error) {
      console.error('Kullanıcı rolü değiştirilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcının oluşturduğu etkinlikleri getirir (admin için)
   */
  async getUserCreatedEvents(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const response = await api.get(`${this.BASE_PATH}/admin/users/${userId}/created-events`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Kullanıcının etkinlikleri alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Kullanıcının katıldığı etkinlikleri getirir (admin için)
   */
  async getUserParticipatedEvents(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const response = await api.get(`${this.BASE_PATH}/admin/users/${userId}/participated-events`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Kullanıcının katıldığı etkinlikler alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
}

const userService = new UserService();
export default userService;
