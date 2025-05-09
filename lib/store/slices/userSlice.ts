import { type StateCreator } from 'zustand';
import userService from '@/lib/services/userService';
import type { User, UserType } from '@/interfaces/user';
import type { ApiError } from '@/lib/services/api';

export interface UserProfileState {
  // State
  profile: User | null;
  users: UserType[];
  selectedUser: UserType | null;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
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

  // User management
  getUsers: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    role?: string | undefined;
    isActive?: boolean | undefined;
    searchQuery?: string | undefined;
  }) => Promise<void>;
  getUserById: (userId: string) => Promise<void>;
  createUser: (userData: Partial<UserType>) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  updateUser: (userId: string, userData: Partial<UserType>) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  deleteUser: (userId: string) => Promise<{
    success: boolean;
    message: string | undefined;
  }>;
  selectUser: (user: UserType | null) => void;
}

const createUserProfileSlice: StateCreator<UserProfileState, [], [], UserProfileState> = (set, get) => {
  return {
    // Initial state
    profile: null,
    users: [],
    selectedUser: null,
    totalUsers: 0,
    currentPage: 1,
    pageSize: 10,
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

    clearProfileError: () => set({ error: null }),

    // User management actions
    getUsers: async (params) => {
      set({ isLoading: true, error: null });

      try {
        const response = await userService.getAllUsers({
          page: params?.page || get().currentPage,
          limit: params?.limit || get().pageSize,
          role: params?.role,
          isActive: params?.isActive,
          searchQuery: params?.searchQuery
        });

        if (response.success && response.data) {
          set({
            users: response.data.users,
            totalUsers: response.data.total,
            currentPage: response.data.page,
            pageSize: response.data.limit,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Kullanıcılar yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Kullanıcılar yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    getUserById: async (userId) => {
      set({ isLoading: true, error: null });

      try {
        const response = await userService.getUserById(userId);

        if (response.success && response.data) {
          set({
            selectedUser: response.data,
            isLoading: false
          });
        } else {
          set({
            error: response.message || 'Kullanıcı detayları yüklenirken bir hata oluştu',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Kullanıcı detayları yüklenirken hata:', error);
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Kullanıcı detayları yüklenirken bir sorun oluştu',
          isLoading: false
        });
      }
    },

    createUser: async (userData) => {
      set({ isLoading: true, error: null });

      try {
        const response = await userService.createUser(userData);

        if (response.success && response.data) {
          // Kullanıcı listesini güncelle
          await get().getUsers();
          return { success: true, message: response.message };
        }

        set({
          error: response.message || 'Kullanıcı oluşturulurken bir hata oluştu',
          isLoading: false
        });
        return { success: false, message: response.message };
      } catch (error) {
        console.error('Kullanıcı oluşturulurken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Kullanıcı oluşturulurken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return { success: false, message: errorMessage };
      }
    },

    updateUser: async (userId, userData) => {
      set({ isLoading: true, error: null });

      try {
        const response = await userService.updateUser(userId, userData);

        if (response.success && response.data) {
          // Kullanıcı ve seçili kullanıcı bilgilerini güncelle
          set((state) => {
            const updatedUsers = state.users.map(user =>
              user.id === userId ? response.data! : user
            );

            return {
              users: updatedUsers,
              selectedUser: state.selectedUser?.id === userId ? response.data : state.selectedUser,
              isLoading: false,
              error: null // Ekstra olarak hata durumunu da temizleyelim
            };
          });

          return { success: true, message: response.message };
        }

        set({
          error: response.message || 'Kullanıcı güncellenirken bir hata oluştu',
          isLoading: false
        });
        return { success: false, message: response.message };
      } catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Kullanıcı güncellenirken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return { success: false, message: errorMessage };
      }
    },

    deleteUser: async (userId) => {
      set({ isLoading: true, error: null });

      try {
        const response = await userService.deleteUser(userId);

        if (response.success) {
          // Kullanıcıyı listeden kaldır
          set((state) => {
            const updatedUsers = state.users.filter(user => user.id !== userId);

            // Eğer seçili kullanıcı silinmişse, seçimi temizle
            const updatedSelectedUser = state.selectedUser?.id === userId ? null : state.selectedUser;

            return {
              users: updatedUsers,
              selectedUser: updatedSelectedUser,
              isLoading: false
            };
          });

          return { success: true, message: response.message };
        }

        set({
          error: response.message || 'Kullanıcı silinirken bir hata oluştu',
          isLoading: false
        });
        return { success: false, message: response.message };
      } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Kullanıcı silinirken bir sorun oluştu';

        set({
          error: errorMessage,
          isLoading: false
        });

        return { success: false, message: errorMessage };
      }
    },

    selectUser: (user) => {
      set({ selectedUser: user });
    }
  };
};

export default createUserProfileSlice; 