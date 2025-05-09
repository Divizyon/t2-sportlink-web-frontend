import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { Sport, SportListResponse, SportDetailResponse } from '@/interfaces/sport';

/**
 * Spor dalları servisi - spor dallarıyla ilgili API operasyonları
 */
class SportService {
  private readonly BASE_PATH = '/sports';

  /**
   * Tüm spor dallarını listeler
   */
  async listSports(): Promise<SportListResponse> {
    try {
      const response = await api.get(this.BASE_PATH);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Spor dalları listelenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        message: apiError.message
      };
    }
  }

  /**
   * Belirli bir spor dalının detaylarını getirir
   */
  async getSportById(sportId: string): Promise<SportDetailResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${sportId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Spor dalı detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: {} as Sport,
        message: apiError.message
      };
    }
  }

  /**
   * Popüler spor dallarını getirir
   */
  async getPopularSports(limit: number = 5): Promise<SportListResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/popular?limit=${limit}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Popüler spor dalları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        message: apiError.message
      };
    }
  }

  /**
   * Kategoriye göre spor dallarını filtreleyerek getirir
   */
  async getSportsByCategory(category: string): Promise<SportListResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/category/${category}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kategoriye göre spor dalları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        message: apiError.message
      };
    }
  }
}

const sportService = new SportService();
export default sportService; 