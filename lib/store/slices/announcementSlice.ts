import { type StateCreator } from 'zustand';
import announcementService, { 
  type CreateAnnouncementDTO, 
  type UpdateAnnouncementDTO 
} from '@/lib/services/announcementService';
import type { Announcement, AnnouncementListParams } from '@/interfaces/announcement';
import { type ApiError } from '@/lib/services/api';

export interface AnnouncementState {
  // State
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  isLoading: boolean;
  error: string | null;
  lastRequestId?: string; // İstek takibi için
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // Actions
  getAnnouncements: (page?: number, limit?: number, includeUnpublished?: boolean) => Promise<void>;
  searchAnnouncements: (params: AnnouncementListParams) => Promise<void>;
  getAnnouncementById: (id: string) => Promise<void>;
  createAnnouncement: (data: CreateAnnouncementDTO) => Promise<boolean>;
  updateAnnouncement: (id: string, data: UpdateAnnouncementDTO) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
  clearError: () => void;
  setCurrentAnnouncement: (announcement: Announcement | null) => void;
}

const createAnnouncementSlice: StateCreator<AnnouncementState> = (set, get) => {
  return {
    // Initial state
    announcements: [],
    currentAnnouncement: null,
    isLoading: false,
    error: null,
    lastRequestId: undefined,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },

    // Actions
    getAnnouncements: async (page = 1, limit = 10, includeUnpublished) => {
      // İstekleri throttle etmek için istek ID kullan
      const requestId = Date.now().toString();
      
      // Eğer yükleme zaten devam ediyorsa, yeni isteği atla
      if (get().isLoading) {
        console.log(`getAnnouncements: Yükleme zaten devam ediyor, istek atlanıyor - page: ${page}, limit: ${limit}`);
        return;
      }
      
      set({ lastRequestId: requestId, isLoading: true, error: null });
      console.log(`getAnnouncements başlatıldı [${requestId}]: page=${page}, limit=${limit}`);
      
      try {
        const response = await announcementService.getAnnouncements(page, limit, includeUnpublished);
        
        console.log("API yanıtı:", response);
        
        if (response.success) {
          // API yanıtını incele
          console.log("API başarılı yanıt verdi", response.data);
          
          // API response.data içinde bir 'announcements' alanı olabilir
          // Veya direkt olarak data bir dizi olabilir
          const announcements = Array.isArray(response.data) 
            ? response.data 
            : response.data.announcements || response.data.data || [];
          
          console.log("İşlenmiş duyurular:", announcements);
          
          // API pagination değerlerini al
          // İki farklı formatta pagination yapısını destekle
          const pagination = response.pagination || response.data?.pagination || {};
          
          set({
            announcements: announcements,
            pagination: {
              total: pagination.total || pagination.totalCount || 0,
              page: pagination.page || 1,
              limit: pagination.limit || pagination.pageSize || 10,
              totalPages: pagination.totalPages || 0
            },
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Duyurular alınırken hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Duyurular alınırken beklenmeyen bir hata oluştu',
          isLoading: false
        });
      }
    },

    searchAnnouncements: async (params) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await announcementService.searchAnnouncements(params);
        
        if (response.success) {
          set({
            announcements: response.data,
            pagination: {
              total: response.pagination?.totalCount || 0,
              page: response.pagination?.page || 1,
              limit: response.pagination?.pageSize || 10,
              totalPages: response.pagination?.totalPages || 0
            },
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Duyurular aranırken hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Duyurular aranırken beklenmeyen bir hata oluştu',
          isLoading: false
        });
      }
    },

    getAnnouncementById: async (id) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await announcementService.getAnnouncementById(id);
        
        if (response.success) {
          set({
            currentAnnouncement: response.data,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Duyuru detayları alınırken hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Duyuru detayları alınırken beklenmeyen bir hata oluştu',
          isLoading: false
        });
      }
    },

    createAnnouncement: async (data) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await announcementService.createAnnouncement(data);
        
        if (response.success) {
          // Başarılı oluşturma durumunu set et, listeyi otomatik güncelleme
          set({ 
            isLoading: false,
            // Gerçek uygulamada, ID ile belirlenen bir duyuruyu ekleme işlemi yapılabilir
            // Ancak bu örnek için başarılı işlemden sonra sayfa yeniden yüklenecek
          });
          return true;
        } else {
          set({
            error: response.message || 'Duyuru oluşturulurken hata oluştu',
            isLoading: false
          });
          return false;
        }
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Duyuru oluşturulurken beklenmeyen bir hata oluştu',
          isLoading: false
        });
        return false;
      }
    },

    updateAnnouncement: async (id, data) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await announcementService.updateAnnouncement(id, data);
        
        if (response.success) {
          // Başarılı güncelleme durumunu set et
          
          // Eğer aktif bir duyuru varsa, onu da güncelle
          if (get().currentAnnouncement?.id === id) {
            set({ currentAnnouncement: response.data });
          }
          
          set({ isLoading: false });
          return true;
        } else {
          set({
            error: response.message || 'Duyuru güncellenirken hata oluştu',
            isLoading: false
          });
          return false;
        }
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Duyuru güncellenirken beklenmeyen bir hata oluştu',
          isLoading: false
        });
        return false;
      }
    },

    deleteAnnouncement: async (id) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await announcementService.deleteAnnouncement(id);
        
        if (response.success) {
          // Başarılı silme durumunu set et
          
          // Eğer aktif duyuru silinmişse, null'a çek
          if (get().currentAnnouncement?.id === id) {
            set({ currentAnnouncement: null });
          }
          
          // Mevcut duyuru listesinden silinen öğeyi çıkar
          set(state => ({ 
            announcements: state.announcements.filter(item => item.id !== id),
            isLoading: false 
          }));
          
          return true;
        } else {
          set({
            error: response.message || 'Duyuru silinirken hata oluştu',
            isLoading: false
          });
          return false;
        }
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Duyuru silinirken beklenmeyen bir hata oluştu',
          isLoading: false
        });
        return false;
      }
    },

    clearError: () => set({ error: null }),
    
    setCurrentAnnouncement: (announcement) => {
      set({ currentAnnouncement: announcement });
    }
  };
};

export default createAnnouncementSlice; 