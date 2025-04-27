export type NewsStatus = "Aktif" | "Pasif" | "Taslak" | "Onay Bekliyor";

export type News = {
  id: number | string;
  title: string;
  content: string;
  status: NewsStatus;
  category: string;  // Spor dalı adı (UI'da gösterme için)
  date: string;      // Geriye dönük uyumluluk için
  author: string;
  views: number;
  image: string;
  sourceUrl: string;
  
  // Yeni alanlar
  source_url?: string;    // Backend'e gönderirken kullanılacak
  image_url?: string;     // Backend'e gönderirken kullanılacak
  sport_id?: string;      // Spor dalı ID'si
  published_date?: Date;  // Yayın tarihi
  created_at?: string;    // Oluşturulma tarihi
  updated_at?: string;    // Güncellenme tarihi
}; 