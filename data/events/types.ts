export type EventStatus = "active" | "passive" | "pending" | "canceled" | "completed";

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: EventStatus;
  sportType: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
} 