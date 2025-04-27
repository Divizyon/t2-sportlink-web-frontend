"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const { approveNews, rejectNews, setSelectedNews, selectedNews } = useStore();
  
  // Onay bekleyen haberleri filtrele
  const pendingNews = news.filter(n => n.status === "Onay Bekliyor");

  // Haber ID değerini karşılaştırmak için helper fonksiyon
  const isSameNews = (a: number | string | undefined, b: number | string | undefined): boolean => {
    if (a === undefined || b === undefined) return false;
    return String(a) === String(b);
  };

  // Konsola seçili haberi yazarak hata ayıklama
  React.useEffect(() => {
    console.log("Onay Merkezi - Seçili haber ID:", selectedNews?.id);
  }, [selectedNews]);

  const handleApproveNews = async (id: number) => {
    try {
      const result = await approveNews(id);
      if (!result.success) {
        console.error('Haber onaylanırken hata:', result.message);
        // Burada bir bildirim gösterilebilir
      }
    } catch (error) {
      console.error('Haber onaylanırken hata:', error);
    }
  };

  const handleRejectNews = async (id: number) => {
    try {
      const result = await rejectNews(id);
      if (!result.success) {
        console.error('Haber reddedilirken hata:', result.message);
        // Burada bir bildirim gösterilebilir
      }
    } catch (error) {
      console.error('Haber reddedilirken hata:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haber Onay Merkezi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Onay Bekleyen Haberler ({pendingNews.length})</h3>
        </div>
        {pendingNews.length > 0 ? (
          <div className="overflow-auto max-h-[400px] border rounded-md">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yazar</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {pendingNews.map((item, index) => {
                  const isSelected = isSameNews(selectedNews?.id, item.id);
                  console.log(`Onay Merkezi - Haber ${item.id} seçili mi:`, isSelected, "Index:", index);
                  
                  return (
                    <tr 
                      key={item.id}
                      style={isSelected ? { backgroundColor: '#d1fae5 !important' } : {}}
                      className={`cursor-pointer ${isSelected ? '!bg-green-100 hover:!bg-green-200' : 'hover:bg-orange-50'}`}
                      onClick={() => {
                        setSelectedNews(item);
                      }}
                      data-selected={isSelected ? "true" : "false"}
                      data-index={index}
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          size="sm" 
                          className="mr-2 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveNews(item.id as number);
                          }}
                        >
                          Onayla
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectNews(item.id as number);
                          }}
                        >
                          Reddet
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500">Onay bekleyen haber bulunmamaktadır</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsApprovalCenter; 