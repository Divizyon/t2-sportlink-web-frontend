import type { User } from './user';

export interface FriendRequest {
  id: string;
  requestor_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requestor?: User;
  recipient?: User;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  user?: User;
  friend?: User;
}

export interface FriendStatus {
  status: 'none' | 'pending' | 'requested' | 'friends';
  request_id?: string;
}

export interface FriendRequestListParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface FriendListParams {
  page?: number;
  limit?: number;
}

export interface FriendRequestResponse {
  success: boolean;
  data: FriendRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface FriendListResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface FriendStatusResponse {
  success: boolean;
  data: FriendStatus;
  message?: string;
} 