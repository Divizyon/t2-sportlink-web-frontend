import { type StateCreator } from 'zustand';
import reportService, { type ReportUpdateDTO, type CreateReportDTO } from '@/lib/services/reportService';
import type { ReportedUser, ReportDetail } from '@/components/reports/types';
import type { ApiError } from '@/lib/services/api';

export interface ReportState {
  // State
  reportedUsers: ReportedUser[];
  reportSelectedUser: ReportedUser | null;
  reportDetails: ReportDetail[];
  reportSelectedReport: ReportDetail | null;
  reportIsLoading: boolean;
  reportError: string | null;
  totalReportedUsers: number;
  reportCurrentPage: number;
  myReports: ReportDetail[];

  // Actions
  getReportedUsers: (page?: number, limit?: number) => Promise<void>;
  getReportDetailsForUser: (userId: string) => Promise<void>;
  setReportSelectedUser: (user: ReportedUser | null) => void;
  setReportSelectedReport: (report: ReportDetail | null) => void;
  updateReport: (reportId: string, data: ReportUpdateDTO) => Promise<ReportDetail>;
  removeReport: (reportId: string) => Promise<boolean>;
  blockUserFromReports: (userId: string, reason: string) => Promise<boolean>;
  searchReportedUsers: (searchTerm: string, status?: string) => Promise<void>;
  createReport: (data: CreateReportDTO) => Promise<boolean>;
  getMyReports: () => Promise<void>;
  getAllReports: (page?: number, limit?: number) => Promise<void>;
  getEventReports: (eventId: string) => Promise<void>;
  clearReportState: () => void;
}

const createReportSlice: StateCreator<ReportState> = (set, get) => {
  return {
    // Initial state
    reportedUsers: [],
    reportSelectedUser: null,
    reportDetails: [],
    reportSelectedReport: null,
    reportIsLoading: false,
    reportError: null,
    totalReportedUsers: 0,
    reportCurrentPage: 1,
    myReports: [],

    // Actions
    getReportedUsers: async (page = 1, limit = 10) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const response = await reportService.getReportedUsers(page, limit);
        set({ 
          reportedUsers: response.data, 
          totalReportedUsers: response.total,
          reportCurrentPage: response.page,
          reportIsLoading: false 
        });
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Raporlanan kullanıcılar alınamadı.', 
          reportIsLoading: false 
        });
      }
    },

    getReportDetailsForUser: async (userId: string) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const reportDetails = await reportService.getReportDetailsForUser(userId);
        set({ reportDetails, reportIsLoading: false });
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Rapor detayları alınamadı.', 
          reportIsLoading: false,
          reportDetails: []
        });
      }
    },

    getAllReports: async (page = 1, limit = 10) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const response = await reportService.getAllReports(page, limit);
        set({ 
          reportDetails: response.data,
          totalReportedUsers: response.total, 
          reportCurrentPage: response.page,
          reportIsLoading: false 
        });
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Raporlar alınamadı.', 
          reportIsLoading: false 
        });
      }
    },

    getEventReports: async (eventId: string) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const reports = await reportService.getEventReports(eventId);
        set({ 
          reportDetails: reports,
          reportIsLoading: false 
        });
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Etkinlik raporları alınamadı.', 
          reportIsLoading: false 
        });
      }
    },

    getMyReports: async () => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const reports = await reportService.getMyReports();
        set({ 
          myReports: reports,
          reportIsLoading: false 
        });
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Raporlarınız alınamadı.', 
          reportIsLoading: false 
        });
      }
    },

    createReport: async (data: CreateReportDTO) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        await reportService.createReport(data);
        set({ reportIsLoading: false });
        return true;
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Rapor oluşturulamadı.', 
          reportIsLoading: false 
        });
        return false;
      }
    },

    setReportSelectedUser: (user: ReportedUser | null) => {
      set({ reportSelectedUser: user });
      
      // If user is selected, fetch report details
      if (user) {
        get().getReportDetailsForUser(user.id);
      } else {
        set({ reportDetails: [] });
      }
    },

    setReportSelectedReport: (report: ReportDetail | null) => {
      set({ reportSelectedReport: report });
    },

    updateReport: async (reportId: string, data: ReportUpdateDTO) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const updatedReport = await reportService.updateReport(reportId, data);
        
        // Update reportDetails state with the updated report
        const currentReportDetails = get().reportDetails;
        const updatedReportDetails = currentReportDetails.map(report => 
          report.id === reportId ? updatedReport : report
        );
        
        set({ 
          reportDetails: updatedReportDetails,
          reportIsLoading: false
        });
        
        return updatedReport;
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Rapor güncellenemedi.', 
          reportIsLoading: false 
        });
        throw error;
      }
    },

    removeReport: async (reportId: string) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        await reportService.removeReport(reportId);
        
        // Update reportDetails state by removing the deleted report
        const updatedReportDetails = get().reportDetails.filter(report => report.id !== reportId);
        
        // If there are no more reports for a user, update the reportedUsers state
        if (updatedReportDetails.length === 0 && get().reportSelectedUser) {
          const updatedUsers = get().reportedUsers.filter(
            user => user.id !== get().reportSelectedUser?.id
          );
          
          set({ 
            reportedUsers: updatedUsers,
            reportSelectedUser: null
          });
        }
        
        set({ 
          reportDetails: updatedReportDetails,
          reportIsLoading: false
        });
        
        return true;
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Rapor kaldırılamadı.', 
          reportIsLoading: false 
        });
        return false;
      }
    },

    blockUserFromReports: async (userId: string, reason: string) => {
      set({ reportIsLoading: true, reportError: null });
      try {
        await reportService.blockUser(userId, reason);
        
        // Update the user status in the list
        const updatedUsers = get().reportedUsers.map(user => 
          user.id === userId ? { ...user, status: "blocked" as const } : user
        );
        
        set({ 
          reportedUsers: updatedUsers,
          reportIsLoading: false
        });
        
        return true;
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Kullanıcı engellenemedi.', 
          reportIsLoading: false 
        });
        return false;
      }
    },

    searchReportedUsers: async (searchTerm: string, status = 'all') => {
      set({ reportIsLoading: true, reportError: null });
      try {
        const users = await reportService.searchReportedUsers(searchTerm, status);
        set({ 
          reportedUsers: users,
          reportIsLoading: false
        });
      } catch (error) {
        const apiError = error as ApiError;
        set({ 
          reportError: apiError.message || 'Arama yapılamadı.', 
          reportIsLoading: false 
        });
      }
    },

    clearReportState: () => {
      set({
        reportedUsers: [],
        reportSelectedUser: null,
        reportDetails: [],
        reportSelectedReport: null,
        reportError: null,
        myReports: []
      });
    }
  };
};

export default createReportSlice; 