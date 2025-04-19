"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Pencil, Calendar, Newspaper, User, Tag, Eye, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  status: string;
  image: string;
  author: string;
  tags: string[];
  views: number;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([
    {
      id: "1",
      title: "Fenerbahçe'den Muhteşem Galibiyet",
      content: "Fenerbahçe, son maçında rakip takımı 3-0 mağlup etti. Maçın yıldızı Alex de Souza oldu. İlk yarıda 2 gol atan Souza, ikinci yarıda da bir asist yaparak takımının galibiyetinde büyük pay sahibi oldu. Maç sonrası teknik direktör, takımın performansından memnun olduğunu belirtti.",
      category: "Futbol",
      date: "2024-06-15",
      status: "Aktif",
      image: "/images/fenerbahce-victory.jpg",
      author: "Ahmet Yılmaz",
      tags: ["Fenerbahçe", "Futbol", "Galibiyet"],
      views: 1250
    },
    {
      id: "2",
      title: "Basketbolda Büyük Başarı",
      content: "Milli basketbol takımımız, Avrupa Şampiyonası'nda çeyrek finale yükseldi. Son maçta İspanya'yı 85-82 yenen takımımız, tarihi bir başarıya imza attı. Shane Larkin'in 32 sayı attığı maçta, Furkan Korkmaz da 18 sayı ile takımına katkıda bulundu.",
      category: "Basketbol",
      date: "2024-06-20",
      status: "Aktif",
      image: "/images/basketball-success.jpg",
      author: "Mehmet Demir",
      tags: ["Milli Takım", "Basketbol", "Başarı"],
      views: 980
    }
  ]);

  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    category: "",
    date: "",
    status: "Aktif",
    image: "",
    author: "",
    tags: [] as string[],
    views: 0
  });

  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(news.length > 0 ? news[0] : null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

  const handleAddNews = () => {
    const newsItem: News = {
      id: Date.now().toString(),
      ...newNews
    };

    setNews([newsItem, ...news]);
    setSelectedNews(newsItem);
    setNewNews({
      title: "",
      content: "",
      category: "",
      date: "",
      status: "Aktif",
      image: "",
      author: "",
      tags: [],
      views: 0
    });
  };

  const handleEditNews = () => {
    if (!editingNews) return;

    setNews(news.map(item => 
      item.id === editingNews.id ? editingNews : item
    ));
    setEditingNews(null);
  };

  const handleDeleteNews = (id: string) => {
    setNews(news.filter(item => item.id !== id));
    if (selectedNews && selectedNews.id === id) {
      setSelectedNews(news.length > 1 ? news.find(item => item.id !== id) || null : null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-4rem)]">
      <div className="overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Haber Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Haber ara..."
                  className="max-w-sm"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Haber
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Haber Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Başlık</Label>
                      <Input
                        id="title"
                        value={newNews.title}
                        onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="content">İçerik</Label>
                      <Textarea
                        id="content"
                        value={newNews.content}
                        onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={newNews.category}
                        onValueChange={(value) => setNewNews({ ...newNews, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Tarih</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newNews.date}
                        onChange={(e) => setNewNews({ ...newNews, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="author">Yazar</Label>
                      <Input
                        id="author"
                        value={newNews.author}
                        onChange={(e) => setNewNews({ ...newNews, author: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image">Görsel URL</Label>
                      <Input
                        id="image"
                        value={newNews.image}
                        onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
                      <Input
                        id="tags"
                        value={newNews.tags.join(", ")}
                        onChange={(e) => setNewNews({ ...newNews, tags: e.target.value.split(",").map(tag => tag.trim()) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Durum</Label>
                      <Select
                        value={newNews.status}
                        onValueChange={(value) => setNewNews({ ...newNews, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Pasif">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddNews}>Haber Ekle</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-auto">
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</TableHead>
                    <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {news.map((item) => (
                    <tr 
                      key={item.id}
                      className={`
                        hover:bg-green-50 cursor-pointer
                        ${selectedNews?.id === item.id ? 'bg-green-100' : ''}
                      `}
                      style={{
                        borderLeft: selectedNews?.id === item.id ? '6px solid #059669' : 'none'
                      }}
                      onClick={() => setSelectedNews(item)}
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {item.status === "Aktif" ? 
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Yayında
                          </Badge> : 
                          <Badge variant="secondary">
                            Taslak
                          </Badge>
                        }
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNews(item.id);
                          }}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-y-auto">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Haber Önizleme</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === "preview" ? "default" : "outline"} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setViewMode("preview")}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "edit" ? "default" : "outline"} 
                size="icon" 
                className="h-8 w-8" 
                disabled={!selectedNews}
                onClick={() => setViewMode("edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedNews ? (
              viewMode === "preview" ? (
                <div className="space-y-6">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <Image
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold">{selectedNews.title}</h3>
                      {selectedNews.status === "Aktif" ? 
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Yayında
                        </Badge> : 
                        <Badge variant="secondary">
                          Taslak
                        </Badge>
                      }
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedNews.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedNews.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        <span>{selectedNews.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{selectedNews.views} görüntülenme</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">İçerik</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedNews.content}</p>
                    </div>
                    {selectedNews.tags.length > 0 && (
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Etiketler</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedNews.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-title">Başlık</Label>
                      <Input
                        id="edit-title"
                        value={selectedNews.title}
                        onChange={(e) => setSelectedNews({ ...selectedNews, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-content">İçerik</Label>
                      <Textarea
                        id="edit-content"
                        value={selectedNews.content}
                        onChange={(e) => setSelectedNews({ ...selectedNews, content: e.target.value })}
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Kategori</Label>
                      <Select
                        value={selectedNews.category}
                        onValueChange={(value) => setSelectedNews({ ...selectedNews, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Futbol">Futbol</SelectItem>
                          <SelectItem value="Basketbol">Basketbol</SelectItem>
                          <SelectItem value="Voleybol">Voleybol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Tarih</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={selectedNews.date}
                        onChange={(e) => setSelectedNews({ ...selectedNews, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-author">Yazar</Label>
                      <Input
                        id="edit-author"
                        value={selectedNews.author}
                        onChange={(e) => setSelectedNews({ ...selectedNews, author: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-image">Görsel URL</Label>
                      <Input
                        id="edit-image"
                        value={selectedNews.image}
                        onChange={(e) => setSelectedNews({ ...selectedNews, image: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tags">Etiketler (virgülle ayırın)</Label>
                      <Input
                        id="edit-tags"
                        value={selectedNews.tags.join(", ")}
                        onChange={(e) => setSelectedNews({ ...selectedNews, tags: e.target.value.split(",").map(tag => tag.trim()) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Durum</Label>
                      <Select
                        value={selectedNews.status}
                        onValueChange={(value) => setSelectedNews({ ...selectedNews, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Pasif">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => {
                        if (selectedNews) {
                          setNews(news.map(item => 
                            item.id === selectedNews.id ? selectedNews : item
                          ));
                          setViewMode("preview");
                        }
                      }}>Değişiklikleri Kaydet</Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                Önizlemek için bir haber seçin
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 