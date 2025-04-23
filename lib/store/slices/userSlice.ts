import { type StateCreator } from 'zustand';
import userService from '@/lib/services/userService';
import type { User } from '@/interfaces/user';
import type { ApiError } from '@/lib/services/api';

export interface UserProfileState {
  // State
  profile: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  updateProfilePicture: (imageFile: File) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  clearProfileError: () => void;
}

const createUserProfileSlice: StateCreator<UserProfileState, [], [], UserProfileState> = (set, get) => {
  return {
    // Initial state
    profile: null,
    isLoading: false,
    error: null,

    // Actions
    getProfile: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await userService.getProfile();
        
        if (response.success && response.data) {
          set({ 
            profile: response.data, 
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Profil yüklenirken bir hata oluştu', 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({ 
          error: apiError.message || 'Profil bilgileri yüklenirken bir sorun oluştu', 
          isLoading: false 
        });
      }
    },

    updateProfile: async (profileData: Partial<User>) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await userService.updateProfile(profileData);
        
        if (response.success && response.data) {
          set({ 
            profile: response.data, 
            isLoading: false 
          });
          return { success: true, message: response.message };
        }
        
        set({ 
          error: response.message || 'Profil güncellenirken bir hata oluştu', 
          isLoading: false 
        });
        return { success: false, message: response.message };
      } catch (error) {
        console.error('Profil güncellenirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Profil bilgileri güncellenirken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    updateProfilePicture: async (imageFile: File) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await userService.updateProfilePicture(imageFile);
        
        if (response.success && response.data?.profile_picture) {
          // Sadece profil fotoğrafı alanını güncelle
          set((state) => ({ 
            profile: state.profile ? { ...state.profile, profile_picture: response.data!.profile_picture } : null, 
            isLoading: false 
          }));
          return { success: true, message: response.message };
        }
        
        set({ 
          error: response.message || 'Profil fotoğrafı güncellenirken bir hata oluştu', 
          isLoading: false 
        });
        return { success: false, message: response.message };
      } catch (error) {
        console.error('Profil fotoğrafı güncellenirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Profil fotoğrafı güncellenirken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    changePassword: async (data: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await userService.changePassword(data);
        
        if (response.success) {
          set({ isLoading: false });
          return { success: true, message: response.message };
        }
        
        set({ 
          error: response.message || 'Şifre değiştirilirken bir hata oluştu', 
          isLoading: false 
        });
        return { success: false, message: response.message };
      } catch (error) {
        console.error('Şifre değiştirilirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Şifre değiştirilirken bir sorun oluştu';
        
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        
        return { success: false, message: errorMessage };
      }
    },

    clearProfileError: () => set({ error: null })
  };
};

export default createUserProfileSlice; 