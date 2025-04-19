export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture: string;
  role: string;
  created_at: string;
  updated_at: string;
  birthDate: string;
  // İlişkili veriler
  createdEvents?: number;
  userSports?: string[];
  eventParticipations?: number;
  reportsReceived?: number;
  interests?: string[];
} 