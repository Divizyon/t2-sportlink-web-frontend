export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture?: string | null;
  default_location_latitude?: number | null;
  default_location_longitude?: number | null;
  role: string;
  created_at: string;

  // API yanıtından gelen ek alanlar
  user_sports?: any[];
  name?: string;
  profileImage?: string | null;
  location?: string;
  events?: number;
  friends?: number;
  interests?: string[];
  joinDate?: string;
  registrationDate?: string;
  createdEvents?: any[];

  // Opsiyonel alanlar (backend'den henüz gelmiyor olabilir)
  updated_at?: string;
  birthDate?: string;
}

export interface UserType {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  profile_picture?: string;
  default_location_latitude?: number;
  default_location_longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  password?: string;
} 