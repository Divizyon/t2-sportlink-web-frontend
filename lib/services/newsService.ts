import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { News as ApiNews, NewsListParams, NewsListResponse, NewsDetailResponse } from '@/interfaces/news';
import type { News as UINews, NewsStatus } from '@/types/news';

/**
 * Maps API news data to UI news format
 */
const mapApiNewsToUiNews = (apiNews: ApiNews): UINews => {
  return {
    id: parseInt(apiNews.id) || apiNews.id,
    title: apiNews.title,
    content: apiNews.content,
    status: mapNewsStatus(apiNews),
    category: apiNews.sport?.name || 'Genel',
    date: apiNews.published_at || apiNews.created_at,
    author: apiNews.author || 'Anonim',
    views: apiNews.views || 0,
    image: apiNews.image_url || '',
    sourceUrl: apiNews.source || '',
    
    // Yeni alanlar
    source_url: apiNews.source || undefined,
    image_url: apiNews.image_url || undefined,
    sport_id: apiNews.sport_id || undefined,
    published_date: apiNews.published_at ? new Date(apiNews.published_at) : undefined,
    created_at: apiNews.created_at || undefined,
    updated_at: apiNews.updated_at || undefined
  };
};

/**
 * Maps API news status to UI news status
 */
const mapNewsStatus = (apiNews: ApiNews): NewsStatus => {
  // Explicit status check, if provided by the API
  if (apiNews.status) {
    if (apiNews.status === 'draft') return "Taslak";
    if (apiNews.status === 'pending') return "Onay Bekliyor";
    if (apiNews.status === 'active') return "Aktif";
    if (apiNews.status === 'inactive') return "Pasif";
  }
  
  // Fallback logic based on published_at field
  if (!apiNews.published_at) {
    return "Taslak"; // No published date means it's a draft
  }
  
  return "Aktif"; // Default for published news
};

/**
 * Haber servisi - haberlerle ilgili API operasyonları
 */
class NewsService {
  private readonly BASE_PATH = '/news';

  /**
   * Tüm haberleri sayfalayarak listeler
   */
  async listNews(params?: NewsListParams): Promise<{ success: boolean, data: UINews[], pagination: any, message?: string }> {
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
      
      console.log(`Fetching news with URL: ${this.BASE_PATH}?${queryParams.toString()}`);
      const response = await api.get(`${this.BASE_PATH}?${queryParams.toString()}`);
      
      console.log('News API response:', response.data);
      
      // API yanıtını UI formatına dönüştür
      const uiNews = Array.isArray(response.data.data) 
        ? response.data.data.map(mapApiNewsToUiNews)
        : [];
      
      return {
        success: true,
        data: uiNews,
        pagination: response.data.pagination || {
          total: uiNews.length,
          page: 1,
          limit: 10,
          totalPages: 1
        }
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
  async getNewsById(newsId: string): Promise<{ success: boolean, data: UINews, message?: string }> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${newsId}`);
      
      // API yanıtını UI formatına dönüştür
      const uiNews = mapApiNewsToUiNews(response.data);
      
      return {
        success: true,
        data: uiNews
      };
    } catch (error) {
      console.error('Haber detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: {} as UINews,
        message: apiError.message
      };
    }
  }

  /**
   * Spor dalına göre haberleri listeler
   */
  async getNewsBySport(sportId: string, params?: NewsListParams): Promise<{ success: boolean, data: UINews[], pagination: any, message?: string }> {
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
      
      // API yanıtını UI formatına dönüştür
      const uiNews = Array.isArray(response.data.data) 
        ? response.data.data.map(mapApiNewsToUiNews)
        : [];
      
      return {
        success: true,
        data: uiNews,
        pagination: response.data.pagination || {
          total: uiNews.length,
          page: 1,
          limit: params?.limit || 10,
          totalPages: 1
        }
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
  async getFeaturedNews(limit: number = 5): Promise<{ success: boolean, data: UINews[], pagination: any, message?: string }> {
    try {
      const response = await api.get(`${this.BASE_PATH}/featured?limit=${limit}`);
      
      // API yanıtını UI formatına dönüştür
      const uiNews = Array.isArray(response.data.data) 
        ? response.data.data.map(mapApiNewsToUiNews)
        : [];
      
      return {
        success: true,
        data: uiNews,
        pagination: {
          total: uiNews.length,
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

  /**
   * Haber onaylama
   */
  async approveNews(newsId: number): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/${newsId}/approve`);
      return {
        success: true,
        message: 'Haber başarıyla onaylandı'
      };
    } catch (error) {
      console.error('Haber onaylanırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Haber reddetme
   */
  async rejectNews(newsId: number): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/${newsId}/reject`);
      return {
        success: true,
        message: 'Haber başarıyla reddedildi'
      };
    } catch (error) {
      console.error('Haber reddedilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Taslak haberi onaya gönderme
   */
  async submitForApproval(newsId: number): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await api.put(`${this.BASE_PATH}/${newsId}/submit-for-approval`);
      return {
        success: true,
        message: 'Haber başarıyla onaya gönderildi'
      };
    } catch (error) {
      console.error('Haber onaya gönderilirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }

  /**
   * Yeni haber ekleme
   */
  async createNews(newsData: {
    title: string,
    content: string,
    source_url: string,
    image_url: string,
    sport_id: string,
    published_date?: Date
  }): Promise<{ success: boolean, data?: UINews, message?: string }> {
    try {
      const response = await api.post(`${this.BASE_PATH}`, newsData);
      
      if (response.data && response.data.data) {
        // API yanıtını UI formatına dönüştür
        const uiNews = mapApiNewsToUiNews(response.data.data);
        
        return {
          success: true,
          data: uiNews,
          message: 'Haber başarıyla eklendi'
        };
      }
      
      return {
        success: true,
        message: 'Haber başarıyla eklendi'
      };
    } catch (error) {
      console.error('Haber eklenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
}

const newsService = new NewsService();
export default newsService; 