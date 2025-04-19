export type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed";
export type ReportType = "inappropriate_content" | "spam" | "harassment" | "other";

export interface SecurityReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  type: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SecurityStats {
  activeReports: number;
  bannedUsers: number;
  resolvedReports: number;
  pendingReports: number;
} 