export type NewsStatus = "draft" | "published" | "archived";

export interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  status: NewsStatus;
  publishedAt?: string;
  imageUrl?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
} 