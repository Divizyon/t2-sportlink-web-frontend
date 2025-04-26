/**
 * Duyuru durumları
 */
export type AnnouncementStatus = 'published' | 'draft' | 'archived' | 'pending' | "Aktif" | "Pasif" | "Taslak";

/**
 * Duyuru görünürlük tipleri
 */
export type AnnouncementVisibility = 'public' | 'members' | 'admin' | "Herkese Açık" | "Sadece Üyeler" | "Yöneticiler";

/**
 * Duyuru temel bilgileri
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  start_date?: string | null;
  end_date?: string | null;
  creator_id?: string | null;
  creator?: {
    name?: string;
    id?: string;
  } | null;
  published?: boolean;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  author?: string; 
  authorId?: string;
  status?: AnnouncementStatus;
  views?: number;
  date?: string;
  tags?: string[];
  priority?: number;
  pinned?: boolean;
  visibility?: AnnouncementVisibility;
  category?: string;
}

/**
 * Yeni duyuru oluşturma verisi
 */
export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  status: AnnouncementStatus;
  tags?: string[];
  priority?: number;
  pinned?: boolean;
  visibility?: AnnouncementVisibility;
}

/**
 * Duyuru güncelleme verisi
 */
export interface UpdateAnnouncementDTO {
  title?: string;
  content?: string;
  summary?: string;
  imageUrl?: string;
  status?: AnnouncementStatus;
  tags?: string[];
  priority?: number;
  pinned?: boolean;
  visibility?: AnnouncementVisibility;
}

/**
 * API'den dönen liste yanıtı
 */
export interface AnnouncementListResponse {
  success: boolean;
  data: Announcement[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  message?: string;
}

/**
 * API'den dönen detay yanıtı
 */
export interface AnnouncementDetailResponse {
  success: boolean;
  data: Announcement;
  message?: string;
}

/**
 * Liste parametreleri
 */
export interface AnnouncementListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: AnnouncementStatus;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  authorId?: string;
  includeUnpublished?: boolean;
} 