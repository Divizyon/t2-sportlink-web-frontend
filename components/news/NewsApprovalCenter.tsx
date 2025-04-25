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
import type { News } from "@/types/news";

interface NewsApprovalCenterProps {
  news: News[];
  setSelectedNews: (news: News) => void;
  handleApproveNews: (id: number) => Promise<void>;
  handleRejectNews: (id: number) => Promise<void>;
  formatDate: (dateString: string) => string;
}

const NewsApprovalCenter: React.FC<NewsApprovalCenterProps> = ({
  news,
  setSelectedNews,
  handleApproveNews,
  handleRejectNews,
  formatDate
}) => {
  // Onay bekleyen haberleri filtrele
  const pendingNews = news.filter(n => n.status === "Onay Bekliyor");

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
          <div className="overflow-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yazar</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                  <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {pendingNews.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-orange-50 cursor-pointer"
                    onClick={() => {
                      setSelectedNews(item);
                    }}
                  >
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.date)}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveNews(item.id);
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectNews(item.id);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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