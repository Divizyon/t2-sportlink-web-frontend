"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash, Eye, Pencil, Filter, ListFilter, CheckCircle2 } from "lucide-react";
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
import type { News, NewsStatus } from "@/types/news";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface NewsListProps {
  onEdit?: (news: News) => void;
  onDelete?: (id: number) => void;
  onView?: (news: News) => void;
  showActions?: boolean;
  showSearchAndCreate?: boolean;
  sportId?: string;
}

const NewsList: React.FC<NewsListProps> = ({
  onEdit,
  onDelete,
  onView,
  showActions = true,
  showSearchAndCreate = true,
  sportId
}) => {
  const { news, loading, error, getAllNews, getNewsByCategory, setSelectedNews, createNews, selectedNews } = useStore();
  const [isAddNewsDialogOpen, setIsAddNewsDialogOpen] = useState(false);
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    source_url: '',
    image_url: '',
    sport_id: '',
    published_date: new Date()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchNews = async () => {
      if (sportId) {
        await getNewsByCategory(sportId);
      } else {
        await getAllNews();
      }
    };
    
    fetchNews();
  }, [sportId, getAllNews, getNewsByCategory]);
  
  const getStatusBadge = (status: NewsStatus) => {
    const statusColors = {
      "Aktif": "bg-green-100 text-green-800",
      "Pasif": "bg-gray-100 text-gray-800",
      "Taslak": "bg-yellow-100 text-yellow-800",
      "Onay Bekliyor": "bg-orange-100 text-orange-800"
    };

    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    );
  };
  
  // Varsayılan işlem fonksiyonları
  const defaultOnView = (item: News) => {
    setSelectedNews(item);
  };
  
  const handleEdit = onEdit || defaultOnView;
  const handleView = onView || defaultOnView;
  const handleDelete = onDelete || ((id: number | string) => console.log(`Silme işlemi: ${id}`));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNews(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewNews(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content || !newNews.source_url || !newNews.image_url || !newNews.sport_id) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurunuz",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await createNews(newNews);
      
      if (response.success) {
        toast({
          title: "Başarılı",
          description: "Haber başarıyla eklendi"
        });
        
        // Formu temizle ve modalı kapat
        setNewNews({
          title: '',
          content: '',
          source_url: '',
          image_url: '',
          sport_id: '',
          published_date: new Date()
        });
        
        setIsAddNewsDialogOpen(false);
      } else {
        toast({
          title: "Hata",
          description: response.message || "Haber eklenirken bir hata oluştu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Haber eklenirken hata:', error);
      toast({
        title: "Hata",
        description: "Haber eklenirken bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Haber ID değerini karşılaştırmak için helper fonksiyon
  const isSameNews = (a: number | string | undefined, b: number | string | undefined): boolean => {
    if (a === undefined || b === undefined) return false;
    return String(a) === String(b);
  };

  // Konsola seçili haberi yazarak hata ayıklama
  React.useEffect(() => {
    console.log("Seçili haber ID:", selectedNews?.id);
  }, [selectedNews]);

  // Durum filtreleme işlemi
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => {
      // Eğer zaten seçiliyse, kaldır
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } 
      // Değilse ekle
      else {
        return [...prev, status];
      }
    });
  };
  
  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    toast({
      title: "Filtreler Temizlendi",
      description: "Tüm filtreler temizlendi."
    });
  };
  
  // Filtrelenmiş haberler
  const filteredNews = React.useMemo(() => {
    if (!news || !Array.isArray(news)) {
      return [];
    }
    
    return news.filter(item => {
      // Arama terimine göre filtrele
      const matchesSearch = !searchTerm || 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Eğer durum filtresi seçilmemişse veya boşsa
      if (selectedStatuses.length === 0) {
        return matchesSearch;
      }
      
      // Seçili durumlara göre filtrele
      const matchesStatus = selectedStatuses.includes(item.status);
      
      return matchesSearch && matchesStatus;
    });
  }, [news, searchTerm, selectedStatuses]);

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

  return (
    <Card className="h-full flex flex-col rounded-l-none border-l-0 rounded-b-none border-b-0">
      <CardHeader className="pl-4 pb-2">
        <CardTitle>Haber Listesi</CardTitle>
        {showSearchAndCreate && (
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-4">
              <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
                <Input
                  placeholder="Haber ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  variant="outline" 
                  className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
                  onClick={() => {
                    console.log("Arama yapılıyor:", searchTerm);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <Select>
                <SelectTrigger className="w-10 h-10 p-0 [&>svg]:hidden">
                  <div className="flex items-center justify-center w-full h-full relative">
                    <Filter className="h-5 w-5" />
                    {selectedStatuses.length > 0 && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary"></span>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="mb-2 px-2 font-semibold text-sm">Duruma Göre Filtrele</div>
                  <div className="flex flex-col gap-2 p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-all" 
                        checked={selectedStatuses.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStatuses([]);
                          }
                        }}
                      />
                      <div className="flex items-center text-sm cursor-pointer">
                        <ListFilter className="mr-2 h-4 w-4" />
                        <label htmlFor="filter-all">Tümü</label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-active" 
                        checked={selectedStatuses.includes("Aktif")}
                        onCheckedChange={() => toggleStatus("Aktif")}
                      />
                      <div className="flex items-center text-sm cursor-pointer">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        <label htmlFor="filter-active">Aktif</label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-passive" 
                        checked={selectedStatuses.includes("Pasif")}
                        onCheckedChange={() => toggleStatus("Pasif")}
                      />
                      <div className="flex items-center text-sm cursor-pointer">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-gray-600" />
                        <label htmlFor="filter-passive">Pasif</label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-draft" 
                        checked={selectedStatuses.includes("Taslak")}
                        onCheckedChange={() => toggleStatus("Taslak")}
                      />
                      <div className="flex items-center text-sm cursor-pointer">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-600" />
                        <label htmlFor="filter-draft">Taslak</label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-pending" 
                        checked={selectedStatuses.includes("Onay Bekliyor")}
                        onCheckedChange={() => toggleStatus("Onay Bekliyor")}
                      />
                      <div className="flex items-center text-sm cursor-pointer">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-orange-600" />
                        <label htmlFor="filter-pending">Onay Bekliyor</label>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStatuses.length > 0 && (
                    <div className="flex justify-center p-2 pt-3 border-t">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Filtreleri Temizle
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Button size="sm" className="gap-1" onClick={() => setIsAddNewsDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Yeni Haber Ekle
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="rounded-md rounded-b-none border border-b-0 mx-4 mt-0 mb-0 flex-1 flex flex-col">
          <div className="overflow-auto h-[calc(100vh-180px)]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Spor Dalı</TableHead>
                  <TableHead>Yayın Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  {showActions && <TableHead className="text-right">İşlemler</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-auto">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 7 : 6} className="text-center py-4">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 7 : 6} className="text-center py-4 text-red-500">
                      Hata: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredNews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 7 : 6} className="text-center py-4">
                      {searchTerm || selectedStatuses.length > 0 ? (
                        <div className="flex flex-col items-center py-8">
                          <h3 className="text-lg font-medium mb-2">Arama kriterlerine uygun haber bulunamadı</h3>
                          <p className="text-muted-foreground mb-4">Farklı filtreler kullanmayı veya arama terimini değiştirmeyi deneyin.</p>
                          <Button variant="outline" onClick={clearFilters}>
                            Filtreleri Temizle
                          </Button>
                        </div>
                      ) : (
                        "Henüz haber bulunmamaktadır."
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNews.map((item, index) => {
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
                        <TableCell>{new Date(item.date).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        {showActions && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Satır tıklamasını engelle
                                  // number veya string olarak işle
                                  onDelete ? onDelete(item.id as number) : console.log(`Silme işlemi: ${item.id}`);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Yeni Haber Ekleme Dialog */}
      <Dialog open={isAddNewsDialogOpen} onOpenChange={setIsAddNewsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Haber Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                name="title"
                value={newNews.title}
                onChange={handleInputChange}
                placeholder="Haber başlığı"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                name="content"
                value={newNews.content}
                onChange={handleInputChange}
                placeholder="Haber içeriği"
                className="min-h-[150px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source_url">Kaynak URL</Label>
              <Input
                id="source_url"
                name="source_url"
                value={newNews.source_url}
                onChange={handleInputChange}
                placeholder="https://example.com/haber/1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Görsel URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={newNews.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/images/haber.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sport_id">Spor Dalı</Label>
              <Select
                value={newNews.sport_id}
                onValueChange={(value) => handleSelectChange("sport_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Spor dalı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Futbol</SelectItem>
                  <SelectItem value="2">Basketbol</SelectItem>
                  <SelectItem value="3">Voleybol</SelectItem>
                  <SelectItem value="4">Tenis</SelectItem>
                  <SelectItem value="5">Yüzme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNewsDialogOpen(false)}>İptal</Button>
            <Button onClick={handleAddNews} disabled={isSubmitting}>
              {isSubmitting ? "Ekleniyor..." : "Haber Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NewsList; 