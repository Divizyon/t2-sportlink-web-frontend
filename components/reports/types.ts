// Rapor işlemleri için tiplerini tanımlama
export interface ReportedUser {
  id: string;
  username: string;
  reportCount: number;
  lastReportDate: string;
  status: "active" | "blocked";
}

export interface ReportDetail {
  id: string;
  reporterId: string;
  reporterName: string;
  reportDate: string;
  reason: string;
  description: string;
  adminMessage?: string;
  reviewed?: boolean;
} 