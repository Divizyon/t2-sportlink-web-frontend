export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  published_at: string;
  author?: string;
  image_url?: string;
  sport_id?: string;
  sport?: {
    id: string;
    name: string;
  };
  source?: string;
  tags?: string[];
  status?: 'draft' | 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  views?: number;
}

export interface NewsListParams {
  page?: number;
  limit?: number;
  sportId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface NewsListResponse {
  success: boolean;
  data: News[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface NewsDetailResponse {
  success: boolean;
  data: News;
  message?: string;
} 