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
}

export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  isPublished: boolean;
  endDate: string | null;
}

export interface UpdateAnnouncementDTO {
  title: string;
  content: string;
  isPublished: boolean;
  endDate: string | null;
}

export interface AnnouncementListParams {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface AnnouncementListResponse {
  success: boolean;
  data: Announcement[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  message?: string;
}

export interface AnnouncementDetailResponse {
  success: boolean;
  data: Announcement;
  message?: string;
} 