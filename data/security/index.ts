import type { SecurityReport, SecurityStats } from "./types";

export const securityReports: SecurityReport[] = [
  {
    id: "1",
    reporterId: "1",
    reportedUserId: "4",
    type: "inappropriate_content",
    description: "Kullanıcı uygunsuz içerik paylaştı",
    status: "investigating",
    createdAt: "2024-04-10T09:00:00Z",
    updatedAt: "2024-04-19T14:30:00Z",
  },
  {
    id: "2",
    reporterId: "2",
    reportedUserId: "3",
    type: "spam",
    description: "Kullanıcı spam mesajlar gönderiyor",
    status: "resolved",
    createdAt: "2024-04-09T11:30:00Z",
    updatedAt: "2024-04-10T15:45:00Z",
    resolvedAt: "2024-04-10T15:45:00Z",
    resolvedBy: "1",
  },
  {
    id: "3",
    reporterId: "3",
    reportedUserId: "2",
    type: "harassment",
    description: "Kullanıcı taciz edici mesajlar gönderiyor",
    status: "pending",
    createdAt: "2024-04-19T10:15:00Z",
    updatedAt: "2024-04-19T10:15:00Z",
  },
];

export const securityStats: SecurityStats = {
  activeReports: 12,
  bannedUsers: 5,
  resolvedReports: 45,
  pendingReports: 8,
}; 