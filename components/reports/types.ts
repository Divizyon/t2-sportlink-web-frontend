// Rapor işlemleri için tiplerini tanımlama
export interface ReportedUser {
  id: string;
  username: string;
  reportCount: number;
  lastReportDate: string;
  status: "active" | "blocked";
  latestReportId?: string;
  avatar?: string; // User avatar URL
  fullName?: string; // User's full name
  reporter_id?: string | undefined; // ID of the user who reported
  reporter_username?: string | undefined; // Username of the reporter
}

export interface ReportDetail {
  id: string;
  reporter_id: string;
  reporter_name: string | undefined;
  reporter_username?: string | undefined; // Username of the reporter
  reported_id: string;
  reported_name: string | undefined;
  reported_username?: string | undefined; // Username of the reported user
  event_id: string | undefined;
  event_name: string | undefined;
  report_reason: string;
  description: string | undefined;
  report_date: string;
  status: string;
  admin_notes: string | null;
  // Eski alanlar geriye uyumluluk için kalıyor
  reporterId?: string;
  reporterName?: string;
  reportedId?: string;
  reportedName?: string;
  reportDate?: string;
  reason?: string;
  adminMessage?: string;
  reviewed?: boolean;
  reviewerAdmin?: string;
}

export interface UserProfileCardProps {
  userId: string;
  username: string;
  fullName?: string | undefined;
  avatar?: string | undefined;
  onClose?: () => void;
} 