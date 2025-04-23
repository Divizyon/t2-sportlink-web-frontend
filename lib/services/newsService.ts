import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { News, NewsListParams, NewsListResponse, NewsDetailResponse } from '@/interfaces/news';

/**
 * Haber servisi - haberlerle ilgili API operasyonları
 */
class NewsService {
  private readonly BASE_PATH = '/news';

  /**
   * Tüm haberleri sayfalayarak listeler
   */
  async listNews(params?: NewsListParams): Promise<NewsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      // Spor dalı filtresi
      if (params?.sportId) {
        queryParams.append('sportId', params.sportId);
      }
      
      // Arama kelimesi
      if (params?.keyword) {
        queryParams.append('keyword', params.keyword);
      }
      
      // Tarih aralığı
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      const response = await api.get(`${this.BASE_PATH}?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Haberler listelenirken hata:', error);
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
   * Belirli bir haberin detaylarını getirir
   */
  async getNewsById(newsId: string): Promise<NewsDetailResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${newsId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Haber detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: {} as News,
        message: apiError.message
      };
    }
  }

  /**
   * Spor dalına göre haberleri listeler
   */
  async getNewsBySport(sportId: string, params?: NewsListParams): Promise<NewsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const response = await api.get(`${this.BASE_PATH}/sport/${sportId}?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Spor dalına göre haberler alınırken hata:', error);
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
   * Kategoriye göre haberleri listeler
   */
  async getNewsByCategory(categoryId: string, params?: NewsListParams): Promise<NewsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const response = await api.get(`${this.BASE_PATH}/category/${categoryId}?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Kategoriye göre haberler alınırken hata:', error);
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
   * Öne çıkan haberleri getirir
   */
  async getFeaturedNews(limit: number = 5): Promise<NewsListResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/featured?limit=${limit}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: {
          total: response.data.data.length,
          page: 1,
          limit: limit,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Öne çıkan haberler alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: limit,
          totalPages: 0
        },
        message: apiError.message
      };
    }
  }
}

const newsService = new NewsService();
export default newsService; 