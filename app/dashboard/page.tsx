"use client"

import React, { useState, useEffect } from "react"
import { format, addMonths, subMonths, isSameMonth, isWithinInterval, parseISO, subDays, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Newspaper, Megaphone, TrendingUp, User, Activity, Download, ChevronRight, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import type { DateRange } from "react-day-picker"
import { useToast } from "@/components/ui/use-toast"
import useAuth from "@/lib/hooks/useAuth"
import { Separator } from "@/components/ui/separator"

// Farklı tarihlerdeki verileri simüle eden objeler
const statsData = {
  current: {
    events: 45,
    news: 32,
    announcements: 27,
    users: 320,
    eventPercentage: 2.5,
    newsPercentage: 12.3,
    announcementPercentage: 5.1,
    userPercentage: 8.2,
    // Spor yüzdeleri
    sportsPercentages: {
      football: 45,
      basketball: 30,
      volleyball: 15,
      swimming: 10
    },
    // Etkinlik analizleri
    eventAnalysis: [
      { name: "İlkbahar Futbol Kupası", date: "15 Nisan 2024", participants: 120, satisfaction: 94 },
      { name: "Basketbol Turnuvası", date: "22 Nisan 2024", participants: 86, satisfaction: 88 },
      { name: "Voleybol Günleri", date: "10 Nisan 2024", participants: 64, satisfaction: 92 }
    ],
    // Son etkinlikler
    latestEvents: [
      { name: "Futbol Turnuvası", date: "15 Nisan 2024" },
      { name: "Basketbol Maçı", date: "20 Nisan 2024" }
    ],
    // Son haberler
    latestNews: [
      { title: "Fenerbahçe'den Muhteşem Galibiyet", date: "15 Nisan 2024" },
      { title: "Basketbolda Büyük Başarı", date: "14 Nisan 2024" }
    ],
    // Son duyurular
    latestAnnouncements: [
      { title: "Spor Tesisi Bakım Çalışması", content: "20-22 Nisan tarihleri arasında spor tesisimizde bakım çalışması yapılacaktır." },
      { title: "Yaz Spor Okulu Kayıtları", content: "2024 yaz spor okulu kayıtları başlamıştır. Son başvuru tarihi 30 Nisan 2024'tür." }
    ],
    // Egzersiz dakikaları
    exerciseMinutes: [
      { name: "Pazartesi", minutes: 45 },
      { name: "Salı", minutes: 30 },
      { name: "Çarşamba", minutes: 60 },
      { name: "Perşembe", minutes: 15 },
      { name: "Cuma", minutes: 75 },
      { name: "Cumartesi", minutes: 90 },
      { name: "Pazar", minutes: 40 }
    ],
    // Tarih bazlı spor verileri
    sportsByDate: [
      {
        date: format(subDays(new Date(), 4), "dd.MM.yyyy"),
        Futbol: 12,
        Basketbol: 8,
        Voleybol: 5,
        Yüzme: 3,
      },
      {
        date: format(subDays(new Date(), 3), "dd.MM.yyyy"),
        Futbol: 15,
        Basketbol: 10,
        Voleybol: 7,
        Yüzme: 4,
      },
      {
        date: format(subDays(new Date(), 2), "dd.MM.yyyy"),
        Futbol: 10,
        Basketbol: 12,
        Voleybol: 8,
        Yüzme: 6,
      },
      {
        date: format(subDays(new Date(), 1), "dd.MM.yyyy"),
        Futbol: 18,
        Basketbol: 14,
        Voleybol: 9,
        Yüzme: 5,
      },
      {
        date: format(new Date(), "dd.MM.yyyy"),
        Futbol: 20,
        Basketbol: 15,
        Voleybol: 10,
        Yüzme: 7,
      },
    ],
  },
  previousMonth: {
    events: 36,
    news: 25,
    announcements: 22,
    users: 296,
    eventPercentage: -1.2,
    newsPercentage: 5.6,
    announcementPercentage: 1.9,
    userPercentage: 4.3,
    // Spor yüzdeleri
    sportsPercentages: {
      football: 42,
      basketball: 28,
      volleyball: 18,
      swimming: 12
    },
    // Etkinlik analizleri
    eventAnalysis: [
      { name: "Kış Futbol Kupası", date: "15 Mart 2024", participants: 110, satisfaction: 91 },
      { name: "Basketbol Dostluk Maçı", date: "22 Mart 2024", participants: 76, satisfaction: 85 },
      { name: "Voleybol Turnuvası", date: "10 Mart 2024", participants: 58, satisfaction: 89 }
    ],
    // Son etkinlikler
    latestEvents: [
      { name: "Futbol Hazırlık Maçı", date: "15 Mart 2024" },
      { name: "Basketbol Antrenmanı", date: "20 Mart 2024" }
    ],
    // Son haberler
    latestNews: [
      { title: "Galatasaray'dan Kritik Galibiyet", date: "15 Mart 2024" },
      { title: "Voleybolda Büyük Başarı", date: "14 Mart 2024" }
    ],
    // Son duyurular
    latestAnnouncements: [
      { title: "Bahar Turnuvası", content: "20-22 Mart tarihleri arasında bahar turnuvası düzenlenecektir." },
      { title: "Tesis Yenileme Çalışmaları", content: "Mart ayı içerisinde tesis yenileme çalışmaları tamamlanacaktır." }
    ],
    // Egzersiz dakikaları
    exerciseMinutes: [
      { name: "Pazartesi", minutes: 40 },
      { name: "Salı", minutes: 25 },
      { name: "Çarşamba", minutes: 50 },
      { name: "Perşembe", minutes: 10 },
      { name: "Cuma", minutes: 65 },
      { name: "Cumartesi", minutes: 80 },
      { name: "Pazar", minutes: 35 }
    ],
    // Tarih bazlı spor verileri
    sportsByDate: [
      {
        date: format(subDays(subMonths(new Date(), 1), 4), "dd.MM.yyyy"),
        Futbol: 8,
        Basketbol: 6,
        Voleybol: 4,
        Yüzme: 2,
      },
      {
        date: format(subDays(subMonths(new Date(), 1), 3), "dd.MM.yyyy"),
        Futbol: 11,
        Basketbol: 9,
        Voleybol: 5,
        Yüzme: 3,
      },
      {
        date: format(subDays(subMonths(new Date(), 1), 2), "dd.MM.yyyy"),
        Futbol: 9,
        Basketbol: 10,
        Voleybol: 6,
        Yüzme: 4,
      },
      {
        date: format(subDays(subMonths(new Date(), 1), 1), "dd.MM.yyyy"),
        Futbol: 14,
        Basketbol: 12,
        Voleybol: 7,
        Yüzme: 3,
      },
      {
        date: format(subMonths(new Date(), 1), "dd.MM.yyyy"),
        Futbol: 17,
        Basketbol: 13,
        Voleybol: 8,
        Yüzme: 5,
      },
    ],
  },
  twoMonthsAgo: {
    events: 30,
    news: 18,
    announcements: 19,
    users: 275,
    eventPercentage: 0.8,
    newsPercentage: 2.1,
    announcementPercentage: -0.5,
    userPercentage: 3.7,
    // Spor yüzdeleri
    sportsPercentages: {
      football: 40,
      basketball: 25,
      volleyball: 20,
      swimming: 15
    },
    // Etkinlik analizleri
    eventAnalysis: [
      { name: "Şubat Futbol Oyunları", date: "15 Şubat 2024", participants: 95, satisfaction: 87 },
      { name: "Basketbol Karşılaşması", date: "22 Şubat 2024", participants: 68, satisfaction: 82 },
      { name: "Voleybol Antrenmanı", date: "10 Şubat 2024", participants: 52, satisfaction: 88 }
    ],
    // Son etkinlikler
    latestEvents: [
      { name: "Futbol Karşılaşması", date: "15 Şubat 2024" },
      { name: "Basketbol Özel Maçı", date: "20 Şubat 2024" }
    ],
    // Son haberler
    latestNews: [
      { title: "Beşiktaş Liderliği Devraldı", date: "15 Şubat 2024" },
      { title: "Basketbolda Yeni Yıldızlar", date: "14 Şubat 2024" }
    ],
    // Son duyurular
    latestAnnouncements: [
      { title: "Kış Spor Etkinlikleri", content: "Şubat ayı boyunca kış spor etkinlikleri düzenlenecektir." },
      { title: "Spor Ekipmanı Yenileme", content: "Şubat ayında tüm spor ekipmanları yenilenecektir." }
    ],
    // Egzersiz dakikaları
    exerciseMinutes: [
      { name: "Pazartesi", minutes: 35 },
      { name: "Salı", minutes: 20 },
      { name: "Çarşamba", minutes: 45 },
      { name: "Perşembe", minutes: 10 },
      { name: "Cuma", minutes: 55 },
      { name: "Cumartesi", minutes: 70 },
      { name: "Pazar", minutes: 30 }
    ],
    // Tarih bazlı spor verileri
    sportsByDate: [
      {
        date: format(subDays(subMonths(new Date(), 2), 4), "dd.MM.yyyy"),
        Futbol: 7,
        Basketbol: 5,
        Voleybol: 3,
        Yüzme: 1,
      },
      {
        date: format(subDays(subMonths(new Date(), 2), 3), "dd.MM.yyyy"),
        Futbol: 9,
        Basketbol: 7,
        Voleybol: 4,
        Yüzme: 2,
      },
      {
        date: format(subDays(subMonths(new Date(), 2), 2), "dd.MM.yyyy"),
        Futbol: 8,
        Basketbol: 9,
        Voleybol: 5,
        Yüzme: 3,
      },
      {
        date: format(subDays(subMonths(new Date(), 2), 1), "dd.MM.yyyy"),
        Futbol: 12,
        Basketbol: 10,
        Voleybol: 6,
        Yüzme: 2,
      },
      {
        date: format(subMonths(new Date(), 2), "dd.MM.yyyy"),
        Futbol: 14,
        Basketbol: 11,
        Voleybol: 7,
        Yüzme: 4,
      },
    ],
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogType = searchParams.get('dialog');
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  const [date, setDate] = useState(new Date())
  const [stats, setStats] = useState(statsData.current)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  })

  // Daha fazla örnek veri oluşturalım
  const allEvents = [
    { id: "1", name: "Futbol Turnuvası", date: "15 Nisan 2024" },
    { id: "2", name: "Basketbol Maçı", date: "20 Nisan 2024" },
    { id: "3", name: "Yüzme Yarışması", date: "18 Nisan 2024" },
    { id: "4", name: "Tenis Turnuvası", date: "16 Nisan 2024" },
    { id: "5", name: "Atletizm Koşusu", date: "14 Nisan 2024" },
    { id: "6", name: "Bisiklet Turu", date: "12 Nisan 2024" },
    { id: "7", name: "Halı Saha Maçı", date: "10 Nisan 2024" },
  ];

  const allNews = [
    { id: "1", title: "Fenerbahçe'den Muhteşem Galibiyet", date: "15 Nisan 2024" },
    { id: "2", title: "Basketbolda Büyük Başarı", date: "14 Nisan 2024" },
    { id: "3", title: "Yeni Spor Tesisi Açıldı", date: "13 Nisan 2024" },
    { id: "4", title: "Spor Kulübü Başarıları", date: "12 Nisan 2024" },
    { id: "5", title: "Ulusal Turnuva Haberleri", date: "11 Nisan 2024" },
    { id: "6", title: "Basketbol Milli Takımı", date: "10 Nisan 2024" },
    { id: "7", title: "Yüzücülerimizin Başarısı", date: "09 Nisan 2024" },
  ];

  const allAnnouncements = [
    { id: "1", title: "Spor Tesisi Bakım Çalışması", content: "20-22 Nisan tarihleri arasında spor tesisimizde bakım çalışması yapılacaktır." },
    { id: "2", title: "Yaz Spor Okulu Kayıtları", content: "2024 yaz spor okulu kayıtları başlamıştır. Son başvuru tarihi 30 Nisan 2024'tür." },
    { id: "3", title: "Yaz Spor Okulu Programı", content: "Yaz spor okulu kayıtları ve program detayları açıklandı." },
    { id: "4", title: "Bakım Çalışması Ertelendi", content: "Planlanan bakım çalışması ileri bir tarihe ertelenmiştir." },
    { id: "5", title: "Yeni Eğitmen Alımı", content: "Spor tesisimiz için yeni eğitmenler alınacaktır." },
    { id: "6", title: "Üyelik Yenileme Duyurusu", content: "Üyelik yenileme işlemleri başlamıştır." },
    { id: "7", title: "Etkinlik İptali", content: "22 Nisan tarihindeki etkinlik iptal edilmiştir." },
  ];

  // Son 24 saat içindeki içerikleri filtreleyen yardımcı fonksiyon
  // Helper function that filters content from the last 24 hours
  const getLast24HoursItems = () => {
    const last24Hours = subDays(new Date(), 1);

    // Tüm veri kümesinden son 24 saatteki öğeleri filtreleme
    // Filtering items from the last 24 hours from the entire dataset
    const last24HoursEvents = allEvents.filter(event => {
      // Tarih string'ini Date objesine çevirme
      const eventDate = new Date(event.date.split(' ')[0] + ' ' + new Date().getFullYear());
      return eventDate >= last24Hours;
    });

    const last24HoursNews = allNews.filter(news => {
      const newsDate = new Date(news.date.split(' ')[0] + ' ' + new Date().getFullYear());
      return newsDate >= last24Hours;
    });

    const last24HoursAnnouncements = allAnnouncements;

    return { last24HoursEvents, last24HoursNews, last24HoursAnnouncements };
  };

  // Son 24 saatteki içerikler
  // Content from the last 24 hours

  // Tarih aralığı değiştiğinde istatistikleri güncelle
  useEffect(() => {
    if (!selectedDateRange?.from) {
      setStats(statsData.current)
      return
    }

    const currentMonth = new Date()
    const prevMonth = subMonths(new Date(), 1)
    const twoPrevMonth = subMonths(new Date(), 2)

    // Sadece başlangıç tarihi seçilmişse, o aya göre veri göster
    if (!selectedDateRange.to) {
      if (isSameMonth(selectedDateRange.from, currentMonth)) {
        setStats(statsData.current)
      } else if (isSameMonth(selectedDateRange.from, prevMonth)) {
        setStats(statsData.previousMonth)
      } else if (isSameMonth(selectedDateRange.from, twoPrevMonth)) {
        setStats(statsData.twoMonthsAgo)
      } else {
        generateRandomStats(selectedDateRange.from)
      }
      return
    }

    // Tarih aralığı seçilmişse, bu aralığa göre özel veri oluştur
    // Gerçek uygulamada burada API çağrısı yapılabilir
    generateRangeStats(selectedDateRange)

  }, [selectedDateRange])

  // Rastgele veri oluşturan fonksiyon
  const generateRandomStats = (date: Date) => {
    // Son 5 gün için spor verileri oluştur
    const sportsByDate = [];
    for (let i = 4; i >= 0; i--) {
      sportsByDate.push({
        date: format(subDays(date, i), "dd.MM.yyyy"),
        Futbol: Math.floor(Math.random() * 15) + 5,
        Basketbol: Math.floor(Math.random() * 12) + 5,
        Voleybol: Math.floor(Math.random() * 10) + 3,
        Yüzme: Math.floor(Math.random() * 8) + 1,
      });
    }

    setStats({
      events: Math.floor(Math.random() * 50) + 20,
      news: Math.floor(Math.random() * 30) + 15,
      announcements: Math.floor(Math.random() * 30) + 15,
      users: Math.floor(Math.random() * 100) + 200,
      eventPercentage: +(Math.random() * 5 - 2.5).toFixed(1),
      newsPercentage: +(Math.random() * 10).toFixed(1),
      announcementPercentage: +(Math.random() * 5).toFixed(1),
      userPercentage: +(Math.random() * 8).toFixed(1),
      sportsPercentages: {
        football: Math.floor(Math.random() * 30) + 20,
        basketball: Math.floor(Math.random() * 20) + 20,
        volleyball: Math.floor(Math.random() * 20) + 10,
        swimming: Math.floor(Math.random() * 15) + 5,
      },
      eventAnalysis: [
        {
          name: "Futbol Etkinliği",
          date: format(date, "d MMMM yyyy", { locale: tr }),
          participants: Math.floor(Math.random() * 50) + 50,
          satisfaction: Math.floor(Math.random() * 15) + 80
        },
        {
          name: "Basketbol Etkinliği",
          date: format(date, "d MMMM yyyy", { locale: tr }),
          participants: Math.floor(Math.random() * 40) + 40,
          satisfaction: Math.floor(Math.random() * 15) + 80
        },
        {
          name: "Voleybol Etkinliği",
          date: format(date, "d MMMM yyyy", { locale: tr }),
          participants: Math.floor(Math.random() * 30) + 30,
          satisfaction: Math.floor(Math.random() * 15) + 80
        }
      ],
      latestEvents: [
        { name: "Spor Etkinliği 1", date: format(date, "d MMMM yyyy", { locale: tr }) },
        { name: "Spor Etkinliği 2", date: format(date, "d MMMM yyyy", { locale: tr }) }
      ],
      latestNews: [
        { title: "Spor Haberi 1", date: format(date, "d MMMM yyyy", { locale: tr }) },
        { title: "Spor Haberi 2", date: format(date, "d MMMM yyyy", { locale: tr }) }
      ],
      latestAnnouncements: [
        { title: "Duyuru 1", content: "Duyuru içeriği 1" },
        { title: "Duyuru 2", content: "Duyuru içeriği 2" }
      ],
      exerciseMinutes: [
        { name: "Pazartesi", minutes: Math.floor(Math.random() * 60) + 15 },
        { name: "Salı", minutes: Math.floor(Math.random() * 60) + 15 },
        { name: "Çarşamba", minutes: Math.floor(Math.random() * 60) + 15 },
        { name: "Perşembe", minutes: Math.floor(Math.random() * 60) + 15 },
        { name: "Cuma", minutes: Math.floor(Math.random() * 60) + 15 },
        { name: "Cumartesi", minutes: Math.floor(Math.random() * 60) + 15 },
        { name: "Pazar", minutes: Math.floor(Math.random() * 60) + 15 }
      ],
      sportsByDate,
    })
  }

  // Tarih aralığına göre özel veri oluşturan fonksiyon
  const generateRangeStats = (range: DateRange) => {
    if (!range.from || !range.to) return;

    // Gün farkına göre veri ölçeklendirme
    const diffFactor = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
    const maxDays = Math.min(diffFactor, 10); // En fazla 10 gün göster

    // Tarih aralığı için spor verileri oluştur
    const sportsByDate = [];
    for (let i = 0; i < maxDays; i++) {
      const currentDate = addDays(range.from, i);
      if (currentDate > range.to) break;

      sportsByDate.push({
        date: format(currentDate, "dd.MM.yyyy"),
        Futbol: Math.floor(Math.random() * 15) + 5,
        Basketbol: Math.floor(Math.random() * 12) + 5,
        Voleybol: Math.floor(Math.random() * 10) + 3,
        Yüzme: Math.floor(Math.random() * 8) + 1,
      });
    }

    setStats({
      events: Math.floor(Math.random() * 50 * diffFactor / 10) + 20,
      news: Math.floor(Math.random() * 30 * diffFactor / 10) + 15,
      announcements: Math.floor(Math.random() * 30 * diffFactor / 10) + 15,
      users: Math.floor(Math.random() * 100 * diffFactor / 30) + 200,
      eventPercentage: +(Math.random() * 5 - 2.5).toFixed(1),
      newsPercentage: +(Math.random() * 10).toFixed(1),
      announcementPercentage: +(Math.random() * 5).toFixed(1),
      userPercentage: +(Math.random() * 8).toFixed(1),
      sportsPercentages: {
        football: Math.floor(Math.random() * 30 * diffFactor / 10) + 20,
        basketball: Math.floor(Math.random() * 20 * diffFactor / 10) + 20,
        volleyball: Math.floor(Math.random() * 20 * diffFactor / 10) + 10,
        swimming: Math.floor(Math.random() * 15 * diffFactor / 10) + 5,
      },
      eventAnalysis: [
        {
          name: "Futbol Etkinliği",
          date: `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`,
          participants: Math.floor(Math.random() * 50 * diffFactor / 10) + 50,
          satisfaction: Math.floor(Math.random() * 15) + 80
        },
        {
          name: "Basketbol Etkinliği",
          date: `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`,
          participants: Math.floor(Math.random() * 40 * diffFactor / 10) + 40,
          satisfaction: Math.floor(Math.random() * 15) + 80
        },
        {
          name: "Voleybol Etkinliği",
          date: `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`,
          participants: Math.floor(Math.random() * 30 * diffFactor / 10) + 30,
          satisfaction: Math.floor(Math.random() * 15) + 80
        }
      ],
      latestEvents: [
        { name: "Spor Etkinliği 1", date: format(range.to, "d MMMM yyyy", { locale: tr }) },
        { name: "Spor Etkinliği 2", date: format(range.from, "d MMMM yyyy", { locale: tr }) }
      ],
      latestNews: [
        { title: "Spor Haberi 1", date: format(range.to, "d MMMM yyyy", { locale: tr }) },
        { title: "Spor Haberi 2", date: format(range.from, "d MMMM yyyy", { locale: tr }) }
      ],
      latestAnnouncements: [
        { title: `Tarih Aralığı Duyurusu: ${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM yyyy", { locale: tr })}`, content: "Bu tarih aralığındaki duyurular" },
        { title: "Önemli Duyuru", content: "Tarih aralığı için önemli bilgilendirme" }
      ],
      exerciseMinutes: [
        { name: "Pazartesi", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 },
        { name: "Salı", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 },
        { name: "Çarşamba", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 },
        { name: "Perşembe", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 },
        { name: "Cuma", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 },
        { name: "Cumartesi", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 },
        { name: "Pazar", minutes: Math.floor(Math.random() * 60 * diffFactor / 7) + 15 }
      ],
      sportsByDate,
    })
  }

  // Kimlik doğrulama kontrolü
  useEffect(() => {
    // 500ms gecikme ile görsel geçiş ekleyelim
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.log("Dashboard: Kullanıcı giriş yapmamış!");
        setRedirecting(true);

        toast({
          title: "Erişim Engellendi",
          description: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
          variant: "destructive",
        });

        // Önce yönlendirme durumunu set et
        setTimeout(() => {
          // Tarayıcı konumunu doğrudan değiştir
          window.location.href = "/auth/login";
        }, 100);
      } else {
        setIsLoading(false);

        // Kullanıcı SuperAdmin mi kontrol et
        const checkSuperAdminStatus = async () => {
          try {
            const adminService = (await import('@/lib/services/adminService')).default;
            const response = await adminService.checkSuperAdminStatus();

            if (response.success) {
              setIsSuperAdmin(response.data.isSuperAdmin);
            }
          } catch (error) {
            console.error("SuperAdmin kontrolü sırasında hata:", error);
          }
        };

        checkSuperAdminStatus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
  };

  if (isLoading || redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin"></div>

      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {user?.first_name}</h1>
          <p className="text-muted-foreground mt-1">Spor etkinlikleri dünyasına katılmaya hazır mısınız?</p>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Etkinlikler"
          description="Tüm etkinlikleri görüntüle ve katıl"
          link="/events"
          linkText="Etkinlikleri Keşfet"
        />

        <DashboardCard
          title="Profil"
          description="Profil bilgilerinizi güncelleyin"
          link="/profile"
          linkText="Profil'e Git"
        />

        <DashboardCard
          title="Spor Dalları"
          description="Tüm spor dallarını keşfedin"
          link="/sports"
          linkText="Spor Dallarını Görüntüle"
        />

        {isSuperAdmin && (
          <DashboardCard
            title="Admin Yönetimi"
            description="Admin kullanıcılarını yönetin"
            link="/dashboard/admins"
            linkText="Admin Sayfasına Git"
          />
        )}
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

function DashboardCard({ title, description, link, linkText }: DashboardCardProps) {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-card">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link href={link}>
        <Button variant="outline" className="w-full">
          {linkText}
        </Button>
      </Link>
    </div>
  );
} 