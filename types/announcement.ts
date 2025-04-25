export type AnnouncementStatus = "Aktif" | "Pasif" | "Taslak" | "Onay Bekliyor";

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  startDate: string | null;
  endDate: string | null;
  creatorId: string | null;
  createdAt: string;
  updatedAt: string;
  status: AnnouncementStatus;
  date: string;
  author: string;
  views: number;
  image?: string | null;
  sourceUrl?: string | null;
  category?: string;
  visibility?: "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler";
}

export interface AnnouncementDisplay extends Announcement {
  // No need for additional properties since they're all in the base interface now
} 