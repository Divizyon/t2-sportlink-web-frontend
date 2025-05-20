export interface Event {
  id: string;
  creator_id: string;
  sport_id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  status: 'active' | 'passive' | 'pending' | 'canceled' | 'completed';
  created_at: string;
  updated_at: string;
  sport?: Sport;
  creator?: User;
  participants?: Participant[];
  participantCount?: number;
  category?: string;
  price?: number;
  organizer?: string;
  requirements?: string[];
  prizes?: string[];
}

export interface Sport {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  role: string;
}

export interface Participant {
  event_id?: string;
  user_id: string;
  joined_at: string;
  role?: string;
  user?: User;
  id?: string;
  name?: string;
  email?: string;
  phone?: string | undefined;
  registration_date?: string;
}

export interface EventFilterParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string[];
  sportId?: string;
}

export interface PaginatedEventResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Helper function to safely type a status string to the Event status type
export function getSafeStatus(status: string): 'active' | 'passive' | 'pending' | 'canceled' | 'completed' {
  const safeStatus = status.toLowerCase();
  if (safeStatus === 'active' || safeStatus === 'passive' || 
      safeStatus === 'pending' || safeStatus === 'canceled' || 
      safeStatus === 'completed') {
    return safeStatus as 'active' | 'passive' | 'pending' | 'canceled' | 'completed';
  }
  
  // Map 'draft' to 'pending' and use 'pending' as default
  if (safeStatus === 'draft') {
    return 'pending';
  }
  
  // Default fallback for unexpected values
  return 'pending';
} 