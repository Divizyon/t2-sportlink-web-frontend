"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { NewsStatus, News } from "@/types/news";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import NewsList from "@/components/news/NewsList";
import NewsPreview from "@/components/news/NewsPreview";

// Yardımcı tip tanımlaması (fetchNewsFromUrl için)
type NewsItemSource = {
  title: string;
  content: string;
  image: string;
  sourceUrl: string;
  author: string;
}

export default function NewsPage() {
  const { news, getAllNews, setSelectedNews } = useStore();
  
  const [sourceUrl, setSourceUrl] = useState("");
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch news when the component mounts
  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        await getAllNews();
      } catch (error) {
        console.error("Haberler yüklenirken hata:", error);
        toast({
          title: "Hata",
          description: "Haberler yüklenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    };

    fetchAllNews();
  }, [getAllNews]);

  // Only select first news if none is selected, no need to track drafts separately
  useEffect(() => {
    if (news && news.length > 0) {
      // Otomatik olarak ilk haberi seç (eğer haber varsa ve henüz seçili haber yoksa)
      if (news.length > 0 && news[0]) {
        // Zaten seçili bir haber var mı kontrol et
        const { selectedNews } = useStore.getState();
        if (!selectedNews) {
          setSelectedNews(news[0]);
        }
      }
    }
  }, [news, setSelectedNews]);

  const fetchNewsFromUrl = async (url: string): Promise<NewsItemSource[]> => {
    setIsLoading(true);
    try {
      // Mock implementation for demo purposes
      const siteUrl = new URL(url).origin;
      const numberOfNews = Math.floor(Math.random() * 3) + 2;
      const newsItems: NewsItemSource[] = [];
      
      // Generate demo news items
      for (let i = 0; i < numberOfNews; i++) {
        const newsTitle = `Spor haberi #${i+1} - ${new Date().toLocaleDateString()}`;
        
        newsItems.push({
          title: newsTitle,
          image: "/placeholder-image.jpg",
          content: `Bu spor haberinin içeriği. Kaynak: ${siteUrl}`,
          sourceUrl: `${siteUrl}/haber-${i+1}`,
          author: "Otomatik Çekilen"
        });
      }
      
      return newsItems;
    } catch (error) {
      console.error("Haber çekme hatası:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (sourceUrl.trim()) {
      const fetchedItems = await fetchNewsFromUrl(sourceUrl);
      
      if (fetchedItems.length === 0) {
        toast({
          title: "Hata",
          description: "Siteden spor haberleri çekilemedi!",
          variant: "destructive"
        });
        return;
      }
      
      // Çekilen haberleri News formatına dönüştür
      const currentDate = new Date().toISOString().split('T')[0];
      
      const newPendingNews: News[] = fetchedItems.map((item, index) => {
        return {
          id: news.length + index + 1,
          title: item.title,
          content: item.content,
          category: "Spor",
          date: currentDate as string,
          status: "Onay Bekliyor" as NewsStatus,
          image: item.image,
          sourceUrl: item.sourceUrl,
          views: 0,
          author: item.author
        };
      });
      
      // State'i güncelle - we no longer need to update draftNews
      setSourceUrl("");
      setIsUrlDialogOpen(false);
      
      toast({
        title: "Başarılı",
        description: `${sourceUrl} sitesinden ${newPendingNews.length} haber başarıyla çekildi!`
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Yeni grid layout: Sol tarafta haberler, sağ tarafta önizleme */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Sol kolon: Haber listesi */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Haber Listesi - stretching to full height */}
          <div className="h-full">
            <NewsList 
              showActions={true}
              showSearchAndCreate={true}
            />
          </div>
          
          {/* Taslak Haberler section removed */}
        </div>
        
        {/* Sağ kolon: Haber önizleme */}
        <div className="lg:col-span-1 h-full">
          <NewsPreview
            defaultImage="/placeholder-image.jpg"
            onSave={async (news) => {
              console.log("Saving:", news);
              toast({
                title: "Bilgi",
                description: "Haber kaydetme işlevi şu anda aktif değil."
              });
            }}
            showEditButton={true}
            onEditModeChange={setEditMode}
          />
        </div>
      </div>

      {/* Add URL Dialog */}
      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Haber Kaynağı Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                placeholder="https://spor.example.com/haber"
                className="col-span-3"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUrlDialogOpen(false)}>İptal</Button>
            <Button onClick={handleAddSource} disabled={isLoading}>
              {isLoading ? "Yükleniyor..." : "Haberleri Al"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 