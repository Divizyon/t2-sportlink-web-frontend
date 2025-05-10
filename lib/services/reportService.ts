import api, { handleApiError } from './api';
import type { AxiosError } from 'axios';
import type { ApiError } from './api';
import type { ReportedUser, ReportDetail } from '@/components/reports/types';

// Debug mode for development - otomatik olarak false olacak şekilde ayarlıyoruz
// Geliştirme sırasında true, prodüksiyonda false olmalı
const debug = false; // Mock veri kullanılsın mı? false = gerçek API kullan

// API Konfigürasyonu
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  reportsEndpoint: '/reports'
};

console.log(`ReportService: ${debug ? 'MOCK MOD (Test verileri)' : 'GERÇEK API MODU'} aktif`);

// Report service interface
export interface ReportUpdateDTO {
  admin_notes?: string | null;
  status?: string;
}

export interface CreateReportDTO {
  reported_id: string;
  event_id?: string;
  report_reason: string;
}

// Mock veriler - geliştirme aşamasında kullanılacak
const mockReports: ReportDetail[] = [
  {
    id: "report1",
    reporter_id: "user1",
    reporter_name: "Ahmet Yılmaz",
    reported_id: "user2",
    reported_name: "Mehmet Demir",
    event_id: undefined,
    event_name: undefined,
    report_date: new Date().toISOString(),
    report_reason: "Uygunsuz davranış",
    description: "Etkinlikte kaba davrandı",
    status: "pending",
    admin_notes: null
  },
  {
    id: "report2",
    reporter_id: "user3",
    reporter_name: "Ayşe Kaya",
    reported_id: "user2",
    reported_name: "Mehmet Demir",
    event_id: undefined,
    event_name: undefined,
    report_date: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
    report_reason: "Hakaret",
    description: "Mesajlarda uygunsuz ifadeler kullandı",
    status: "reviewed",
    admin_notes: "Kullanıcı uyarıldı"
  },
  {
    id: "report3",
    reporter_id: "user4",
    reporter_name: "Zeynep Yıldız",
    reported_id: "user5",
    reported_name: "Can Öztürk",
    event_id: "event1",
    event_name: "Futbol Maçı",
    report_date: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
    report_reason: "Etkinliğe gelmedi",
    description: "Katılım sağlamadı ama iptal de etmedi",
    status: "pending",
    admin_notes: null
  }
];

// Önişleme fonksiyonu - API'den gelen ve eski formattaki alanları yeni formata dönüştürür
const preprocessReport = (report: any): ReportDetail => {
  if (!report) {
    // Varsayılan boş rapor
    return {
      id: "unknown",
      reporter_id: "unknown",
      reporter_name: undefined,
      reporter_username: undefined,
      reported_id: "unknown",
      reported_name: undefined,
      reported_username: undefined,
      event_id: undefined,
      event_name: undefined,
      report_date: new Date().toISOString(),
      report_reason: "Unknown",
      description: undefined,
      status: "pending",
      admin_notes: null
    };
  }

  // Raporlayan kullanıcı adı belirleme için öncelik sırası
  // 1. Doğrudan reporter_username alanı varsa kullan
  let reporterUsername = report.reporter_username;

  // 2. Eski format reporterName alanı varsa kullan
  if (!reporterUsername && report.reporterName) {
    reporterUsername = report.reporterName;
  }

  // 3. Reporter_name alanından kullanıcı adı çıkarmayı dene (email veya tam isim olabilir)
  if (!reporterUsername && report.reporter_name) {
    reporterUsername = extractUsernameFromEmail(report.reporter_name);
  }

  // Raporlanan kullanıcı adı belirleme için benzer öncelik sırası
  // 1. Doğrudan reported_username alanı varsa kullan
  let reportedUsername = report.reported_username;

  // 2. Eski format reportedName alanı varsa kullan
  if (!reportedUsername && report.reportedName) {
    reportedUsername = report.reportedName;
  }

  // 3. Reported_name alanından kullanıcı adı çıkarmayı dene
  if (!reportedUsername && report.reported_name) {
    reportedUsername = extractUsernameFromEmail(report.reported_name);
  }

  // Yeni format değerler varsa, onları kullanarak döndür
  if (report.reporter_id && report.reported_id) {
    // Eksik alanları doldur
    return {
      id: report.id || "unknown",
      reporter_id: report.reporter_id,
      reporter_name: report.reporter_name,
      reporter_username: reporterUsername,
      reported_id: report.reported_id,
      reported_name: report.reported_name,
      reported_username: reportedUsername,
      event_id: report.event_id,
      event_name: report.event_name,
      report_date: report.report_date || new Date().toISOString(),
      report_reason: report.report_reason || "Unknown",
      description: report.description,
      status: report.status || "pending",
      admin_notes: report.admin_notes !== undefined ? report.admin_notes : null
    };
  }

  // Eski format değerler varsa, onları yeni formata çevirerek döndür
  if (report.reporterId && report.reportedId) {
    return {
      id: report.id || "unknown",
      reporter_id: report.reporterId,
      reporter_name: report.reporterName,
      reporter_username: reporterUsername,
      reported_id: report.reportedId,
      reported_name: report.reportedName,
      reported_username: reportedUsername,
      event_id: undefined,
      event_name: undefined,
      report_date: report.reportDate || new Date().toISOString(),
      report_reason: report.reason || "Unknown",
      description: report.description,
      status: report.reviewed ? "reviewed" : "pending",
      admin_notes: report.adminMessage !== undefined ? report.adminMessage : null,
      // Eski alanları koru
      reporterId: report.reporterId,
      reporterName: report.reporterName,
      reportedId: report.reportedId,
      reportedName: report.reportedName,
      reportDate: report.reportDate,
      reason: report.reason,
      adminMessage: report.adminMessage,
      reviewed: report.reviewed,
      reviewerAdmin: report.reviewerAdmin
    };
  }

  // Format tanınamıyorsa, tüm olası alanları kullanarak en iyi çıkarımı yap
  return {
    id: report.id || "unknown",
    reporter_id: report.reporter_id || report.reporterId || "unknown",
    reporter_name: report.reporter_name || report.reporterName,
    reporter_username: reporterUsername,
    reported_id: report.reported_id || report.reportedId || "unknown",
    reported_name: report.reported_name || report.reportedName,
    reported_username: reportedUsername,
    event_id: report.event_id,
    event_name: report.event_name,
    report_date: report.report_date || report.reportDate || new Date().toISOString(),
    report_reason: report.report_reason || report.reason || "Unknown",
    description: report.description,
    status: report.status || (report.reviewed ? "reviewed" : "pending"),
    admin_notes: report.admin_notes !== undefined ? report.admin_notes : report.adminMessage
  };
};

// Helper function to extract username from email or name
const extractUsernameFromEmail = (emailOrName?: string): string | undefined => {
  if (!emailOrName) return undefined;

  // If it's an empty string, return undefined
  if (emailOrName.trim() === '') return undefined;

  // If it looks like an email, extract the part before @
  if (emailOrName.includes('@')) {
    const username = emailOrName.split('@')[0];
    // Eğer kullanıcı adı boş değilse dön
    if (username && username.trim() !== '') {
      return username.trim();
    }
  }

  // If name contains spaces (likely a full name), return the first part
  if (emailOrName.includes(' ')) {
    const firstName = emailOrName.split(' ')[0];
    if (firstName && firstName.trim() !== '') {
      return firstName.trim();
    }
  }

  // Otherwise just return the name as username
  return emailOrName.trim();
};

// Helper function to transform report details to reported users
const transformReportsToUsers = (reports: ReportDetail[]): ReportedUser[] => {
  // Create a map to track unique users and their reports
  const userMap = new Map<string, ReportedUser>();

  reports.forEach(report => {
    // Burada raporlanan kişinin ID'sini ve ismini kullanıyoruz, raporu oluşturan değil
    const userId = report.reported_id || report.reportedId || "unknown";

    // Kullanıcı adını belirlerken öncelik sırasını belirliyoruz
    let username: string | undefined;

    // Öncelik sırası:
    // 1. Düz reported_username (API'den doğrudan gelen)
    if (report.reported_username) {
      username = report.reported_username;
    }
    // 2. Eski format reportedName (yeni API'ye uyumlu değil)
    else if (report.reportedName) {
      username = report.reportedName;
    }
    // 3. Reported_name'den kullanıcı adı çıkarma (email veya tam isimden)
    else if (report.reported_name) {
      username = extractUsernameFromEmail(report.reported_name);
    }

    // Eğer hiçbir kullanıcı adı bulunamadıysa "Kullanıcı-ID" formatında bir ad oluştur
    if (!username || username.trim() === '') {
      username = `Kullanıcı-${userId.substring(0, 5)}`;
    }

    if (userMap.has(userId)) {
      // Update existing user data
      const user = userMap.get(userId)!;
      user.reportCount += 1;

      // Update last report date if this report is newer
      const reportDate = new Date(report.report_date || report.reportDate || new Date().toISOString());
      const lastReportDate = new Date(user.lastReportDate);

      if (reportDate > lastReportDate) {
        user.lastReportDate = report.report_date || report.reportDate || new Date().toISOString();
        user.latestReportId = report.id;

        // Update reporter info if available
        if (report.reporter_id) user.reporter_id = report.reporter_id;

        // Raporlayanın kullanıcı adı için öncelik sıralaması
        if (report.reporter_username) {
          user.reporter_username = report.reporter_username;
        } else if (report.reporterName) {
          user.reporter_username = report.reporterName;
        } else if (report.reporter_name) {
          user.reporter_username = extractUsernameFromEmail(report.reporter_name);
        }
      }
    } else {
      // Raporlayanın kullanıcı adını belirle - öncelik sıralaması
      let reporterUsername: string | undefined;

      if (report.reporter_username) {
        reporterUsername = report.reporter_username;
      } else if (report.reporterName) {
        reporterUsername = report.reporterName;
      } else if (report.reporter_name) {
        reporterUsername = extractUsernameFromEmail(report.reporter_name);
      }

      // Create new user entry
      userMap.set(userId, {
        id: userId,
        username: username,
        reportCount: 1,
        lastReportDate: report.report_date || report.reportDate || new Date().toISOString(),
        status: "active", // Default status
        latestReportId: report.id,
        reporter_id: report.reporter_id || report.reporterId || undefined,
        reporter_username: reporterUsername
      });
    }
  });

  // Convert map to array
  return Array.from(userMap.values());
};

// Report service class
class ReportService {
  private readonly BASE_PATH = API_CONFIG.reportsEndpoint;

  // Verilen response'dan veri ve metadata çıkarımı yapar
  private extractResponseData<T>(response: any): { data: T[], total: number, page: number, limit: number } {
    if (!response) {
      return { data: [] as T[], total: 0, page: 1, limit: 10 };
    }

    if (Array.isArray(response)) {
      // Doğrudan dizi
      return {
        data: response as T[],
        total: response.length,
        page: 1,
        limit: response.length
      };
    }

    if (response.data && Array.isArray(response.data)) {
      // data property içinde dizi
      return {
        data: response.data as T[],
        total: response.total || response.data.length,
        page: response.page || 1,
        limit: response.limit || 10
      };
    }

    // Hiçbiri değilse boş sonuç döndür
    return { data: [] as T[], total: 0, page: 1, limit: 10 };
  }

  // Raporları önişler
  private preprocessReports(reports: any[]): ReportDetail[] {
    return reports.map(report => preprocessReport(report));
  }

  // Create a new report
  async createReport(data: CreateReportDTO): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      console.error("Create report error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (createReport)");
        return { success: true, message: "Rapor oluşturuldu (mock veri)" };
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get all reports
  async getAllReports(page: number = 1, limit: number = 10): Promise<{
    data: ReportDetail[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await api.get(this.BASE_PATH, {
        params: { page, limit }
      });

      const extractedData = this.extractResponseData<any>(response.data);
      const processedReports = this.preprocessReports(extractedData.data);

      console.log("🟢 API yanıtı başarıyla alındı (getAllReports)", processedReports.length);

      return {
        data: processedReports,
        total: extractedData.total,
        page: extractedData.page,
        limit: extractedData.limit
      };
    } catch (error) {
      console.error("Get all reports error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (getAllReports)");
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedReports = mockReports.slice(start, end);

        return {
          data: paginatedReports,
          total: mockReports.length,
          page: page,
          limit: limit
        };
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get reports for a specific event
  async getEventReports(eventId: string): Promise<ReportDetail[]> {
    try {
      const response = await api.get(`${this.BASE_PATH}/events/${eventId}`);
      const extractedData = this.extractResponseData<any>(response.data);
      return this.preprocessReports(extractedData.data);
    } catch (error) {
      console.error("Get event reports error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (getEventReports)");
        return mockReports.filter(r => r.event_id === eventId);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get reports about a specific user
  async getUserReports(userId: string): Promise<ReportDetail[]> {
    try {
      const response = await api.get(`${this.BASE_PATH}/users/${userId}`);
      const extractedData = this.extractResponseData<any>(response.data);
      return this.preprocessReports(extractedData.data);
    } catch (error) {
      console.error("Get user reports error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (getUserReports)");
        return mockReports.filter(r => r.reported_id === userId);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get my reports (created by current user)
  async getMyReports(): Promise<ReportDetail[]> {
    try {
      const response = await api.get(`${this.BASE_PATH}/my`);
      const extractedData = this.extractResponseData<any>(response.data);
      return this.preprocessReports(extractedData.data);
    } catch (error) {
      console.error("Get my reports error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (getMyReports)");
        return mockReports.slice(0, 1);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Update report status
  async updateReportStatus(reportId: string, data: ReportUpdateDTO): Promise<ReportDetail> {
    try {
      // Use standard PUT endpoint for updating a resource
      const response = await api.put(`${this.BASE_PATH}/${reportId}`, data);
      return preprocessReport(response.data.data || response.data);
    } catch (error) {
      console.error("Update report status error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (updateReportStatus)");
        // Return updated mock data for development
        const mockReport = mockReports.find(r => r.id === reportId);
        if (mockReport) {
          return {
            ...mockReport,
            admin_notes: data.admin_notes !== undefined ? data.admin_notes : mockReport.admin_notes,
            status: data.status || mockReport.status
          };
        }
        throw new Error("Rapor bulunamadı");
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get reported users (derived from all reports)
  async getReportedUsers(page: number = 1, limit: number = 10): Promise<{
    data: ReportedUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Use the standard reports endpoint
      const reportsResponse = await this.getAllReports(page, limit);

      // Transform the report data into ReportedUser format
      const reportedUsers = transformReportsToUsers(reportsResponse.data);

      return {
        data: reportedUsers,
        total: reportedUsers.length, // This is not accurate for total across all pages
        page: reportsResponse.page,
        limit: reportsResponse.limit
      };
    } catch (error) {
      console.error("Get reported users error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (getReportedUsers)");
        // Generate mock reported users directly
        const mockUsers = transformReportsToUsers(mockReports);
        const start = (page - 1) * limit;
        const end = start + limit;

        return {
          data: mockUsers.slice(start, end),
          total: mockUsers.length,
          page: page,
          limit: limit
        };
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Get report details for a user
  async getReportDetailsForUser(userId: string): Promise<ReportDetail[]> {
    try {
      // Using the existing endpoint for user reports
      return this.getUserReports(userId);
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Update report (admin note, review status)
  async updateReport(reportId: string, data: any): Promise<ReportDetail> {
    try {
      // Eski formattan yeni formata dönüştür
      const updateData: ReportUpdateDTO = {
        admin_notes: data.adminMessage,
        status: data.reviewed ? "reviewed" : "pending"
      };

      return this.updateReportStatus(reportId, updateData);
    } catch (error) {
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Remove report (admin action)
  async removeReport(reportId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.BASE_PATH}/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Remove report error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (removeReport)");
        return { success: true, message: "Rapor silindi (mock veri)" };
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Block user (admin action)
  async blockUser(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      // This endpoint may also need to be verified with backend
      const response = await api.post(`/api/users/${userId}/block`, { reason });
      return response.data;
    } catch (error) {
      console.error("Block user error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (blockUser)");
        return { success: true, message: "Kullanıcı engellendi (mock veri)" };
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }

  // Search reported users (using standard reports endpoint)
  async searchReportedUsers(searchTerm: string, status: string = 'all'): Promise<ReportedUser[]> {
    try {
      // Use the standard reports endpoint with search parameters
      const response = await api.get(this.BASE_PATH, {
        params: { search: searchTerm, status: status !== 'all' ? status : undefined }
      });

      const extractedData = this.extractResponseData<any>(response.data);
      const processedReports = this.preprocessReports(extractedData.data);

      // Transform the results to match ReportedUser format
      const reportedUsers = transformReportsToUsers(processedReports);

      return reportedUsers;
    } catch (error) {
      console.error("Search reported users error:", error);

      // Debug modunda mock veri dön, değilse hatayı fırlat
      if (debug) {
        console.info("🔵 Mock veri kullanılıyor (searchReportedUsers)");
        // Filter mock data based on search term
        let filteredReports = mockReports;

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredReports = mockReports.filter(r =>
            r.reported_name?.toLowerCase().includes(searchLower) ||
            r.report_reason.toLowerCase().includes(searchLower)
          );
        }

        if (status !== 'all') {
          // Bu örnek için tüm raporlar aktif varsayılıyor
          // Gerçek bir uygulamada status değerine göre filtreleme yapılırdı
        }

        return transformReportsToUsers(filteredReports);
      }
      throw handleApiError(error as AxiosError<ApiError>);
    }
  }
}

const reportService = new ReportService();
export default reportService; 