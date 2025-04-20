"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Pencil, Calendar, Newspaper, User, Tag, Eye, Trash, LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Define the NewsStatus type
type NewsStatus = "Aktif" | "Pasif" | "Taslak" | "Onay Bekliyor";

// Define the News type once
type News = {
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

// Define a type for newNews without id and views
type NewNewsType = Omit<News, 'id' | 'views'>;

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([
    {
      id: 1,
      title: "Fenerbahçe Süper Lig'de Liderliği Kaptırdı",
      content: "Fenerbahçe, Süper Lig'in 30. haftasında deplasmanda Antalyaspor'a 2-1 yenilerek liderlik koltuğunu Galatasaray'a bıraktı.",
      category: "Futbol",
      date: "2023-04-15",
      status: "Aktif",
      image: "/images/fenerbahce.jpg",
      sourceUrl: "",
      views: 1250,
      author: "Spor Haberleri"
    },
    {
      id: 2,
      title: "NBA'de Lakers Play-Off İçin Mücadele Ediyor",
      content: "Los Angeles Lakers, NBA'de play-off pozisyonu için son maçlarında önemli galibiyetler almaya devam ediyor. LeBron James'in liderliğindeki ekip, Phoenix Suns'ı 122-111 mağlup etti.",
      category: "Basketbol",
      date: "2023-04-14",
      status: "Aktif",
      image: "/images/lakers.jpg",
      sourceUrl: "",
      views: 980,
      author: "NBA Türkiye"
    },
    {
      id: 3,
      title: "Voleybolda Vakıfbank Üst Üste 3. Kez Şampiyon",
      content: "Vakıfbank Kadın Voleybol Takımı, Türkiye Voleybol Ligi'nde üst üste 3. şampiyonluğunu ilan etti. Final serisinde Fenerbahçe'yi 3-0 ile geçtiler.",
      category: "Voleybol",
      date: "2023-04-12",
      status: "Aktif",
      image: "/images/vakifbank.jpg",
      sourceUrl: "",
      views: 750,
      author: "Voleybol Haberleri"
    },
    {
      id: 4,
      title: "Yeni Malatyaspor Süper Lig'de Küme Düştü",
      content: "Süper Lig'in 29. haftasında Yeni Malatyaspor, matematiksel olarak da küme düşmesi kesinleşti. Takım gelecek sezon 1. Lig'de mücadele edecek.",
      category: "Futbol",
      date: "2023-04-10",
      status: "Onay Bekliyor",
      image: "/images/malatyaspor.jpg",
      sourceUrl: "",
      views: 520,
      author: "Spor Haberleri"
    }
  ]);

  const [pendingNews, setPendingNews] = useState<News[]>([
    {
      id: 3,
      title: "Türkiye Voleybol Milli Takımı Avrupa Şampiyonası'nda",
      content: "Türkiye Voleybol Milli Takımı, Avrupa Şampiyonası'nda çeyrek finale yükseldi. Yarı finalde İtalya ile karşılaşacak.",
      category: "Voleybol",
      date: "2023-04-17",
      status: "Onay Bekliyor",
      image: "/images/voleybol.jpg",
      sourceUrl: "https://www.sporhaber.com/voleybol/milli-takim",
      views: 0
    }
  ]);

  const [sourceUrl, setSourceUrl] = useState("");
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewsFromUrl = async (url: string) => {
    setIsLoading(true);
    try {
      // Burada gerçek bir API çağrısı yapılacak
      // Şimdilik örnek veri döndürüyoruz
      const response = await fetch(url);
      const html = await response.text();
      
      // Örnek olarak, gerçek uygulamada bu kısım bir web scraping servisi olacak
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "Haber Başlığı";
      const imageUrl = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)?.[1] || "/images/default-news.jpg";
      
      // Kısa bir içerik özeti çıkarma girişimi
      const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1] || "";
      
      return {
        title,
        image: imageUrl,
        content: description ? description : "Bu haber otomatik olarak çekilmiştir."
      };
    } catch (error) {
      console.error("Haber çekme hatası:", error);
      return {
        title: "Haber Başlığı",
        image: "/images/default-news.jpg",
        content: "Haber içeriği çekilemedi."
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (sourceUrl.trim()) {
      const { title, image, content } = await fetchNewsFromUrl(sourceUrl);
      
      const newPendingNews: News = {
        id: pendingNews.length + news.length + 1,
        title,
        content,
        category: "Genel",
        date: new Date().toISOString().split('T')[0] || "",
        status: "Onay Bekliyor",
        image,
        sourceUrl: sourceUrl,
        views: 0,
        author: "Adsız Yazar"
      };
      
      setPendingNews([...pendingNews, newPendingNews]);
      setSourceUrl("");
      setIsUrlDialogOpen(false);
    }
  };

  const handleApproveNews = (newsItem: News) => {
    const updatedPendingNews = pendingNews.filter(item => item.id !== newsItem.id)
    setPendingNews(updatedPendingNews)
    setNews([...news, { ...newsItem, status: "Aktif", author: newsItem.author || "Adsız Yazar" }])
  }

  const handleRejectNews = (id: number) => {
    setPendingNews(pendingNews.filter(item => item.id !== id))
  }

  const [newNews, setNewNews] = useState<NewNewsType>({
    title: "",
    content: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    status: "Taslak",
    image: "",
    sourceUrl: "",
    author: ""
  });

  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [selectedPendingNews, setSelectedPendingNews] = useState<News | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"title" | "content" | "category">("title");
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    status: string[];
  }>({
    category: [],
    status: []
  });

  const handleAddNews = () => {
    if (!newNews.title || !newNews.content || !newNews.category) {
      return;
    }

    const newsItem: News = {
      id: Date.now(),
      ...newNews,
      views: 0
    };
    setNews([...news, newsItem]);
    setNewNews({
      title: "",
      content: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      status: "Taslak",
      image: "",
      sourceUrl: "",
      author: ""
    });
    setIsUrlDialogOpen(false);
  };

  const handleEditNews = () => {
    if (!editingNews) return;

    setNews(news.map(item => 
      item.id === editingNews.id ? editingNews : item
    ));
    setEditingNews(null);
  };

  const handleDeleteNews = (id: number) => {
    setNews(news.filter(item => item.id !== id));
    if (selectedNews && selectedNews.id === id) {
      setSelectedNews(news.length > 1 ? news.find(item => item.id !== id) || null : null);
    }
  };

  const handleFilterChange = (type: 'category' | 'status', value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [type]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      }
    });
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item[searchField].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedFilters.category.length === 0 || 
      selectedFilters.category.includes(item.category);

    const matchesStatus = selectedFilters.status.length === 0 || 
      selectedFilters.status.includes(item.status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Automatically select the first news item from filtered list
  useEffect(() => {
    if (filteredNews.length > 0 && 
        (!selectedNews || !filteredNews.some(n => n.id === selectedNews.id))) {
      setSelectedNews(filteredNews[0]);
    } else if (filteredNews.length === 0 && selectedNews) {
      setSelectedNews(null);
    }
  }, [filteredNews, selectedNews]);

  const getTotalSelectedFilters = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const getStatusColor = (status: News['status']) => {
    switch (status) {
      case "Aktif":
        return "border-green-500 text-green-600";
      case "Pasif":
        return "border-gray-500 text-gray-600";
      case "Taslak":
        return "border-yellow-500 text-yellow-600";
      case "Onay Bekliyor":
        return "border-blue-500 text-blue-600";
      default:
        return "border-gray-500 text-gray-600";
    }
  };

  const handleStatusChange = (value: NewsStatus) => {
    setNewNews({
      ...newNews,
      status: value
    });
  };

  const handleEditingStatusChange = (value: NewsStatus) => {
    if (editingNews) {
      setEditingNews({
        ...editingNews,
        status: value
      });
    } else if (selectedNews) {
      setSelectedNews({
        ...selectedNews,
        status: value
      });
    } else if (selectedPendingNews) {
      setSelectedPendingNews({
        ...selectedPendingNews,
        status: value
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setNewNews({
      ...newNews,
      category: value
    });
  };

  const handleEditingCategoryChange = (value: string) => {
    if (editingNews) {
      setEditingNews({
        ...editingNews,
        category: value
      });
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Haberler</h1>
        <div className="flex gap-2">
          <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="mr-2 h-4 w-4" />
                Haber Kaynağı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Haber Kaynağı Ekle</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sourceUrl" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="sourceUrl"
                    placeholder="Haber sitesi URL'si"
                    className="col-span-3"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                  />
                </div>
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Haber bilgileri çekiliyor...</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUrlDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddSource} disabled={isLoading || !sourceUrl.trim()}>
                  {isLoading ? "Çekiliyor..." : "Ekle"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni haber ekle
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
                  <Label htmlFor="image">Görsel URL</Label>
                  <Input
                    id="image"
                    value={newNews.image}
                    onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="status">Durum</Label>
                  <Select
                    value={newNews.status}
                    onValueChange={(value: string) => {
                      handleStatusChange(value as NewsStatus);
                    }}
                  >
                    <SelectTrigger id="news-status" className="w-full">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Pasif">Pasif</SelectItem>
                      <SelectItem value="Taslak">Taslak</SelectItem>
                      <SelectItem value="Onay Bekliyor">Onay Bekliyor</SelectItem>
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
      </div>

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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Filtrele {getTotalSelectedFilters() > 0 ? `(${getTotalSelectedFilters()})` : ''}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Filtreleme Seçenekleri</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                          <h4 className="font-medium">Kategori</h4>
                          <div className="space-y-2">
                            {['Futbol', 'Basketbol', 'Voleybol'].map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`category-${category}`}
                                  checked={selectedFilters.category.includes(category)}
                                  onChange={() => handleFilterChange('category', category)}
                                  className="h-4 w-4"
                                />
                                <label htmlFor={`category-${category}`}>{category}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-medium">Durum</h4>
                          <div className="space-y-2">
                            {['Aktif', 'Pasif'].map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`status-${status}`}
                                  checked={selectedFilters.status.includes(status)}
                                  onChange={() => handleFilterChange('status', status)}
                                  className="h-4 w-4"
                                />
                                <label htmlFor={`status-${status}`}>{status}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="overflow-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</TableHead>
                      <TableHead className="py-3 px-4 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {filteredNews.map((item) => (
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
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="relative h-12 w-20 rounded-md overflow-hidden">
                            <Image
                              src={item.image || "/images/default-news.jpg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString('tr-TR')}</td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
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

          {pendingNews.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Onay Bekleyen Haberler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingNews.map((item) => (
                    <div 
                      key={item.id} 
                      className={`
                        border rounded-lg p-4 cursor-pointer
                        ${selectedPendingNews?.id === item.id ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => {
                        setSelectedPendingNews(item);
                        setSelectedNews(null);
                      }}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.category} | {item.date}</p>
                          {item.sourceUrl && (
                            <a 
                              href={item.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Kaynak: {item.sourceUrl}
                            </a>
                          )}
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="relative h-24 w-36 rounded-md overflow-hidden">
                            <Image
                              src={item.image || "/images/default-news.jpg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveNews(item);
                              }}
                            >
                              Onayla
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectNews(item.id);
                              }}
                            >
                              Reddet
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
                  disabled={!selectedNews && !selectedPendingNews}
                  onClick={() => setViewMode("edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedNews || selectedPendingNews ? (
                viewMode === "preview" ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold">{(selectedNews || selectedPendingNews)?.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {(selectedNews || selectedPendingNews)?.category} | {(selectedNews || selectedPendingNews)?.date}
                        </p>
                        {(selectedNews || selectedPendingNews)?.sourceUrl && (
                          <a 
                            href={(selectedNews || selectedPendingNews)?.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            Kaynak: {(selectedNews || selectedPendingNews)?.sourceUrl}
                          </a>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor((selectedNews || selectedPendingNews)?.status || "Aktif")}>
                        {(selectedNews || selectedPendingNews)?.status}
                      </Badge>
                    </div>
                    {(selectedNews || selectedPendingNews)?.image && (
                      <div className="relative h-48 w-full rounded-md overflow-hidden">
                        <Image
                          src={(selectedNews || selectedPendingNews)?.image || "/images/default-news.jpg"}
                          alt={(selectedNews || selectedPendingNews)?.title || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="prose max-w-none">
                      {(selectedNews || selectedPendingNews)?.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-title">Başlık</Label>
                        <Input
                          id="edit-title"
                          value={selectedNews?.title || selectedPendingNews?.title}
                          onChange={(e) => {
                            if (selectedNews) {
                              setSelectedNews({ ...selectedNews, title: e.target.value });
                            } else if (selectedPendingNews) {
                              setSelectedPendingNews({ ...selectedPendingNews, title: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-content">İçerik</Label>
                        <Textarea
                          id="edit-content"
                          value={selectedNews?.content || selectedPendingNews?.content}
                          onChange={(e) => {
                            if (selectedNews) {
                              setSelectedNews({ ...selectedNews, content: e.target.value });
                            } else if (selectedPendingNews) {
                              setSelectedPendingNews({ ...selectedPendingNews, content: e.target.value });
                            }
                          }}
                          className="min-h-[150px]"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-category">Kategori</Label>
                        <Select
                          value={selectedNews?.category || selectedPendingNews?.category || ""}
                          onValueChange={(value) => {
                            if (selectedNews) {
                              setSelectedNews({ ...selectedNews, category: value });
                            } else if (selectedPendingNews) {
                              setSelectedPendingNews({ ...selectedPendingNews, category: value });
                            }
                          }}
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
                          value={selectedNews?.date || selectedPendingNews?.date}
                          onChange={(e) => {
                            if (selectedNews) {
                              setSelectedNews({ ...selectedNews, date: e.target.value });
                            } else if (selectedPendingNews) {
                              setSelectedPendingNews({ ...selectedPendingNews, date: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-image">Görsel URL</Label>
                        <Input
                          id="edit-image"
                          value={selectedNews?.image || selectedPendingNews?.image}
                          onChange={(e) => {
                            if (selectedNews) {
                              setSelectedNews({ ...selectedNews, image: e.target.value });
                            } else if (selectedPendingNews) {
                              setSelectedPendingNews({ ...selectedPendingNews, image: e.target.value });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="editStatus">Durum</Label>
                        <Select
                          value={editingNews?.status || ""}
                          onValueChange={(value: string) => {
                            handleEditingStatusChange(value as NewsStatus);
                          }}
                        >
                          <SelectTrigger id="edit-news-status" className="w-full">
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Pasif">Pasif</SelectItem>
                            <SelectItem value="Taslak">Taslak</SelectItem>
                            <SelectItem value="Onay Bekliyor">Onay Bekliyor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => {
                          if (selectedNews || selectedPendingNews) {
                            if (selectedNews) {
                              setNews(news.map(item => 
                                item.id === selectedNews.id ? selectedNews : item
                              ));
                            } else if (selectedPendingNews) {
                              setPendingNews(pendingNews.filter(item => item.id !== selectedPendingNews.id));
                              setNews([...news, selectedPendingNews]);
                            }
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
    </div>
  );
} 