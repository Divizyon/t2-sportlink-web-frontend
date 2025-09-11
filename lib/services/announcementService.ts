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
  private readonly BASE_PATH = '/announcements';

  /**
   * Tüm duyuruları sayfalayarak listeler
   * @param page Sayfa numarası
   * @param limit Sayfa başına kayıt sayısı
   * @param includeUnpublished Yayınlanmamış duyuruları göster (admin için)
   */
  async getAnnouncements(
    page: number = 1, 
    limit: number = 10, 
    includeUnpublished?: boolean
  ): Promise<AnnouncementListResponse> {
    // Debug için her istekte stack trace bilgisini logla
    console.log(
      `getAnnouncements ÇAĞRILDI - page: ${page}, limit: ${limit}, includeUnpublished: ${includeUnpublished}`,
      new Error().stack
    );
    
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      // Yayınlanmamış duyuruları gösterme (admin için)
      if (includeUnpublished !== undefined) {
        queryParams.append('includeUnpublished', includeUnpublished.toString());
      }
      
      const response = await api.get(`${this.BASE_PATH}?${queryParams.toString()}`);
      
      console.log("API duyuru yanıtı:", response.data);
      
      // Yeni API yanıt formatını işleme:
      // {
      //   success: true,
      //   data: {
      //     announcements: [...],
      //     pagination: { page, limit, total, totalPages }
      //   }
      // }
      
      // Duyuru verisini çıkarma
      let announcements: Announcement[] = [];
      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          announcements = response.data.data;
        } else if (Array.isArray(response.data.data.announcements)) {
          announcements = response.data.data.announcements;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          announcements = response.data.data.data;
        }
      } else if (Array.isArray(response.data)) {
        announcements = response.data;
      }
      
      // Pagination bilgisini çıkarma
      let paginationData = {
        page: page,
        pageSize: limit,
        totalPages: 1,
        totalCount: announcements.length
      };
      
      if (response.data.data && response.data.data.pagination) {
        paginationData = {
          page: response.data.data.pagination.page || page,
          pageSize: response.data.data.pagination.limit || limit,
          totalPages: response.data.data.pagination.totalPages || 1,
          totalCount: response.data.data.pagination.total || announcements.length
        };
      } else if (response.data.pagination) {
        paginationData = {
          page: response.data.pagination.page || page,
          pageSize: response.data.pagination.limit || response.data.pagination.pageSize || limit,
          totalPages: response.data.pagination.totalPages || 1,
          totalCount: response.data.pagination.total || response.data.pagination.totalCount || announcements.length
        };
      }
      
      console.log("İşlenmiş duyurular:", announcements);
      console.log("İşlenmiş sayfalama:", paginationData);
      
      return {
        success: true,
        data: announcements,
        pagination: paginationData
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
   * @param params Arama ve filtreleme parametreleri
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
      
      // Arama kelimesi
      if (params.keyword) {
        queryParams.append('keyword', params.keyword);
      }
      
      // Durum filtresi
      if (params.status) {
        queryParams.append('status', params.status);
      }
      
      // Tarih aralığı
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      // Yayınlanmamış olanları dahil et
      if (params.includeUnpublished !== undefined) {
        queryParams.append('includeUnpublished', params.includeUnpublished.toString());
      }
      
      // Diğer filtreler
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
      }
      
      if (params.authorId) {
        queryParams.append('authorId', params.authorId);
      }
      
      const response = await api.get(`${this.BASE_PATH}/search?${queryParams.toString()}`);
      
      console.log("API arama yanıtı:", response.data);
      
      // Backend yanıt formatını doğru şekilde işle - arama sonuçları
      const announcements = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response.data.data) 
           ? response.data.data 
           : (response.data.data?.announcements || []));
      
      const pagination = response.data.pagination || 
        (response.data.data?.pagination ? response.data.data.pagination : {
          page: params.page || 1,
          pageSize: params.limit || 10,
          totalPages: Math.ceil((announcements?.length || 0) / (params.limit || 10)), 
          totalCount: announcements?.length || 0
        });
      
      return {
        success: true,
        data: announcements,
        pagination: {
          page: pagination.page || params.page || 1,
          pageSize: pagination.pageSize || pagination.limit || params.limit || 10,
          totalPages: pagination.totalPages || pagination.pages || 1,
          totalCount: pagination.totalCount || pagination.total || 0
        }
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
   * @param id Duyuru ID'si
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
   * @param announcementData Yeni duyuru verileri
   */
  async createAnnouncement(announcementData: CreateAnnouncementDTO): Promise<AnnouncementDetailResponse> {
    try {
      console.log("Duyuru oluşturma verisi:", announcementData);
      
      // Status alanından önbellek kontrolü
      let statusToSend = announcementData.status;
      
      // Backend'in beklediği formatta veri gönder
      const requestData = {
        ...announcementData,
        status: statusToSend
      };
      
      console.log("API'ye gönderilen veri:", requestData);
      
      const response = await api.post(this.BASE_PATH, requestData);
      
      console.log("Duyuru oluşturma API yanıtı:", response.data);
      
      // Başarılı olma durumunu kontrol et
      const success = response.status >= 200 && response.status < 300;
      
      return {
        success: success,
        data: response.data?.data || response.data,
        message: success ? "Duyuru başarıyla oluşturuldu" : "Duyuru oluşturulurken bir sorun oluştu"
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
   * @param id Duyuru ID'si 
   * @param updateData Güncellenecek veriler
   */
  async updateAnnouncement(id: string, updateData: UpdateAnnouncementDTO): Promise<AnnouncementDetailResponse> {
    try {
      // Debug için detaylı log
      console.log(`%c Duyuru güncelleme başladı - ID: ${id}`, 'background: #f0f0f0; color: #0000ff; font-weight: bold;');
      console.log("Gönderilecek veri:", JSON.stringify(updateData, null, 2));
      
      // Veri kontrolü
      if (!id || id.trim() === '') {
        throw new Error('Geçersiz duyuru ID');
      }
      
      // Status değerini kontrol et ve normalleştir
      let normalizedData = { ...updateData };
      
      // API isteği için tam URL logla
      const fullEndpoint = `${this.BASE_PATH}/${id}`;
      console.log(`PUT isteği gönderiliyor: ${fullEndpoint}`);
      
      // API isteği gönderiliyor
      const response = await api.put(fullEndpoint, normalizedData);
      
      console.log("Duyuru güncelleme API yanıtı:", response.data);
      
      // Başarılı olma durumunu kontrol et
      const success = response.status >= 200 && response.status < 300;
      
      return {
        success: success,
        data: response.data?.data || response.data,
        message: response.data?.message || (success ? 'Duyuru başarıyla güncellendi' : 'Duyuru güncellenirken bir hata oluştu')
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
   * @param id Duyuru ID'si
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