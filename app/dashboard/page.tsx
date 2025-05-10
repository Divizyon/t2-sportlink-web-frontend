"use client"

import React, { useState, useEffect } from "react"
import { format, subMonths, isSameMonth, subDays, addDays } from "date-fns"
import { tr } from "date-fns/locale"
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

// jsPDF tipini genişlet
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

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

  const handleDatesChange = (range: DateRange | undefined) => {
    if (!range) return;

    setSelectedDateRange(range);
    generateRangeStats(range);
  };

  const [stats, setStats] = useState(statsData.current)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date()
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
  const { last24HoursEvents, last24HoursNews, last24HoursAnnouncements } = getLast24HoursItems();

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
      events: Math.floor(Math.random() * 50 * diffFactor/10) + 20,
      news: Math.floor(Math.random() * 30 * diffFactor/10) + 15,
      announcements: Math.floor(Math.random() * 30 * diffFactor/10) + 15,
      users: Math.floor(Math.random() * 100 * diffFactor/30) + 200,
      eventPercentage: +(Math.random() * 5 - 2.5).toFixed(1),
      newsPercentage: +(Math.random() * 10).toFixed(1),
      announcementPercentage: +(Math.random() * 5).toFixed(1),
      userPercentage: +(Math.random() * 8).toFixed(1),
      sportsPercentages: {
        football: Math.floor(Math.random() * 30 * diffFactor/10) + 20,
        basketball: Math.floor(Math.random() * 20 * diffFactor/10) + 20,
        volleyball: Math.floor(Math.random() * 20 * diffFactor/10) + 10,
        swimming: Math.floor(Math.random() * 15 * diffFactor/10) + 5,
      },
      eventAnalysis: [
        { 
          name: "Futbol Etkinliği", 
          date: `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`, 
          participants: Math.floor(Math.random() * 50 * diffFactor/10) + 50, 
          satisfaction: Math.floor(Math.random() * 15) + 80 
        },
        { 
          name: "Basketbol Etkinliği", 
          date: `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`, 
          participants: Math.floor(Math.random() * 40 * diffFactor/10) + 40, 
          satisfaction: Math.floor(Math.random() * 15) + 80 
        },
        { 
          name: "Voleybol Etkinliği", 
          date: `${format(range.from, "d MMM", { locale: tr })} - ${format(range.to, "d MMM", { locale: tr })}`, 
          participants: Math.floor(Math.random() * 30 * diffFactor/10) + 30, 
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
        { name: "Pazartesi", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 },
        { name: "Salı", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 },
        { name: "Çarşamba", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 },
        { name: "Perşembe", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 },
        { name: "Cuma", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 },
        { name: "Cumartesi", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 },
        { name: "Pazar", minutes: Math.floor(Math.random() * 60 * diffFactor/7) + 15 }
      ],
      sportsByDate,
    })
  }

  // PDF raporu oluşturma ve indirme fonksiyonu
  const generateAndDownloadReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    // Helper to replace Turkish chars with English
    const toEnglish = (str: string) =>
      str
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'O')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'U')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);

    // Title
    doc.setTextColor(41, 128, 185);
    doc.text(toEnglish('SportLink Gosterge Paneli Raporu'), 105, 20, { align: 'center' });

    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const dateRangeText = selectedDateRange?.from && selectedDateRange?.to
      ? `${format(selectedDateRange.from, 'dd.MM.yyyy')} - ${format(selectedDateRange.to, 'dd.MM.yyyy')}`
      : toEnglish('Tum Zamanlar');
    doc.text(`${toEnglish('Tarih Araligi')}: ${dateRangeText}`, 105, 30, { align: 'center' });

    // General Statistics
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text(toEnglish('Genel Istatistikler'), 20, 45);

    const statsData = [
      [toEnglish('Toplam Etkinlik'), stats.events.toString(), `${stats.eventPercentage > 0 ? '+' : ''}${stats.eventPercentage}%`],
      [toEnglish('Toplam Haber'), stats.news.toString(), `${stats.newsPercentage > 0 ? '+' : ''}${stats.newsPercentage}%`],
      [toEnglish('Toplam Duyuru'), stats.announcements.toString(), `${stats.announcementPercentage > 0 ? '+' : ''}${stats.announcementPercentage}%`],
      [toEnglish('Toplam Kullanici'), stats.users.toString(), `${stats.userPercentage > 0 ? '+' : ''}${stats.userPercentage}%`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [[toEnglish('Metik'), toEnglish('Deger'), toEnglish('Degisim')]],
      body: statsData,
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
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 }
      },
      margin: { left: 20, right: 20 }
    });

    // Sports Percentages
    doc.setFontSize(16);
    doc.text(toEnglish('Spor Dallari Dagilimi'), 20, doc.lastAutoTable.finalY + 15);

    const sportsData = Object.entries(stats.sportsPercentages).map(([sport, percentage]) => [
      toEnglish(sport.charAt(0).toUpperCase() + sport.slice(1)),
      `%${percentage}`
    ]);

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

    const latestEventsData = allEvents.slice(0, 5).map(event => [
      toEnglish(event.name),
      event.date
    ]);

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

    const latestNewsData = allNews.slice(0, 5).map(news => [
      toEnglish(news.title),
      news.date
    ]);

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

    const latestAnnouncementsData = allAnnouncements.slice(0, 5).map(announcement => [
      toEnglish(announcement.title),
      toEnglish(announcement.content)
    ]);

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
      didDrawPage: function(data) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          toEnglish('SportLink Gosterge Paneli'),
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    try {
      const fileName = `sportlink-rapor-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF olusturma hatasi:', error);
      alert('PDF olusturulurken bir hata olustu. Lutfen tekrar deneyin.');
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
  )
} 