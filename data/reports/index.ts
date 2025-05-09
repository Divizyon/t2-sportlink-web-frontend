import type { ReportStats } from "./types";

export const reportStats: ReportStats = {
  totalEvents: 156,
  totalParticipants: 2345,
  averageParticipation: 15,
  sportTypeStats: [
    {
      sportType: "Futbol",
      totalEvents: 45,
      totalParticipants: 1234,
      averageParticipation: 27,
    },
    {
      sportType: "Basketbol",
      totalEvents: 32,
      totalParticipants: 856,
      averageParticipation: 26,
    },
    {
      sportType: "Voleybol",
      totalEvents: 28,
      totalParticipants: 672,
      averageParticipation: 24,
    },
  ],
  recentEvents: [
    {
      id: "1",
      eventId: "1",
      totalParticipants: 32,
      averageParticipation: 32,
      satisfactionRate: 92,
      createdAt: "2024-04-15T10:00:00Z",
    },
    {
      id: "2",
      eventId: "2",
      totalParticipants: 20,
      averageParticipation: 20,
      satisfactionRate: 88,
      createdAt: "2024-04-12T15:00:00Z",
    },
  ],
}; 