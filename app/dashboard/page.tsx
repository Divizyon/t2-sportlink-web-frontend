"use client"

import React, { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Newspaper, Megaphone, User, Download, ChevronRight, ExternalLink } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { SportEventsChart } from "@/components/dashboard/sport-events-chart"
import { SportPopularityChart } from "@/components/dashboard/sport-popularity-chart"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DateRange } from "react-day-picker"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fetchDashboardData, fetchSportsByDateRange } from "@/lib/services/dashboardService"

// jsPDF tipini genişlet
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Fallback mock data for when API is unavailable
const fallbackStatsData = {
  events: 0,
  news: 0,
  announcements: 0,
  users: 0,
  eventPercentage: 0,
  newsPercentage: 0,
  announcementPercentage: 0,
  userPercentage: 0,
  sportsPercentages: {
    football: 0,
    basketball: 0,
    volleyball: 0,
    swimming: 0
  },
  latestEvents: [],
  latestNews: [],
  latestAnnouncements: [],
  sportsByDate: []
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogType = searchParams.get('dialog');

  // Dialog açık/kapalı durumları
  const [openDialogs, setOpenDialogs] = useState<{
    events: boolean;
    news: boolean;
    announcements: boolean;
  }>({
    events: false,
    news: false,
    announcements: false
  });

  // URL'den gelen dialog parametresine göre dialog durumunu ayarla
  useEffect(() => {
    if (dialogType) {
      setOpenDialogs({
        events: dialogType === 'events',
        news: dialogType === 'news',
        announcements: dialogType === 'announcements'
      });
    }
  }, [dialogType]);

  // Sayfa yüklendiğinde localStorage'dan son açık dialog kontrolü
  useEffect(() => {
    // Client-side'da çalıştığını kontrol et
    if (typeof window !== 'undefined') {
      const returnDialog = new URLSearchParams(window.location.search).get('returnDialog');
      const lastOpenDialog = localStorage.getItem('lastOpenDialog');

      // URL'de returnDialog parametresi varsa veya localStorage'da kayıt varsa
      if (returnDialog || lastOpenDialog) {
        const dialogToOpen = returnDialog || lastOpenDialog || '';

        // Dialog'u aç
        setOpenDialogs(prev => ({
          ...prev,
          events: dialogToOpen === 'events',
          news: dialogToOpen === 'news',
          announcements: dialogToOpen === 'announcements'
        }));

        // URL'yi güncelle
        router.push(`/dashboard?dialog=${dialogToOpen}`, { scroll: false });

        // Temizle
        localStorage.removeItem('lastOpenDialog');
      }
    }
  }, []); // Bu effect sadece sayfa yüklendiğinde çalışsın

  // Dialog durumu değiştiğinde URL'yi güncelle
  const handleDialogChange = (type: 'events' | 'news' | 'announcements', isOpen: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [type]: isOpen }));

    if (isOpen) {
      // Dialog açıldığında URL'yi güncelle
      router.push(`/dashboard?dialog=${type}`, { scroll: false });
    } else if (dialogType) {
      // Dialog kapandığında URL'den parametre kaldır
      router.push('/dashboard', { scroll: false });
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(fallbackStatsData);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allNews, setAllNews] = useState<any[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<any[]>([]);
  const [last24HoursEvents, setLast24HoursEvents] = useState<any[]>([]);
  const [last24HoursNews, setLast24HoursNews] = useState<any[]>([]);
  const [last24HoursAnnouncements, setLast24HoursAnnouncements] = useState<any[]>([]);

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date()
  });

  // Load initial dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardData();

        setStats(data);

        // Set all items data
        if (data.latestEvents) {
          setAllEvents(data.latestEvents);
          setLast24HoursEvents(data.latestEvents);
        }

        if (data.latestNews) {
          setAllNews(data.latestNews);
          setLast24HoursNews(data.latestNews);
        }

        if (data.latestAnnouncements) {
          setAllAnnouncements(data.latestAnnouncements);
          setLast24HoursAnnouncements(data.latestAnnouncements);
        }

        setError(null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleDatesChange = async (range: DateRange | undefined) => {
    if (!range) return;

    setSelectedDateRange(range);

    try {
      setIsLoading(true);

      // Fetch sport data for the selected date range
      const sportsData = await fetchSportsByDateRange(range);

      if (sportsData && sportsData.sportsByDate) {
        setStats(prevStats => ({
          ...prevStats,
          sportsByDate: sportsData.sportsByDate
        }));
      }

      setError(null);
    } catch (err) {
      console.error('Error loading data for date range:', err);
      setError('Failed to load data for the selected date range.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndDownloadReport = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');

      // Title
      doc.setFontSize(22);
      doc.text(`SportLink Gösterge Paneli Raporu`, 105, 20, { align: 'center' });

      doc.setFontSize(12);
      let dateText = '';

      if (selectedDateRange?.from && selectedDateRange?.to) {
        dateText = `${format(selectedDateRange.from, 'dd.MM.yyyy')} - ${format(selectedDateRange.to, 'dd.MM.yyyy')}`;
      } else if (selectedDateRange?.from) {
        dateText = `${format(selectedDateRange.from, 'dd.MM.yyyy')} tarihinden itibaren`;
      } else {
        dateText = `${format(new Date(), 'dd.MM.yyyy')} tarihinde`;
      }

      doc.text(`Rapor Tarihi: ${dateText}`, 105, 30, { align: 'center' });

      // Convert Turkish characters to English for PDF compatibility
      const toEnglish = (str: string) =>
        str
          .replace(/ç/g, 'c')
          .replace(/Ç/g, 'C')
          .replace(/ğ/g, 'g')
          .replace(/Ğ/g, 'G')
          .replace(/ı/g, 'i')
          .replace(/İ/g, 'I')
          .replace(/ö/g, 'o')
          .replace(/Ö/g, 'O')
          .replace(/ş/g, 's')
          .replace(/Ş/g, 'S')
          .replace(/ü/g, 'u')
          .replace(/Ü/g, 'U');

      // Analytics Summary
      doc.setFontSize(16);
      doc.text(toEnglish('Özet Istatistikler'), 20, 45);

      const overviewData = [
        [toEnglish('Gösterge'), toEnglish('Değer'), toEnglish('Değişim')],
        [toEnglish('Toplam Etkinlik'), stats.events.toString(), `${stats.eventPercentage > 0 ? '+' : ''}${stats.eventPercentage}%`],
        [toEnglish('Toplam Haber'), stats.news.toString(), `${stats.newsPercentage > 0 ? '+' : ''}${stats.newsPercentage}%`],
        [toEnglish('Toplam Duyuru'), stats.announcements.toString(), `${stats.announcementPercentage > 0 ? '+' : ''}${stats.announcementPercentage}%`],
        [toEnglish('Toplam Kullanıcı'), stats.users.toString(), `${stats.userPercentage > 0 ? '+' : ''}${stats.userPercentage}%`]
      ];

      autoTable(doc, {
        startY: 50,
        // @ts-ignore - Types are correct at runtime
        head: [overviewData[0]],
        body: overviewData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          halign: 'center'
        },
        margin: { left: 20, right: 20 }
      });

      // Sport Percentages
      doc.setFontSize(16);
      doc.text(toEnglish('Spor Dallari Dagilimi'), 20, doc.lastAutoTable.finalY + 15);

      // Handle potentially undefined sportsPercentages
      let sportsData: string[][] = [[toEnglish('Veri yok'), '']];

      if (stats.sportsPercentages && Object.keys(stats.sportsPercentages).length > 0) {
        sportsData = Object.entries(stats.sportsPercentages).map(([sport, percentage]) => [
          toEnglish(sport.charAt(0).toUpperCase() + sport.slice(1)),
          `%${percentage}`
        ]);
      }

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [[toEnglish('Spor Dali'), toEnglish('Yuzde')]],
        body: sportsData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40 }
        },
        margin: { left: 20, right: 20 }
      });

      // Latest Events
      doc.setFontSize(16);
      doc.text(toEnglish('Son Etkinlikler'), 20, doc.lastAutoTable.finalY + 15);

      const latestEventsData: string[][] = allEvents && allEvents.length > 0
        ? allEvents.slice(0, 5).map(event => [
          toEnglish(event.name || ''),
          event.date || ''
        ])
        : [[toEnglish('Veri yok'), '']];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [[toEnglish('Etkinlik'), toEnglish('Tarih')]],
        body: latestEventsData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40 }
        },
        margin: { left: 20, right: 20 }
      });

      // Latest News
      doc.setFontSize(16);
      doc.text(toEnglish('Son Haberler'), 20, doc.lastAutoTable.finalY + 15);

      const latestNewsData: string[][] = allNews && allNews.length > 0
        ? allNews.slice(0, 5).map(news => [
          toEnglish(news.title || ''),
          news.date || ''
        ])
        : [[toEnglish('Veri yok'), '']];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [[toEnglish('Haber'), toEnglish('Tarih')]],
        body: latestNewsData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40 }
        },
        margin: { left: 20, right: 20 }
      });

      // Latest Announcements
      doc.setFontSize(16);
      doc.text(toEnglish('Son Duyurular'), 20, doc.lastAutoTable.finalY + 15);

      const latestAnnouncementsData: string[][] = allAnnouncements && allAnnouncements.length > 0
        ? allAnnouncements.slice(0, 5).map(announcement => [
          toEnglish(announcement.title || ''),
          toEnglish(announcement.content || '')
        ])
        : [[toEnglish('Veri yok'), '']];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [[toEnglish('Baslik'), toEnglish('Icerik')]],
        body: latestAnnouncementsData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          halign: 'left',
          valign: 'middle',
          cellPadding: 5
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80 }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: function (data) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(
            toEnglish('SportLink Gosterge Paneli'),
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Save the file
      const fileName = `sportlink-rapor-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF oluşturulurken hata oluştu:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] overflow-y-auto pb-8 overflow-x-hidden max-w-full">
      {/* Header with Report Buttons */}
      <div className="flex items-center justify-between sticky top-0 bg-background py-4 z-10">
        <h2 className="text-3xl font-bold tracking-tight">Gösterge Paneli</h2>
        <div className="flex items-center space-x-4">
          <DateRangePicker
            dateRange={selectedDateRange}
            setDateRange={handleDatesChange}
            placeholder="Tarih Aralığı Seçin"
          />
          <Button onClick={generateAndDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Etkinlik</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events}</div>
            <p className="text-xs text-muted-foreground">
              {stats.eventPercentage > 0 ? "+" : ""}{stats.eventPercentage}% geçen aya göre
            </p>
          </CardContent>
        </Card>
        <Card className="transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Haber</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.news}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newsPercentage > 0 ? "+" : ""}{stats.newsPercentage}% geçen aya göre
            </p>
          </CardContent>
        </Card>
        <Card className="transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Duyuru</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.announcements}</div>
            <p className="text-xs text-muted-foreground">
              {stats.announcementPercentage > 0 ? "+" : ""}{stats.announcementPercentage}% geçen aya göre
            </p>
          </CardContent>
        </Card>
        <Card className="transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              {stats.userPercentage > 0 ? "+" : ""}{stats.userPercentage}% geçen aya göre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sports Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SportEventsChart
          className="md:col-span-1 lg:col-span-1"
          title="Tarihe Göre Spor Etkinlikleri"
          description="Seçili tarih aralığında spor dallarına göre etkinlik sayıları"
          data={stats.sportsByDate}
          dateRange={selectedDateRange}
        />

        <SportPopularityChart
          className="md:col-span-1 lg:col-span-1"
          title="Popüler Spor Dalları"
          description="En çok ilgi gören spor dalları"
          data={stats.sportsPercentages}
        />
      </div>

      {/* Additional Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Son Etkinlikler */}
        <Dialog open={openDialogs.events} onOpenChange={(isOpen) => handleDialogChange('events', isOpen)}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow etkinlikler-karti card-hover">
            <div
              className="w-full text-left"
              onClick={() => handleDialogChange('events', true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Son Etkinlikler (24 Saat)</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {last24HoursEvents.length > 0 ? (
                    allEvents.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{event.name}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Son 24 saatte etkinlik bulunmadı.</span>
                      <span className="text-sm text-muted-foreground">No events found in the last 24 hours.</span>
                    </>
                  )}
                </div>
              </CardContent>
              {allEvents.length > 5 && (
                <CardFooter className="flex justify-between pt-0">
                  <div />
                  <div className="flex items-center text-sm text-blue-600">
                    Tümünü Gör
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardFooter>
              )}
            </div>
          </Card>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tüm Etkinlikler</DialogTitle>
              <DialogDescription>Son dönemdeki tüm etkinliklerin listesi</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto mt-4">
              <div className="space-y-4">
                {allEvents.map((event, index) => (
                  <div key={index}>
                    <Link
                      href={`/dashboard/events?id=${event.id}&returnDialog=events`}
                      passHref
                      className="block"
                      onClick={() => {
                        localStorage.setItem('lastOpenDialog', 'events');
                      }}
                    >
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Son Haberler */}
        <Dialog open={openDialogs.news} onOpenChange={(isOpen) => handleDialogChange('news', isOpen)}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow haberler-karti card-hover">
            <div
              className="w-full text-left"
              onClick={() => handleDialogChange('news', true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Son Haberler (24 Saat)</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {last24HoursNews.length > 0 ? (
                    allNews.slice(0, 5).map((news, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{news.title}</p>
                          <p className="text-xs text-muted-foreground">{news.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Son 24 saatte haber bulunmadı.</span>
                      <span className="text-sm text-muted-foreground">No news found in the last 24 hours.</span>
                    </>
                  )}
                </div>
              </CardContent>
              {allNews.length > 5 && (
                <CardFooter className="flex justify-between pt-0">
                  <div />
                  <div className="flex items-center text-sm text-blue-600">
                    Tümünü Gör
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardFooter>
              )}
            </div>
          </Card>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tüm Haberler</DialogTitle>
              <DialogDescription>Son dönemdeki tüm haberlerin listesi</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto mt-4">
              <div className="space-y-4">
                {allNews.map((news, index) => (
                  <div key={index}>
                    <Link
                      href={`/dashboard/news?id=${news.id}&returnDialog=news`}
                      passHref
                      className="block"
                      onClick={() => {
                        localStorage.setItem('lastOpenDialog', 'news');
                      }}
                    >
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{news.title}</p>
                            <p className="text-xs text-muted-foreground">{news.date}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Son Duyurular */}
        <Dialog open={openDialogs.announcements} onOpenChange={(isOpen) => handleDialogChange('announcements', isOpen)}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow duyurular-karti card-hover">
            <div
              className="w-full text-left"
              onClick={() => handleDialogChange('announcements', true)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Son Duyurular (24 Saat)</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {last24HoursAnnouncements.length > 0 ? (
                    allAnnouncements.slice(0, 5).map((announcement, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{announcement.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Son 24 saatte duyuru bulunmadı.</span>
                      <span className="text-sm text-muted-foreground">No announcements found in the last 24 hours.</span>
                    </>
                  )}
                </div>
              </CardContent>
              {allAnnouncements.length > 5 && (
                <CardFooter className="flex justify-between pt-0">
                  <div />
                  <div className="flex items-center text-sm text-blue-600">
                    Tümünü Gör
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardFooter>
              )}
            </div>
          </Card>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tüm Duyurular</DialogTitle>
              <DialogDescription>Son dönemdeki tüm duyuruların listesi</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto mt-4">
              <div className="space-y-4">
                {allAnnouncements.map((announcement, index) => (
                  <div key={index}>
                    <Link
                      href={`/dashboard/announcements?id=${announcement.id}&returnDialog=announcements`}
                      passHref
                      className="block"
                      onClick={() => {
                        localStorage.setItem('lastOpenDialog', 'announcements');
                      }}
                    >
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{announcement.title}</p>
                            <p className="text-xs text-muted-foreground">{announcement.content}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 