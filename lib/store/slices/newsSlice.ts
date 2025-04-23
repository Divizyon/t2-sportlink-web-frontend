import type { StateCreator } from 'zustand';
import newsService from '@/lib/services/newsService';
import type { News, NewsListParams, NewsListResponse } from '@/interfaces/news';
import type { StoreState } from '@/lib/store';

export interface NewsState {
  news: News[];
  featuredNews: News[];
  loading: boolean;
  error: string | null;
  selectedNews: News | null;
  getAllNews: (params?: NewsListParams) => Promise<NewsListResponse>;
  getNewsById: (id: string) => Promise<News | null>;
  getNewsByCategory: (categoryId: string, params?: NewsListParams) => Promise<NewsListResponse>;
  getFeaturedNews: (limit?: number) => Promise<NewsListResponse>;
}

export const createNewsSlice: StateCreator<StoreState, [], [], NewsState> = (set, get) => ({
  news: [],
  featuredNews: [],
  loading: false,
  error: null,
  selectedNews: null,

  getAllNews: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await newsService.listNews(params);
      if (response.success) {
        set({ news: response.data, loading: false });
      } else {
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
    try {
      const response = await newsService.getNewsById(id);
      if (response.success) {
        set({ selectedNews: response.data, loading: false });
        return response.data;
      } else {
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
    try {
      const response = await newsService.getNewsByCategory(categoryId, params);
      if (response.success) {
        set({ news: response.data, loading: false });
      } else {
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
    try {
      const response = await newsService.getFeaturedNews(limit);
      if (response.success) {
        set({ featuredNews: response.data, loading: false });
      } else {
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
  }
}); 