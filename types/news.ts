export type NewsStatus = "Aktif" | "Pasif" | "Taslak" | "Onay Bekliyor";

export type News = {
  id: number;
  title: string;
  content: string;
  status: NewsStatus;
  category: string;
  date: string;
  author: string;
  views: number;
  image: string;
  sourceUrl: string;
}; 