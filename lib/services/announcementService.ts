import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { 
  Announcement, 
  AnnouncementListParams, 
  AnnouncementListResponse, 
  AnnouncementDetailResponse,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO
} from '@/interfaces/announcement';

/**
 * Duyuru servisi - duyurularla ilgili API operasyonları
 */
class AnnouncementService {
  private readonly BASE_PATH = '/api/announcements';

  /**
   * Tüm duyuruları sayfalayarak listeler
   */
  async getAnnouncements(
    page: number = 1, 
    limit: number = 10, 
    isPublished?: boolean
  ): Promise<AnnouncementListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      // Yayınlanma durumu filtresi
      if (isPublished !== undefined) {
        queryParams.append('isPublished', isPublished.toString());
      }
      
      const response = await api.get(`${this.BASE_PATH}?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Duyurular listelenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          pageSize: limit,
          totalPages: 0,
          totalCount: 0
        },
        message: apiError.message
      };
    }
  }

  /**
   * Duyuruları arama ve filtreleme
   */
  async searchAnnouncements(params: AnnouncementListParams): Promise<AnnouncementListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      // Yayınlanma durumu filtresi
      if (params.isPublished !== undefined) {
        queryParams.append('isPublished', params.isPublished.toString());
      }
      
      // Arama kelimesi
      if (params.keyword) {
        queryParams.append('keyword', params.keyword);
      }
      
      // Tarih aralığı
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      const response = await api.get(`${this.BASE_PATH}/search?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Duyurular aranırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 0,
          totalCount: 0
        },
        message: apiError.message
      };
    }
  }

  /**
   * Belirli bir duyurunun detaylarını getirir
   */
  async getAnnouncementById(id: string): Promise<AnnouncementDetailResponse> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Duyuru detayları alınırken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: {} as Announcement,
        message: apiError.message
      };
    }
  }

  /**
   * Duyuru oluşturur
   */
  async createAnnouncement(announcementData: CreateAnnouncementDTO): Promise<AnnouncementDetailResponse> {
    try {
      const response = await api.post(this.BASE_PATH, announcementData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Duyuru oluşturulurken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: {} as Announcement,
        message: apiError.message
      };
    }
  }

  /**
   * Var olan duyuruyu günceller
   */
  async updateAnnouncement(id: string, updateData: UpdateAnnouncementDTO): Promise<AnnouncementDetailResponse> {
    try {
      const response = await api.put(`${this.BASE_PATH}/${id}`, updateData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Duyuru güncellenirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        data: {} as Announcement,
        message: apiError.message
      };
    }
  }

  /**
   * Duyuruyu siler
   */
  async deleteAnnouncement(id: string): Promise<{success: boolean; message?: string}> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Duyuru silinirken hata:', error);
      const apiError = handleApiError(error as AxiosError);
      return {
        success: false,
        message: apiError.message
      };
    }
  }
}

const announcementService = new AnnouncementService();
export default announcementService;
export type { CreateAnnouncementDTO, UpdateAnnouncementDTO }; 