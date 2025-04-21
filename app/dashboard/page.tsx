"use client"

import React, { useState, useEffect } from "react"
import { format, addMonths, subMonths, isSameMonth, isWithinInterval, parseISO, subDays, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Newspaper, Megaphone, TrendingUp, User, Activity, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { SportEventsChart } from "@/components/dashboard/sport-events-chart"
import type { DateRange } from "react-day-picker"

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined
  })
  const [stats, setStats] = useState(statsData.current)

  // Tarih aralığı değiştiğinde istatistikleri güncelle
  useEffect(() => {
    if (!dateRange?.from) {
      setStats(statsData.current)
      return
    }

    const currentMonth = new Date()
    const prevMonth = subMonths(new Date(), 1)
    const twoPrevMonth = subMonths(new Date(), 2)

    // Sadece başlangıç tarihi seçilmişse, o aya göre veri göster
    if (!dateRange.to) {
      if (isSameMonth(dateRange.from, currentMonth)) {
        setStats(statsData.current)
      } else if (isSameMonth(dateRange.from, prevMonth)) {
        setStats(statsData.previousMonth)
      } else if (isSameMonth(dateRange.from, twoPrevMonth)) {
        setStats(statsData.twoMonthsAgo)
      } else {
        generateRandomStats(dateRange.from)
      }
      return
    }

    // Tarih aralığı seçilmişse, bu aralığa göre özel veri oluştur
    // Gerçek uygulamada burada API çağrısı yapılabilir
    generateRangeStats(dateRange)
    
  }, [dateRange])

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

  return (
    <div className="space-y-6">
      {/* Header with Report Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gösterge Paneli</h2>
        <div className="flex items-center space-x-4">
          <DateRangePicker 
            dateRange={dateRange} 
            setDateRange={setDateRange}
            placeholder="Tarih Aralığı Seçin"
          />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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

      {/* Activity and Exercise Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Etkinlik Analizi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etkinlik</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Katılımcı</TableHead>
                  <TableHead>Memnuniyet %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.eventAnalysis.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.participants}</TableCell>
                    <TableCell>{event.satisfaction}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <SportEventsChart 
          className="col-span-1"
          title="Tarihe Göre Spor Etkinlikleri"
          description="Seçili tarih aralığında spor dallarına göre etkinlik sayıları"
          data={stats.sportsByDate}
          dateRange={dateRange}
        />
      </div>

      {/* Additional Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Son Etkinlikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.latestEvents.map((event, index) => (
                <div key={index} className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son Haberler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.latestNews.map((news, index) => (
                <div key={index} className="flex items-center">
                  <Newspaper className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">{news.title}</p>
                    <p className="text-xs text-muted-foreground">{news.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son Duyurular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.latestAnnouncements.map((announcement, index) => (
                <div key={index} className="flex items-center">
                  <Megaphone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium">{announcement.title}</p>
                    <p className="text-xs text-muted-foreground">{announcement.content.substring(0, 50)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 