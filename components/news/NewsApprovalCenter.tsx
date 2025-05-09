"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { News } from "@/types/news";

interface NewsApprovalCenterProps {
  news: News[];
  formatDate: (dateString: string) => string;
}

const NewsApprovalCenter: React.FC<NewsApprovalCenterProps> = ({
  news,
  formatDate
}) => {
  const { submitForApproval, setSelectedNews, selectedNews } = useStore();
  
  // Sadece taslak haberleri filtrele
  const draftNews = news.filter(n => n.status === "Taslak");

  // Haber ID değerini karşılaştırmak için helper fonksiyon
  const isSameNews = (a: number | string | undefined, b: number | string | undefined): boolean => {
    if (a === undefined || b === undefined) return false;
    return String(a) === String(b);
  };

  // Function to extract URL from content and remove it from displayed content
  const extractUrlFromContent = (content: string): { content: string, url: string | null } => {
    const urlRegex = /\[(https?:\/\/[^\s\]]+)\]/;
    const match = content.match(urlRegex);
    
    if (match && match[1]) {
      // Return the content without the bracketed URL and the extracted URL
      return {
        content: content.replace(urlRegex, '').trim(),
        url: match[1]
      };
    }
    
    return { content, url: null };
  };

  // Konsola seçili haberi yazarak hata ayıklama
  React.useEffect(() => {
    console.log("Onay Merkezi - Seçili haber ID:", selectedNews?.id);
  }, [selectedNews]);

  const handleSubmitForApproval = async (id: number) => {
    try {
      const result = await submitForApproval(id);
      if (!result.success) {
        console.error('Haber onaya gönderilirken hata:', result.message);
        // Burada bir bildirim gösterilebilir
      }
    } catch (error) {
      console.error('Haber onaya gönderilirken hata:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taslak Haberler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Spor Dalı</TableHead>
                  <TableHead>Yayın Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftNews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Taslak haber bulunmamaktadır
                    </TableCell>
                  </TableRow>
                ) : (
                  draftNews.map((item, index) => {
                  const isSelected = isSameNews(selectedNews?.id, item.id);
                  
                  return (
                      <TableRow 
                      key={item.id}
                      style={isSelected ? { backgroundColor: '#d1fae5 !important' } : {}}
                        className={`cursor-pointer ${isSelected ? '!bg-green-100 hover:!bg-green-200' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedNews(item)}
                      data-selected={isSelected ? "true" : "false"}
                      data-index={index}
                    >
                        <TableCell>
                          <div className="w-16 h-16 relative">
                            <img
                              src={item.image || '/placeholder-image.jpg'}
                              alt={item.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{extractUrlFromContent(item.content).content}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                        <Button 
                              variant="ghost"
                              size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                                handleSubmitForApproval(item.id as number);
                          }}
                              title="Onaya Gönder"
                              className="text-green-600 hover:text-green-800 hover:bg-green-100"
                        >
                              <CheckCircle className="h-5 w-5" />
                        </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          </div>
      </CardContent>
    </Card>
  );
};

export default NewsApprovalCenter; 