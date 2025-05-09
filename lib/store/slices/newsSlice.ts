import type { StateCreator } from 'zustand';
import newsService from '@/lib/services/newsService';
import type { NewsListParams } from '@/interfaces/news';
import type { News, NewsStatus } from '@/types/news';
import type { StoreState } from '@/lib/store';

export interface NewsState {
  news: News[];
  featuredNews: News[];
  loading: boolean;
  error: string | null;
  selectedNews: News | null;
  getAllNews: (params?: NewsListParams) => Promise<{ success: boolean, data: News[], pagination: any, message?: string }>;
  getNewsById: (id: string) => Promise<News | null>;
  getNewsByCategory: (categoryId: string, params?: NewsListParams) => Promise<{ success: boolean, data: News[], pagination: any, message?: string }>;
  getFeaturedNews: (limit?: number) => Promise<{ success: boolean, data: News[], pagination: any, message?: string }>;
  approveNews: (newsId: number | string) => Promise<{ success: boolean, message?: string }>;
  rejectNews: (newsId: number | string) => Promise<{ success: boolean, message?: string }>;
  submitForApproval: (newsId: number | string) => Promise<{ success: boolean, message?: string }>;
  setSelectedNews: (news: News | null) => void;
  updateNewsStatus: (newsId: number | string, status: NewsStatus) => void;
  createNews: (newsData: {
    title: string,
    content: string,
    source_url: string,
    image_url: string,
    sport_id: string,
    published_date?: Date
  }) => Promise<{ success: boolean, data?: News, message?: string }>;
}

export const createNewsSlice: StateCreator<StoreState, [], [], NewsState> = (set, get) => ({
  news: [],
  featuredNews: [],
  loading: false,
  error: null,
  selectedNews: null,

  getAllNews: async (params) => {
    set({ loading: true, error: null });
    console.log("getAllNews called with params:", params);
    
    try {
      const response = await newsService.listNews(params);
      console.log("getAllNews response:", response);
      
      if (response.success) {
        console.log("Setting news state with:", response.data.length, "items");
        set({ news: response.data, loading: false });
      } else {
        console.error("Error in getAllNews:", response.message);
        set({ error: response.message || 'Haberler yüklenirken bir hata oluştu.', loading: false });
      }
      return response;
    } catch (error) {
      console.error('Haberler yüklenirken bir hata oluştu:', error);
      set({ error: 'Haberler yüklenirken bir hata oluştu.', loading: false });
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        message: 'Haberler yüklenirken bir hata oluştu.'
      };
    }
  },

  getNewsById: async (id) => {
    set({ loading: true, error: null });
    console.log("getNewsById called with id:", id);
    
    try {
      const response = await newsService.getNewsById(id);
      console.log("getNewsById response:", response);
      
      if (response.success) {
        set({ selectedNews: response.data, loading: false });
        return response.data;
      } else {
        console.error("Error in getNewsById:", response.message);
        set({ error: response.message || 'Haber detayı yüklenirken bir hata oluştu.', loading: false });
        return null;
      }
    } catch (error) {
      console.error('Haber detayı yüklenirken bir hata oluştu:', error);
      set({ error: 'Haber detayı yüklenirken bir hata oluştu.', loading: false });
      return null;
    }
  },

  getNewsByCategory: async (categoryId, params) => {
    set({ loading: true, error: null });
    console.log("getNewsByCategory called with categoryId:", categoryId, "params:", params);
    
    try {
      const response = await newsService.getNewsBySport(categoryId, params);
      console.log("getNewsByCategory response:", response);
      
      if (response.success) {
        set({ news: response.data, loading: false });
      } else {
        console.error("Error in getNewsByCategory:", response.message);
        set({ error: response.message || 'Kategoriye göre haberler yüklenirken bir hata oluştu.', loading: false });
      }
      return response;
    } catch (error) {
      console.error('Kategoriye göre haberler yüklenirken bir hata oluştu:', error);
      set({ error: 'Kategoriye göre haberler yüklenirken bir hata oluştu.', loading: false });
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        message: 'Kategoriye göre haberler yüklenirken bir hata oluştu.'
      };
    }
  },

  getFeaturedNews: async (limit) => {
    set({ loading: true, error: null });
    console.log("getFeaturedNews called with limit:", limit);
    
    try {
      const response = await newsService.getFeaturedNews(limit);
      console.log("getFeaturedNews response:", response);
      
      if (response.success) {
        set({ featuredNews: response.data, loading: false });
      } else {
        console.error("Error in getFeaturedNews:", response.message);
        set({ error: response.message || 'Öne çıkan haberler yüklenirken bir hata oluştu.', loading: false });
      }
      return response;
    } catch (error) {
      console.error('Öne çıkan haberler yüklenirken bir hata oluştu:', error);
      set({ error: 'Öne çıkan haberler yüklenirken bir hata oluştu.', loading: false });
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        message: 'Öne çıkan haberler yüklenirken bir hata oluştu.'
      };
    }
  },

  approveNews: async (newsId) => {
    set({ loading: true, error: null });
    console.log("approveNews called with newsId:", newsId);
    
    try {
      // Sayısal ID'ye dönüştür
      const numericId = typeof newsId === 'string' ? parseInt(newsId) : newsId;
      const response = await newsService.approveNews(numericId);
      console.log("approveNews response:", response);
      
      if (response.success) {
        // Haber durumunu state'de güncelle
        get().updateNewsStatus(newsId, "Aktif");
        set({ loading: false });
      } else {
        console.error("Error in approveNews:", response.message);
        set({ error: response.message || 'Haber onaylanırken bir hata oluştu.', loading: false });
      }
      return response;
    } catch (error) {
      console.error('Haber onaylanırken bir hata oluştu:', error);
      set({ error: 'Haber onaylanırken bir hata oluştu.', loading: false });
      return {
        success: false,
        message: 'Haber onaylanırken bir hata oluştu.'
      };
    }
  },

  rejectNews: async (newsId) => {
    set({ loading: true, error: null });
    console.log("rejectNews called with newsId:", newsId);
    
    try {
      // Sayısal ID'ye dönüştür
      const numericId = typeof newsId === 'string' ? parseInt(newsId) : newsId;
      const response = await newsService.rejectNews(numericId);
      console.log("rejectNews response:", response);
      
      if (response.success) {
        // Haber durumunu state'de güncelle
        get().updateNewsStatus(newsId, "Pasif");
        set({ loading: false });
      } else {
        console.error("Error in rejectNews:", response.message);
        set({ error: response.message || 'Haber reddedilirken bir hata oluştu.', loading: false });
      }
      return response;
    } catch (error) {
      console.error('Haber reddedilirken bir hata oluştu:', error);
      set({ error: 'Haber reddedilirken bir hata oluştu.', loading: false });
      return {
        success: false,
        message: 'Haber reddedilirken bir hata oluştu.'
      };
    }
  },

  submitForApproval: async (newsId) => {
    set({ loading: true, error: null });
    console.log("submitForApproval called with newsId:", newsId);
    
    try {
      // Sayısal ID'ye dönüştür
      const numericId = typeof newsId === 'string' ? parseInt(newsId) : newsId;
      const response = await newsService.submitForApproval(numericId);
      console.log("submitForApproval response:", response);
      
      if (response.success) {
        // Haber durumunu state'de güncelle
        get().updateNewsStatus(newsId, "Onay Bekliyor");
        set({ loading: false });
      } else {
        console.error("Error in submitForApproval:", response.message);
        set({ error: response.message || 'Haber onaya gönderilirken bir hata oluştu.', loading: false });
      }
      return response;
    } catch (error) {
      console.error('Haber onaya gönderilirken bir hata oluştu:', error);
      set({ error: 'Haber onaya gönderilirken bir hata oluştu.', loading: false });
      return {
        success: false,
        message: 'Haber onaya gönderilirken bir hata oluştu.'
      };
    }
  },

  createNews: async (newsData) => {
    set({ loading: true, error: null });
    console.log("createNews called with data:", newsData);
    
    try {
      const response = await newsService.createNews(newsData);
      console.log("createNews response:", response);
      
      if (response.success && response.data) {
        // Yeni haberi state'e ekle
        const currentNews = get().news;
        set({ 
          news: [response.data, ...currentNews],
          loading: false 
        });
        return {
          success: true,
          data: response.data,
          message: 'Haber başarıyla eklendi'
        };
      } else {
        console.error("Error in createNews:", response.message);
        set({ error: response.message || 'Haber eklenirken bir hata oluştu.', loading: false });
        return {
          success: false,
          message: response.message || 'Haber eklenirken bir hata oluştu.'
        };
      }
    } catch (error) {
      console.error('Haber eklenirken bir hata oluştu:', error);
      set({ error: 'Haber eklenirken bir hata oluştu.', loading: false });
      return {
        success: false,
        message: 'Haber eklenirken bir hata oluştu.'
      };
    }
  },

  setSelectedNews: (news) => {
    console.log("setSelectedNews called with:", news);
    set({ selectedNews: news });
  },

  updateNewsStatus: (newsId, status) => {
    console.log("updateNewsStatus called with newsId:", newsId, "status:", status);
    set((state) => ({
      news: state.news.map(item => 
        (item.id === newsId) ? { ...item, status } : item
      ),
      selectedNews: state.selectedNews?.id === newsId ? 
        { ...state.selectedNews, status } : state.selectedNews
    }));
  }
}); 