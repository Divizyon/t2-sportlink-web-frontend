export type UserRole = "admin" | "moderator" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive" | "banned";
  createdAt: string;
  lastLogin: string;
  profileImage?: string;
} 