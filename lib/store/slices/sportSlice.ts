import { type StateCreator } from 'zustand';
import sportService from '@/lib/services/sportService';
import type { Sport } from '@/interfaces/sport';
import type { ApiError } from '@/lib/services/api';

export interface SportState {
  // State
  sports: Sport[];
  currentSport: Sport | null;
  popularSports: Sport[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getAllSports: () => Promise<void>;
  getSportById: (sportId: string) => Promise<void>;
  getPopularSports: (limit?: number) => Promise<void>;
  getSportsByCategory: (category: string) => Promise<void>;
  clearSportError: () => void;
}

const createSportSlice: StateCreator<SportState, [], [], SportState> = (set, get) => {
  return {
    // Initial state
    sports: [],
    currentSport: null,
    popularSports: [],
    isLoading: false,
    error: null,

    // Actions
    getAllSports: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await sportService.listSports();
        
        if (response.success) {
          set({ 
            sports: response.data, 
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Spor dalları yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Spor dalları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Spor dalları yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    getSportById: async (sportId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await sportService.getSportById(sportId);
        
        if (response.success) {
          set({ 
            currentSport: response.data, 
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Spor dalı detayları yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Spor dalı detayları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Spor dalı detayları yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    getPopularSports: async (limit = 5) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await sportService.getPopularSports(limit);
        
        if (response.success) {
          set({ 
            popularSports: response.data, 
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Popüler spor dalları yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Popüler spor dalları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Popüler spor dalları yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    getSportsByCategory: async (category: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await sportService.getSportsByCategory(category);
        
        if (response.success) {
          set({ 
            sports: response.data, 
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Kategoriye göre spor dalları yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Kategoriye göre spor dalları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Kategoriye göre spor dalları yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    clearSportError: () => set({ error: null })
  };
};

export default createSportSlice; 