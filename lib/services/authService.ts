import api, { handleApiError } from './api';
import type { ApiError } from './api';
import type { AxiosError } from 'axios';

// Debug modu - Sadece development için
const debug = process.env.NODE_ENV === 'development';

// Auth types
export interface UserData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  role?: string;
}

export interface SessionData {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  role: string;
    [key: string]: any; // Diğer olası alanlar için
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: UserData;
  session: SessionData;
}

// Auth service class
class AuthService {
  private readonly BASE_PATH = '/auth';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  private readonly SESSION_EXPIRY_KEY = 'session_expires_at';

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (debug) {
        console.log("Login isteği gönderiliyor:", `${this.BASE_PATH}/login`, credentials.email);
      }
      
      const response = await api.post<AuthResponse>(
        `${this.BASE_PATH}/login`,
        credentials
      );
      
      // Başarılı giriş kontrolü
      if (response.data && response.data.success && response.data.session) {
        if (debug) {
          console.log("AuthService: Login başarılı, token alındı");
        }
        
        // Session ve kullanıcı bilgilerini kaydet
        this.saveSession(response.data.session);
        this.setUser(response.data.user);
        
        // Token doğru kaydedildi mi kontrol et
        const savedToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        if (debug) {
          console.log("Token kaydedildi mi:", !!savedToken);
          if (savedToken) {
            console.log("Kaydedilen token:", savedToken.substring(0, 15) + "...");
          }
        }
      } else if (debug) {
        console.warn("AuthService: Sunucudan geçerli bir yanıt alınamadı!", response.data);
      }
      
      return response.data;
    } catch (error) {
      if (debug) {
        console.error("AuthService Login hatası:", error);
      }
      
      const apiError = handleApiError(error as AxiosError<ApiError>);
      
      // Email doğrulama hatasını kontrol et
      if (apiError.message?.includes('Email adresinizi doğrulamanız gerekmektedir')) {
        return {
          success: false,
          message: apiError.message,
          user: {} as UserData,
          session: {} as SessionData,
          needsEmailVerification: true,
          email: credentials.email
        } as AuthResponse & { needsEmailVerification: boolean, email: string };
      }
      
      throw apiError;
    }
  }

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        `${this.BASE_PATH}/register`,
        data
      );
      
      // Bazı API'ler kayıt sonrası otomatik giriş yapabilir
      if (response.data && response.data.success && response.data.session) {
        this.saveSession(response.data.session);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
  
  // Resend email confirmation
  async resendEmailConfirmation(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `${this.BASE_PATH}/resend-confirmation`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `${this.BASE_PATH}/reset-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await api.get<{ user: UserData }>(`${this.BASE_PATH}/me`);
      return response.data.user;
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Logout user
  logout(): void {
    console.log("AuthService: Çıkış yapılıyor, oturum bilgileri siliniyor...");
    this.clearSession();
    this.removeUser();
    // Sayfayı yönlendir
    window.location.href = '/auth/login';
  }
  
  // Session yönetimi
  saveSession(session: SessionData): void {
    try {
      // Access token kaydet
      localStorage.setItem(this.ACCESS_TOKEN_KEY, session.access_token);
      
      // Token'ı auth.ts için de kaydet
      localStorage.setItem('token', session.access_token);
      
      // Refresh token kaydet
      localStorage.setItem(this.REFRESH_TOKEN_KEY, session.refresh_token);
      
      // Oturum süresini kaydet
      localStorage.setItem(this.SESSION_EXPIRY_KEY, session.expires_at.toString());
      
      if (debug) {
        console.log("Oturum bilgileri kaydedildi, sona erme tarihi:", new Date(session.expires_at * 1000).toLocaleString());
        console.log("Token durum kontrolü:", 
          "access_token:", !!localStorage.getItem(this.ACCESS_TOKEN_KEY),
          "token:", !!localStorage.getItem('token'));
      }
    } catch (error) {
      console.error("Oturum bilgileri kaydedilirken hata:", error);
    }
  }
  
  clearSession(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem('token'); // auth.ts için token anahtarını da temizle
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.SESSION_EXPIRY_KEY);
      
      if (debug) {
        console.log("Oturum bilgileri temizlendi");
      }
    } catch (error) {
      console.error("Oturum bilgileri temizlenirken hata:", error);
    }
  }
  
  getAccessToken(): string | null {
    try {
      // Önce access_token'ı dene
      let token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      
      // Eğer yoksa, token anahtarını dene
      if (!token) {
        token = localStorage.getItem('token');
        
        // Eğer token varsa, access_token'a da kopyala
        if (token) {
          localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
        }
      } else {
        // Eğer access_token varsa, token'a da kopyala
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', token);
        }
      }
      
      return token;
    } catch (error) {
      console.error("Token alınırken hata:", error);
      return null;
    }
  }
  
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  // Kullanıcı bilgileri yönetimi
  setUser(user: UserData): void {
    try {
      // Debug log
      console.log('Setting user data:', {
        user,
        role: user.role
      });

      // Eğer role yoksa, localStorage'dan kontrol et
      if (!user.role) {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (userStr) {
          try {
            const localUser = JSON.parse(userStr);
            if (localUser.role) {
              console.log('Using role from localStorage:', localUser.role);
              user.role = localUser.role;
            }
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
      }

      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('User data saved to localStorage');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }
  
  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
  
  // Oturum geçerlilik kontrolü
  isAuthenticated(): boolean {
    try {
      const token = this.getAccessToken();
      const expiresAt = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      
      if (!token || !expiresAt) {
        return false;
      }
      
      // Oturum süresini kontrol et
      const expirationTime = parseInt(expiresAt) * 1000; // saniyeden milisaniyeye
      const currentTime = Date.now();
      const isValid = !!token && currentTime < expirationTime;
      
      if (debug) {
        console.log("Oturum durumu kontrolü:");
        console.log("- Token mevcut:", !!token);
        console.log("- Şu anki zaman:", new Date(currentTime).toLocaleString());
        console.log("- Sona erme zamanı:", new Date(expirationTime).toLocaleString());
        console.log("- Oturum geçerli mi:", isValid);
      }
      
      return isValid;
    } catch (error) {
      console.error("Oturum kontrolünde hata:", error);
      return false;
    }
  }
  
  // Oturum süresini dakika cinsinden döndürür
  getSessionRemainingTime(): number {
    const expiresAt = localStorage.getItem(this.SESSION_EXPIRY_KEY);
    if (!expiresAt) return 0;
    
    const expirationTime = parseInt(expiresAt) * 1000;
    const currentTime = Date.now();
    const remainingMs = Math.max(0, expirationTime - currentTime);
    
    return Math.floor(remainingMs / (60 * 1000)); // Dakika cinsinden
  }
  
  // Get current user from localStorage
  getLocalUser(): UserData | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      console.log('No user data found in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      
      // Rol yoksa, otomatik olarak superadmin atayalım
      if (!user.role) {
        console.log('User has no role, setting default role: superadmin');
        user.role = 'superadmin';
        
        // Güncellenmiş kullanıcı bilgisini kaydedelim
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
      
      console.log('Retrieved user from localStorage:', {
        user,
        role: user.role
      });
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  
  // Refresh token ile yeni access token al
  async refreshSession(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.error("Refresh token bulunamadı.");
      return false;
    }
    
    try {
      const response = await api.post<{ session: SessionData }>(`${this.BASE_PATH}/refresh`, {
        refresh_token: refreshToken
      });
      
      if (response.data && response.data.session) {
        this.saveSession(response.data.session);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Token yenileme hatası:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService; 
