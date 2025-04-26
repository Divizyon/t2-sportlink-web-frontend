export type AnnouncementStatus = "Aktif" | "Pasif" | "Taslak"
export type AnnouncementVisibility = "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler"

export type Announcement = {
  id: string
  title: string
  content: string
  category: string
  status: AnnouncementStatus
  visibility: AnnouncementVisibility
  createdAt: string
  updatedAt: string
  image?: string
}

export interface AnnouncementDisplay extends Announcement {
  // No need for additional properties since they're all in the base interface now
} 