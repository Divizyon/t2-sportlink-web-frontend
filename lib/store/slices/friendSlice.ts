import { type StateCreator } from 'zustand';
import friendService from '@/lib/services/friendService';
import type { FriendRequest, FriendStatus, FriendRequestListParams, FriendListParams } from '@/interfaces/friend';
import type { User } from '@/interfaces/user';
import type { ApiError } from '@/lib/services/api';

export interface FriendState {
  // State
  friends: User[];
  friendRequests: FriendRequest[];
  friendStatus: FriendStatus | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  getFriends: (params?: FriendListParams) => Promise<void>;
  getFriendRequests: (params?: FriendRequestListParams) => Promise<void>;
  getFriendshipStatus: (userId: string) => Promise<void>;
  sendFriendRequest: (userId: string) => Promise<{ success: boolean; message: string | undefined }>;
  acceptFriendRequest: (requestId: string) => Promise<{ success: boolean; message: string | undefined }>;
  rejectFriendRequest: (requestId: string) => Promise<{ success: boolean; message: string | undefined }>;
  removeFriend: (userId: string) => Promise<{ success: boolean; message: string | undefined }>;
  clearFriendError: () => void;
  setPage: (page: number) => void;
}

const createFriendSlice: StateCreator<FriendState, [], [], FriendState> = (set, get) => {
  return {
    // Initial state
    friends: [],
    friendRequests: [],
    friendStatus: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    isLoading: false,
    error: null,

    // Actions
    getFriends: async (params) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.listFriends(params);
        
        if (response.success) {
          set({ 
            friends: response.data, 
            pagination: response.pagination,
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Arkadaşlar yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Arkadaşlar yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Arkadaşlar yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    getFriendRequests: async (params) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.listFriendRequests(params);
        
        if (response.success) {
          set({ 
            friendRequests: response.data, 
            pagination: response.pagination,
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Arkadaşlık istekleri yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Arkadaşlık istekleri yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Arkadaşlık istekleri yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    getFriendshipStatus: async (userId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.getFriendshipStatus(userId);
        
        if (response.success) {
          set({ 
            friendStatus: response.data, 
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Arkadaşlık durumu yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Arkadaşlık durumu yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Arkadaşlık durumu yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    sendFriendRequest: async (userId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.sendFriendRequest(userId);
        set({ isLoading: false });
        
        if (response.success) {
          // Arkadaşlık durumunu "requested" olarak güncelle
          set({
            friendStatus: { 
              status: 'requested'
            }
          });
          return { success: true, message: response.message };
        } else {
          set({ 
            error: response.message || 'Arkadaşlık isteği gönderilirken bir hata oluştu'
          });
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('Arkadaşlık isteği gönderilirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Arkadaşlık isteği gönderilirken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    acceptFriendRequest: async (requestId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.acceptFriendRequest(requestId);
        set({ isLoading: false });
        
        if (response.success) {
          // Arkadaşlık isteklerini güncelle
          get().getFriendRequests();
          // Arkadaşları güncelle
          get().getFriends();
          
          return { success: true, message: response.message };
        } else {
          set({ 
            error: response.message || 'Arkadaşlık isteği kabul edilirken bir hata oluştu'
          });
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('Arkadaşlık isteği kabul edilirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Arkadaşlık isteği kabul edilirken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    rejectFriendRequest: async (requestId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.rejectFriendRequest(requestId);
        set({ isLoading: false });
        
        if (response.success) {
          // Arkadaşlık isteklerini güncelle
          get().getFriendRequests();
          
          return { success: true, message: response.message };
        } else {
          set({ 
            error: response.message || 'Arkadaşlık isteği reddedilirken bir hata oluştu'
          });
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('Arkadaşlık isteği reddedilirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Arkadaşlık isteği reddedilirken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    removeFriend: async (userId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await friendService.removeFriend(userId);
        set({ isLoading: false });
        
        if (response.success) {
          // Arkadaşları güncelle
          get().getFriends();
          // Arkadaşlık durumunu güncelle
          set({
            friendStatus: { 
              status: 'none'
            }
          });
          
          return { success: true, message: response.message };
        } else {
          set({ 
            error: response.message || 'Arkadaşlıktan çıkarılırken bir hata oluştu'
          });
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('Arkadaşlıktan çıkarılırken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Arkadaşlıktan çıkarılırken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    clearFriendError: () => set({ error: null }),

    setPage: (page: number) => {
      set((state) => ({ 
        pagination: {
          ...state.pagination,
          page
        } 
      }));
      // Sayfa değiştiğinde arkadaşları yenile
      const params = {
        page,
        limit: get().pagination.limit
      };
      get().getFriends(params);
    }
  };
};

export default createFriendSlice; 