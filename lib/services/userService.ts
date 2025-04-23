import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { User } from '@/interfaces/user';

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
}

const userService = new UserService();
export default userService;
