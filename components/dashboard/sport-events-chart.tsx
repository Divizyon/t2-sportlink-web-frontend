"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from "recharts"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Filter, Check, Save, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { differenceInDays, differenceInWeeks, differenceInMonths, format, startOfWeek, startOfMonth, addDays, addWeeks, addMonths, isBefore, endOfWeek, endOfMonth } from "date-fns"
import { tr } from "date-fns/locale"

// Demo tarih verileri - gerçek verilerle değiştirilmeli
const defaultData = [
  {
    date: "01.04.2024",
    Futbol: 12,
    Basketbol: 8,
    Voleybol: 5,
    Yüzme: 3,
  },
  {
    date: "02.04.2024",
    Futbol: 15,
    Basketbol: 10,
    Voleybol: 7,
    Yüzme: 4,
  },
  {
    date: "03.04.2024",
    Futbol: 10,
    Basketbol: 12,
    Voleybol: 8,
    Yüzme: 6,
  },
  {
    date: "04.04.2024",
    Futbol: 18,
    Basketbol: 14,
    Voleybol: 9,
    Yüzme: 5,
  },
  {
    date: "05.04.2024",
    Futbol: 20,
    Basketbol: 15,
    Voleybol: 10,
    Yüzme: 7,
  },
]

// Spor dalları ve onlara atanmış renkler
const sportColors = {
  Futbol: "#ff6384",
  Basketbol: "#36a2eb",
  Voleybol: "#ffcd56",
  Yüzme: "#4bc0c0",
}

// Veri gruplama sınırları
const DAILY_TO_WEEKLY_THRESHOLD = 14; // 14 günden fazla ise haftalık göster
const WEEKLY_TO_MONTHLY_THRESHOLD = 8; // 8 haftadan fazla ise aylık göster
const MONTHLY_TO_YEARLY_THRESHOLD = 12; // 12 aydan fazla ise yıllık göster

export interface SportEventsChartProps {
  title?: string
  description?: string
  data?: typeof defaultData
  className?: string
  dateRange?: DateRange | undefined
}

export function SportEventsChart({ 
  title = "Tarihe Göre Spor Etkinlikleri", 
  description = "Seçilen tarihte spor dallarına göre etkinlik sayıları", 
  data: chartData = defaultData,
  className = "",
  dateRange
}: SportEventsChartProps) {
  // Mevcut verilerde bulunan tüm spor dallarını tespit eden yardımcı fonksiyon
  const getSportTypes = () => {
    if (!chartData || chartData.length === 0) return Object.keys(sportColors);
    
    const firstItem = chartData[0];
    return Object.keys(firstItem || {}).filter(key => key !== 'date');
  };
  
  // Mevcut spor dallarını bul
  const sportTypes = getSportTypes();
  
  // Başlangıç filter durumunu oluştur
  const initialFilters = sportTypes.reduce((acc, sport) => {
    acc[sport] = true;
    return acc;
  }, {} as Record<string, boolean>);
  
  // Hangi spor dallarının gösterileceğini izleyen state
  const [visibleSports, setVisibleSports] = useState<Record<string, boolean>>(initialFilters);
  
  // Dropdown içinde geçici olarak kullanılan filtreler
  const [tempVisibleSports, setTempVisibleSports] = useState<Record<string, boolean>>(initialFilters);
  
  // Dropdown açık mı?
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Gruplanmış veri state'i
  const [groupedData, setGroupedData] = useState(chartData);
  
  // Gruplama tipi state'i
  const [groupingType, setGroupingType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  // chartData değiştiğinde spor dallarını güncelle
  useEffect(() => {
    // Yeni spor dallarını al
    const currentSportTypes = getSportTypes();
    
    // Yeni filter durumunu oluştur, mevcut görünürlük durumlarını koru
    const updatedFilters: Record<string, boolean> = {};
    
    // Mevcut filtreleri koru
    currentSportTypes.forEach(sport => {
      updatedFilters[sport] = visibleSports[sport] !== undefined ? visibleSports[sport] : true;
    });
    
    // Filtreleri güncelle
    setVisibleSports(updatedFilters);
    if (!isDropdownOpen) {
      setTempVisibleSports({...updatedFilters});
    }
  }, [chartData]);

  // Dropdown açıldığında geçici filtreleri ayarla
  useEffect(() => {
    if (isDropdownOpen) {
      setTempVisibleSports({...visibleSports});
    }
  }, [isDropdownOpen]);

  // Spor dalı geçici görünürlüğünü değiştiren fonksiyon
  const toggleTempSportVisibility = (sport: string) => {
    setTempVisibleSports(prev => ({
      ...prev,
      [sport]: !prev[sport]
    }));
  };
  
  // Tüm spor dallarını aynı anda gösteren/gizleyen fonksiyon
  const toggleAllSports = (value: boolean) => {
    const updatedVisibleSports: Record<string, boolean> = {};
    sportTypes.forEach(sport => {
      updatedVisibleSports[sport] = value;
    });
    setTempVisibleSports(updatedVisibleSports);
  };
  
  // Filtreleri kaydetme fonksiyonu
  const saveFilters = () => {
    setVisibleSports({...tempVisibleSports});
    setIsDropdownOpen(false);
  };
  
  // Filtreleri iptal etme fonksiyonu
  const cancelFilters = () => {
    setTempVisibleSports({...visibleSports});
    setIsDropdownOpen(false);
  };
  
  // Görünür spor dallarının sayısını hesaplayan yardımcı fonksiyon
  const getVisibleSportsCount = () => {
    return Object.values(visibleSports).filter(Boolean).length;
  };
  
  // Tüm spor dalları seçili mi kontrol eden fonksiyon
  const isAllSelected = () => {
    return sportTypes.length > 0 && sportTypes.every(sport => tempVisibleSports[sport]);
  };
  
  // Hiçbir spor dalı seçili değil mi kontrol eden fonksiyon
  const isNoneSelected = () => {
    return sportTypes.length > 0 && sportTypes.every(sport => !tempVisibleSports[sport]);
  };

  // Tarih başlığını biçimlendirme
  const getFormattedDateTitle = () => {
    if (!dateRange?.from) return description;

    if (dateRange.to) {
      const groupingLabel = groupingType === 'daily' ? 'günlük' : 
                           groupingType === 'weekly' ? 'haftalık' : 
                           groupingType === 'monthly' ? 'aylık' : 'yıllık';
                           
      return `${dateRange.from.toLocaleDateString('tr-TR')} - ${dateRange.to.toLocaleDateString('tr-TR')} tarihleri arası ${groupingLabel} etkinlikler`;
    }
    
    return `${dateRange.from.toLocaleDateString('tr-TR')} tarihli etkinlikler`;
  };
  
  // Tarihleri gruplandıran fonksiyon
  const groupDataByDateRange = () => {
    if (!chartData || chartData.length === 0 || !dateRange?.from) {
      setGroupedData(chartData);
      setGroupingType('daily');
      return;
    }
    
    // Tarih aralığının uzunluğunu hesapla
    const days = dateRange.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 1;
    const weeks = dateRange.to ? differenceInWeeks(dateRange.to, dateRange.from) + 1 : 1;
    const months = dateRange.to ? differenceInMonths(dateRange.to, dateRange.from) + 1 : 1;
    
    // Grup türünü belirle
    let newGroupingType: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';
    
    if (days > DAILY_TO_WEEKLY_THRESHOLD) {
      newGroupingType = 'weekly';
    }
    
    if (weeks > WEEKLY_TO_MONTHLY_THRESHOLD) {
      newGroupingType = 'monthly';
    }
    
    if (months > MONTHLY_TO_YEARLY_THRESHOLD) {
      newGroupingType = 'yearly';
    }
    
    // Orijinal veriyi grupla
    if (newGroupingType === 'daily' || !dateRange.to) {
      setGroupedData(chartData);
      setGroupingType('daily');
      return;
    }
    
    // Tarih aralığını belirle
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    
    // Yeni gruplandırılmış veri yapısı
    const grouped: any[] = [];
    
    // Gruplama türüne göre işlem yap
    if (newGroupingType === 'weekly') {
      // Haftaya göre gruplandır
      let weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
      
      while (isBefore(weekStart, endDate)) {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekData: Record<string, any> = {
          date: `${format(weekStart, "dd.MM", { locale: tr })} - ${format(weekEnd, "dd.MM.yyyy", { locale: tr })}`,
        };
        
        // Spor dalları için toplam değerleri hesapla
        getSportTypes().forEach(sport => {
          weekData[sport] = Math.round(Math.random() * 50 + 20); // Gerçek uygulamada burada veri aralığına göre hesaplama yapılır
        });
        
        grouped.push(weekData);
        weekStart = addWeeks(weekStart, 1);
      }
    } else if (newGroupingType === 'monthly') {
      // Aya göre gruplandır
      let monthStart = startOfMonth(startDate);
      
      while (isBefore(monthStart, endDate)) {
        const monthEnd = endOfMonth(monthStart);
        const monthData: Record<string, any> = {
          date: format(monthStart, "MMMM yyyy", { locale: tr }),
        };
        
        // Spor dalları için toplam değerleri hesapla
        getSportTypes().forEach(sport => {
          monthData[sport] = Math.round(Math.random() * 150 + 50); // Gerçek uygulamada burada veri aralığına göre hesaplama yapılır
        });
        
        grouped.push(monthData);
        monthStart = addMonths(monthStart, 1);
      }
    } else if (newGroupingType === 'yearly') {
      // Yıla göre gruplandır
      const years = new Set<number>();
      let yearStart = startDate;
      
      while (isBefore(yearStart, endDate)) {
        years.add(yearStart.getFullYear());
        yearStart = addMonths(yearStart, 1);
      }
      
      // Her yıl için bir veri girişi oluştur
      Array.from(years).sort().forEach(year => {
        const yearData: Record<string, any> = {
          date: `${year}`,
        };
        
        // Spor dalları için toplam değerleri hesapla
        getSportTypes().forEach(sport => {
          yearData[sport] = Math.round(Math.random() * 1200 + 300); // Gerçek uygulamada burada veri aralığına göre hesaplama yapılır
        });
        
        grouped.push(yearData);
      });
    }
    
    setGroupedData(grouped.length > 0 ? grouped : chartData);
    setGroupingType(newGroupingType);
  };
  
  // Tarih aralığı değiştiğinde veriyi gruplandır
  useEffect(() => {
    groupDataByDateRange();
  }, [dateRange, chartData]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{title}</CardTitle>
        <CardDescription className="text-center text-sm">{getFormattedDateTitle()}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Filtre butonu */}
        <div className="flex justify-end mb-4">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filtrele</span>
                {getVisibleSportsCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 h-5 min-w-5 text-xs rounded-full">
                    {getVisibleSportsCount()}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Spor Dalları</span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`h-6 w-6 ${isAllSelected() ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleAllSports(true)}
                    title="Tümünü Seç"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-6 w-6 ${isNoneSelected() ? 'bg-primary/10' : ''}`}
                    onClick={() => toggleAllSports(false)}
                    title="Tümünü Kaldır"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Spor dalları */}
              <div className="max-h-[200px] overflow-y-auto py-1">
                {sportTypes.map((sport) => (
                  <div 
                    key={sport} 
                    className="flex items-center px-2 py-1.5 hover:bg-accent/50 rounded-sm cursor-pointer"
                    onClick={() => toggleTempSportVisibility(sport)}
                  >
                    <Checkbox 
                      id={`filter-${sport}`} 
                      checked={tempVisibleSports[sport] || false}
                      onCheckedChange={() => toggleTempSportVisibility(sport)}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`filter-${sport}`} 
                      className="flex items-center cursor-pointer text-sm w-full"
                    >
                      <div 
                        className="w-3 h-3 mr-2 rounded-full" 
                        style={{ 
                          backgroundColor: sportColors[sport as keyof typeof sportColors] || '#888' 
                        }}
                      />
                      {sport}
                    </label>
                  </div>
                ))}
              </div>
              
              <DropdownMenuSeparator />
              <div className="flex justify-between p-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelFilters}
                  className="h-8"
                >
                  İptal
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={saveFilters}
                  className="h-8"
                >
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Kaydet
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={groupedData} 
              margin={{ top: 15, right: 20, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.7} />
              <XAxis 
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 15, right: 15 }}
                tick={{ fill: '#333333' }}
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 'dataMax + 5']}
                tick={{ fill: '#333333' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  padding: '10px'
                }}
                formatter={(value: number, name: string) => [`${value} etkinlik`, name]}
                labelFormatter={(label: string) => `${groupingType === 'daily' ? 'Tarih' : groupingType === 'weekly' ? 'Hafta' : groupingType === 'monthly' ? 'Ay' : 'Yıl'}: ${label}`}
                itemStyle={{ color: '#333333' }}
                labelStyle={{ fontWeight: 'bold', color: '#000000' }}
              />
              <Legend />
              
              {/* Tüm spor dalları için çizgiler */}
              {sportTypes.map((sport) => (
                <Line 
                  key={sport}
                  type="monotone"
                  dataKey={sport}
                  name={sport}
                  stroke={sportColors[sport as keyof typeof sportColors] || '#888'}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#FFFFFF", strokeWidth: 2, stroke: sportColors[sport as keyof typeof sportColors] || '#888' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: sportColors[sport as keyof typeof sportColors] || '#888', fill: "#FFFFFF" }}
                  hide={!visibleSports[sport]}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 