import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'token';
const ACCESS_TOKEN_KEY = 'access_token';

// Debug - API ayarlarını konsola yaz
console.log('API_BASE_URL:', API_BASE_URL);

// Backend port kontrolü
if (API_BASE_URL === 'http://localhost:3000/api') {
  console.warn('Backend ve frontend aynı portu kullanıyor olabilir. Eğer backend de 3000 portunda çalışıyorsa, bir çakışma olabilir.');
  console.warn('Eğer hatalar yaşıyorsanız, backend servisini farklı bir portta (örn. 5000) çalıştırmayı veya .env dosyasında NEXT_PUBLIC_API_URL değerini değiştirmeyi deneyin.');
}

// Create Axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Configure retry logic
axiosRetry(api, {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount: number) => {
    return retryCount * 1000; // Time to wait between retries (1s, 2s, 3s)
  },
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 429 (too many requests)
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429;
  }
});

// Log middleware - Development only
const debug = process.env.NODE_ENV === 'development' || true; // Daima debug modunu etkinleştir

// Axios konfigürasyonu hakkında bilgi
console.log('Axios yapılandırması: ', {
  baseURL: API_BASE_URL,
  timeout: api.defaults.timeout,
  defaultHeaders: api.defaults.headers
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      // Önce 'token' anahtarına bak
      let token = localStorage.getItem(TOKEN_KEY);

      // Eğer token yoksa access_token'ı kontrol et
      if (!token) {
        token = localStorage.getItem(ACCESS_TOKEN_KEY);

        // Eğer access_token varsa, token anahtarına da kopyala
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
          if (debug) {
            console.log("Token senkronize edildi: access_token -> token");
          }
        }
      } else {
        // Eğer token varsa, access_token anahtarına da kopyala
        if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
          localStorage.setItem(ACCESS_TOKEN_KEY, token);
          if (debug) {
            console.log("Token senkronize edildi: token -> access_token");
          }
        }
      }

      if (token) {
        // Token varsa, header'a ekle
        config.headers.Authorization = `Bearer ${token}`;

        if (debug) {
          const method = config.method ? config.method.toUpperCase() : 'UNKNOWN';
          console.log(`API Request: ${method} ${config.url || 'URL yok'}`);
          console.log('Request Headers:', config.headers);
          console.log('Request Data:', config.data);

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
        const method = config.method ? config.method.toUpperCase() : 'UNKNOWN';
        console.warn(`API Request: ${method} ${config.url || 'URL yok'}`);
        console.warn('Token bulunamadı. Yetki gerektiren bir endpoint için sorun olabilir.');
      }

      return config;
    } catch (error) {
      console.error('Token alınırken hata oluştu:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (debug) {
      console.log(`API Response: ${response.status} ${response.config.url || 'URL yok'}`);
      console.log('Response Data:', response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (debug) {
      // URL ve durum kodu değişkenlerine daha güvenli şekilde eriş
      const errorUrl = error.config?.url || 'URL yok';
      const errorStatus = error.response?.status || 'Durum kodu yok';

      console.error(`API Error: ${errorStatus} ${errorUrl}`);
      console.error('Error Details:', error.response?.data);
      console.error('Error Config:', error.config);

      // Daha detaylı hata analizi
      if (error.response?.status === 404) {
        console.error('404 Not Found hatası. URL:', error.config?.url || 'URL yok');
        console.error('Bu endpoint backend tarafında mevcut olmayabilir veya yanlış URL kullanılmış olabilir.');
        console.error('Postman koleksiyonunda doğru endpoint adresini kontrol edin!');
      }
    }

    // Hata tipine göre işlem yap
    if (error.response?.status === 401) {
      // Yetkisiz erişim - token geçersiz veya süresi dolmuş
      try {
        // Her iki token'ı da temizle
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);

        // Kullanıcıyı login sayfasına yönlendir
        window.location.href = '/auth/login';
      } catch (e) {
        console.error('Token silinemedi:', e);
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 403) {
      // Yetkisiz işlem - token doğru ama bu işlem için yetki yok
      console.error('Yetki hatası: Bu işlem için yetkiniz yok.');
    } else if (error.response?.status === 404) {
      // Kaynak bulunamadı
      console.error('Kaynak bulunamadı:', error.config?.url || 'URL yok');
    } else if (error.response?.status === 500) {
      // Sunucu hatası
      console.error('Sunucu hatası:', error.response?.data);
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