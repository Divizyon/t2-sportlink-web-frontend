export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

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
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
} 