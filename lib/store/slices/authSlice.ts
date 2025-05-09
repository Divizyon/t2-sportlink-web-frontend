import { type StateCreator } from 'zustand';
import authService from '@/lib/services/authService';
import type {
  LoginCredentials,
  RegisterData,
  UserData,
  AuthResponse,
  SessionData
} from '@/lib/services/authService';
import api, { type ApiError } from '@/lib/services/api';

export interface AuthState {
  // State
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resendEmailConfirmation: (email: string) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  clearError: () => void;
}

const createAuthSlice: StateCreator<AuthState> = (set, get) => {
  // LocalStorage'dan token ve kullanıcı bilgilerini al (SSR-safe)
  let initialUser: UserData | null = null;
  let initialToken: string | null = null;
  let initialIsAuthenticated = false;

  // Browser tarafında çalışıyorsa localStorage erişimi yap
  if (typeof window !== 'undefined') {
    try {
      initialUser = authService.getLocalUser();
      initialToken = authService.getAccessToken();
      initialIsAuthenticated = authService.isAuthenticated();
    } catch (error) {
      console.error('Auth state initialization error:', error);
    }
  }

  return {
    // Initial state
    user: initialUser,
    token: initialToken,
    isAuthenticated: initialIsAuthenticated,
    isLoading: false,
    error: null,

    // Actions
    login: async (credentials: LoginCredentials) => {
      console.log("AuthSlice: Login işlemi başlatılıyor...");
      set({ isLoading: true, error: null });

      try {
        const response = await authService.login(credentials);
        console.log("AuthSlice: Login API yanıtı alındı:", response ? "Başarılı" : "Başarısız");

        if (response.session && response.session.access_token) {
          console.log("AuthSlice: Token bulundu, state güncelleniyor");
          set({
            user: response.user,
            token: response.session.access_token,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          console.warn("AuthSlice: Token bulunamadı!");
          set((state) => ({
            ...state,
            isLoading: false,
            isAuthenticated: false
          }));
        }

        return response;
      } catch (error) {
        console.error("AuthSlice: Login işleminde hata:", error);
        const apiError = error as ApiError;
        const errorMessage = apiError.message || 'Giriş işlemi başarısız oldu.';

        set({
          error: errorMessage,
          isLoading: false,
          isAuthenticated: false
        });

        throw apiError; // Hata yukarıya iletiliyor
      }
    },

    register: async (data: RegisterData) => {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.register(data);

        // Kayıt başarılı olduğunda, kullanıcı otomatik olarak giriş yapmayabilir
        // Bu API'nizin davranışına bağlıdır
        if (response.session && response.session.access_token) {
          set({
            user: response.user,
            token: response.session.access_token,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set((state) => ({
            ...state,
            isLoading: false
          }));
        }

        return response;
      } catch (error) {
        const apiError = error as ApiError;
        set({
          error: apiError.message || 'Kayıt işlemi başarısız oldu.',
          isLoading: false
        });
        throw apiError;
      }
    },

    logout: () => {
      authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    },

    forgotPassword: async (email: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.resetPassword(email);
        set((state) => ({
          ...state,
          isLoading: false
        }));
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        set((state) => ({
          ...state,
          error: apiError.message || 'Şifre sıfırlama isteği başarısız oldu.',
          isLoading: false
        }));
        throw apiError;
      }
    },

    resendEmailConfirmation: async (email: string) => {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.resendEmailConfirmation(email);
        set((state) => ({
          ...state,
          isLoading: false
        }));
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        set((state) => ({
          ...state,
          error: apiError.message || 'E-posta doğrulama isteği başarısız oldu.',
          isLoading: false
        }));
        throw apiError;
      }
    },

    verifyEmail: async (token: string) => {
      set({ isLoading: true, error: null });

      try {
        // API'nizde yoksa bu metodu authService'e eklemeniz gerekebilir
        const response = await api.get<{ message: string }>(`/auth/verify-email?token=${token}`);
        set((state) => ({
          ...state,
          isLoading: false
        }));
        return response.data;
      } catch (error) {
        const apiError = error as ApiError;
        set((state) => ({
          ...state,
          error: apiError.message || 'E-posta doğrulama başarısız oldu.',
          isLoading: false
        }));
        throw apiError;
      }
    },

    clearError: () => set({ error: null })
  };
};

export default createAuthSlice; 