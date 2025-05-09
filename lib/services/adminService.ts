import api, { handleApiError } from './api';
import type { ApiError } from './api';
import type { AxiosError } from 'axios';

// Debug modu - Sadece development için
const debug = process.env.NODE_ENV === 'development';

// User tiplemeleri
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
  profile_picture?: string;
}

export interface UpdateRoleData {
  role: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

// SuperAdmin servisleri için tipler
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  profile_picture?: string;
}

export interface AdminCreateData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface RoleCheckResponse {
  success: boolean;
  data: {
    isSuperAdmin: boolean;
    userRole: string;
  };
}

export interface AdminListResponse {
  success: boolean;
  data: {
    admins: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Admin servisi sınıfı
class AdminService {
  private readonly BASE_PATH = '/users/admin';

  // Tüm kullanıcıları listele
  async listAllUsers(params?: PaginationParams & { query?: string, searchField?: string }): Promise<UsersListResponse> {
    try {
      if (debug) {
        console.log("AdminService: Kullanıcılar listesi alınıyor", params);
        // Kontrolü burada yapalım: Token var mı?
        const token = localStorage.getItem('token');
        console.log("Token durumu:", !!token);
        if (token) {
          console.log("Token önizleme:", token.substring(0, 15) + "...");

          // Kullanıcı rolü kontrolü
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const userData = JSON.parse(userStr);
              console.log("Mevcut kullanıcı rolü:", userData.role);
            } catch (e) {
              console.error("Kullanıcı bilgisi parse edilemedi");
            }
          }
        }
      }

      // API isteği ayarlarını görmek için config oluşturalım
      const config = {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (debug) {
        console.log("API isteği config:", {
          url: `${this.BASE_PATH}`,
          params: config.params,
          headers: {
            Authorization: config.headers.Authorization ?
              `Bearer ${config.headers.Authorization.substring(7, 22)}...` : 'Yok'
          }
        });
      }

      const response = await api.get<UsersListResponse>(`${this.BASE_PATH}`, config);

      if (debug) {
        console.log("AdminService: Kullanıcı listesi alındı", response.data);
      }

      return response.data;
    } catch (error) {
      if (debug) {
        console.error("AdminService: Kullanıcılar listelenirken hata:", error);
        // Hata detaylarını görelim
        if ((error as AxiosError).response) {
          console.error("Hata detayları:", (error as AxiosError).response?.data);
          console.error("Hata durumu:", (error as AxiosError).response?.status);
          console.error("Hata başlıkları:", (error as AxiosError).response?.headers);
        } else {
          console.error("Hata detayları yok, istek yapılamadı");
        }
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Tek kullanıcı detaylarını getir
  async getUserDetails(userId: string): Promise<{ success: boolean; data: AdminUser }> {
    try {
      if (debug) {
        console.log("AdminService: Kullanıcı detayları alınıyor", userId);
      }

      const response = await api.get<{ success: boolean; data: AdminUser }>(`${this.BASE_PATH}/${userId}`);

      if (debug) {
        console.log("AdminService: Kullanıcı detayları alındı", response.data);
      }

      return response.data;
    } catch (error) {
      if (debug) {
        console.error("AdminService: Kullanıcı detayları alınırken hata:", error);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Kullanıcı rolünü güncelle
  async updateUserRole(userId: string, data: UpdateRoleData): Promise<{ success: boolean; message: string; data: AdminUser }> {
    try {
      if (debug) {
        console.log("AdminService: Kullanıcı rolü güncelleniyor", userId, data);
      }

      const response = await api.patch<{ success: boolean; message: string; data: AdminUser }>(`${this.BASE_PATH}/${userId}/role`, data);

      if (debug) {
        console.log("AdminService: Kullanıcı rolü güncellendi", response.data);
      }

      return response.data;
    } catch (error) {
      if (debug) {
        console.error("AdminService: Kullanıcı rolü güncellenirken hata:", error);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Yeni kullanıcı oluştur
  async createUser(data: CreateUserData): Promise<{ success: boolean; message: string; data: AdminUser }> {
    try {
      if (debug) {
        console.log("AdminService: Yeni kullanıcı oluşturuluyor", data);
      }

      const response = await api.post<{ success: boolean; message: string; data: AdminUser }>(`${this.BASE_PATH}`, data);

      if (debug) {
        console.log("AdminService: Yeni kullanıcı oluşturuldu", response.data);
      }

      return response.data;
    } catch (error) {
      if (debug) {
        console.error("AdminService: Kullanıcı oluşturulurken hata:", error);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Kullanıcı sil
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (debug) {
        console.log("AdminService: Kullanıcı siliniyor", userId);
      }

      const response = await api.delete<{ success: boolean; message: string }>(`${this.BASE_PATH}/${userId}`);

      if (debug) {
        console.log("AdminService: Kullanıcı silindi", response.data);
      }

      return response.data;
    } catch (error) {
      if (debug) {
        console.error("AdminService: Kullanıcı silinirken hata:", error);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
}

const superAdminService = {
  /**
   * Kullanıcının superadmin olup olmadığını kontrol eder
   */
  async checkSuperAdminStatus(): Promise<RoleCheckResponse> {
    const response = await api.get<RoleCheckResponse>('/superadmin/check-status');
    return response.data;
  },

  /**
   * Admin kullanıcılarını listeler
   */
  async getAdminsList(page: number = 1, limit: number = 10, filter?: string): Promise<AdminListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filter) {
      queryParams.append('q', filter);
    }

    const response = await api.get<AdminListResponse>(`/superadmin/admins?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Yeni bir admin kullanıcısı oluşturur
   */
  async createAdmin(data: AdminCreateData) {
    const response = await api.post('/superadmin/admins', data);
    return response.data;
  },

  /**
   * Admin kullanıcısını devre dışı bırakır
   */
  async deactivateAdmin(adminId: string) {
    const response = await api.put(`/superadmin/admins/${adminId}/deactivate`);
    return response.data;
  },

  /**
   * Dashboard özet bilgilerini alır
   */
  async getDashboardInfo() {
    const response = await api.get('/superadmin/dashboard');
    return response.data;
  }
};

export const adminService = new AdminService();
export default { ...adminService, ...superAdminService }; 