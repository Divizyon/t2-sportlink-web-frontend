import type { User } from "./types";

export const users: User[] = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-04-19T15:30:00Z",
    profileImage: "/avatars/ahmet.jpg",
  },
  {
    id: "2",
    name: "Mehmet Demir",
    email: "mehmet@example.com",
    role: "moderator",
    status: "active",
    createdAt: "2024-02-20T14:30:00Z",
    lastLogin: "2024-04-18T09:15:00Z",
    profileImage: "/avatars/mehmet.jpg",
  },
  {
    id: "3",
    name: "Ayşe Kaya",
    email: "ayse@example.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-03-10T11:20:00Z",
    lastLogin: "2024-04-15T16:45:00Z",
  },
  {
    id: "4",
    name: "Fatma Şahin",
    email: "fatma@example.com",
    role: "user",
    status: "banned",
    createdAt: "2024-01-05T09:00:00Z",
    lastLogin: "2024-04-10T12:30:00Z",
  },
]; 