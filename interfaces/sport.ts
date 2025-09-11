export interface Sport {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  active?: boolean;
  category?: string;
  image?: string;
  popular?: boolean;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  participant_type?: 'individual' | 'team' | 'both';
  required_equipment?: string[];
}

export interface SportListResponse {
  success: boolean;
  data: Sport[];
  message?: string;
}

export interface SportDetailResponse {
  success: boolean;
  data: Sport;
  message?: string;
} 