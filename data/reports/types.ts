export interface EventReport {
  id: string;
  eventId: string;
  totalParticipants: number;
  averageParticipation: number;
  satisfactionRate: number;
  createdAt: string;
}

export interface SportTypeStats {
  sportType: string;
  totalEvents: number;
  totalParticipants: number;
  averageParticipation: number;
}

export interface ReportStats {
  totalEvents: number;
  totalParticipants: number;
  averageParticipation: number;
  sportTypeStats: SportTypeStats[];
  recentEvents: EventReport[];
} 