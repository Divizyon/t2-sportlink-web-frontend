import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'token';

// Create Axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Log middleware - Development only
const debug = process.env.NODE_ENV === 'development';

// Request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        // Token varsa, header'a ekle
        config.headers.Authorization = `Bearer ${token}`;
        
        if (debug) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('Token bulundu ve header\'a eklendi');
          
          // Kullanıcı rolü kontrolü
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const userData = JSON.parse(userStr);
              console.log("İstek yapan kullanıcı rolü:", userData.role);
            } catch (e) {
              console.error("Kullanıcı bilgisi parse edilemedi");
            }
          }
        }
      } else if (debug) {
        console.warn(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.warn('Token bulunamadı. Yetki gerektiren bir endpoint için sorun olabilir.');
      }
      
      return config;
    } catch (error) {
      console.error('Token alınırken hata oluştu:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (debug) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (debug) {
      console.error(`API Error: ${error.response?.status} ${error.config?.url}`);
      console.error('Error Details:', error.response?.data);
    }
    
    // Hata tipine göre işlem yap
    if (error.response?.status === 401) {
      // Yetkisiz erişim - token geçersiz veya süresi dolmuş
      try {
        localStorage.removeItem(TOKEN_KEY);
        // Kullanıcıyı login sayfasına yönlendir
        window.location.href = '/auth/login';
      } catch (e) {
        console.error('Token silinemedi:', e);
      }
    } else if (error.response?.status === 403) {
      // Yetkisiz işlem - token doğru ama bu işlem için yetki yok
      console.error('Yetki hatası: Bu işlem için yetkiniz yok.');
      // Burada özel bir işlem yapabilirsiniz (örn: bildirim gösterme)
    }
    
    return Promise.reject(error);
  }
);

// Type for API error response
export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<any>): ApiError => {
  // API'den dönen hata mesajı formatı farklı olabilir, bunu kontrol edelim
  let errorMessage = 'Beklenmeyen bir hata oluştu';
  
  if (error.response?.data) {
    // Farklı hata format yapılarını kontrol et
    if (typeof error.response.data === 'string') {
      errorMessage = error.response.data;
    } else if (error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.data.error) {
      errorMessage = error.response.data.error;
    } else if (error.response.data.status === 'error' && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
  }
  
  return {
    message: errorMessage,
    code: error.response?.data?.code || 'UNKNOWN_ERROR',
    status: error.response?.status || 500
  };
};

export default api; 