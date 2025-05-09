"use client"

import * as React from "react"
import { format, isValid } from "date-fns"
import { tr } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({ 
  dateRange, 
  setDateRange, 
  className,
  calendarContentClassName,
  placeholder = "Tarih Aralığı Seç",
}: { 
  dateRange: DateRange | undefined
  setDateRange: (dateRange: DateRange | undefined) => void
  className?: string
  calendarContentClassName?: string
  placeholder?: string
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [activeCalendar, setActiveCalendar] = React.useState<'start' | 'end' | null>(null)

  // Biçimlendirilmiş tarihler
  const formattedStartDate = dateRange?.from ? format(dateRange.from, "dd.MM.yyyy", { locale: tr }) : "__.__.____";
  const formattedEndDate = dateRange?.to ? format(dateRange.to, "dd.MM.yyyy", { locale: tr }) : "__.__.____";

  // Başlangıç tarihini değiştir
  const handleStartDateChange = (date: Date | undefined) => {
    setDateRange({ from: date, to: dateRange?.to });
    // İç popover'ı kapat - timing sorunlarını önlemek için setTimeout kullanıyoruz
    setTimeout(() => {
      setActiveCalendar(null);
    }, 100);
  };

  // Bitiş tarihini değiştir
  const handleEndDateChange = (date: Date | undefined) => {
    // Eğer başlangıç tarihi yoksa ve bitiş tarihi seçiliyorsa, başlangıç tarihini bugün yap
    if (!dateRange?.from && date) {
      setDateRange({ from: new Date(), to: date });
    } else {
      setDateRange({ from: dateRange?.from, to: date });
    }
    // İç popover'ı kapat - timing sorunlarını önlemek için setTimeout kullanıyoruz
    setTimeout(() => {
      setActiveCalendar(null);
    }, 100);
  };

  // Ana popover'ı açıp kapatan fonksiyon
  const togglePopover = () => {
    setPopoverOpen(!popoverOpen);
    setActiveCalendar(null);
  };

  // Temizleme butonu
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange(undefined);
  };
  
  // Takvim butonlarına tıklayınca bir sonraki render için
  // event loop'u bırak, böylece olası timing sorunları çözülür
  const handleCalendarButtonClick = (calendarType: 'start' | 'end', e: React.MouseEvent) => {
    // Olay yayılmasını durdur, böylece ana popover'ın toggle işlemi tetiklenmez
    e.stopPropagation();
    
    // Mevcut aktif takvim tıklanan ile aynıysa, aktif takvimi temizle
    if (activeCalendar === calendarType) {
      setActiveCalendar(null);
      return;
    }
    
    // Aktif takvimi ayarla
    setTimeout(() => {
      setActiveCalendar(calendarType);
    }, 0);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "flex justify-between items-center w-[250px] text-left font-normal rounded-md h-10 border",
            !dateRange?.from && !dateRange?.to && "text-muted-foreground",
            (dateRange?.from || dateRange?.to) && "border-primary/40",
            className
          )}
          onClick={togglePopover}
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            <span>
              {dateRange?.from || dateRange?.to ? 
                `${formattedStartDate} - ${formattedEndDate}` : 
                placeholder}
            </span>
          </div>
          {(dateRange?.from || dateRange?.to) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 ml-2 hover:bg-destructive/10 rounded-full"
              onClick={handleClear}
            >
              <X className="h-3 w-3 text-destructive" />
              <span className="sr-only">Tarihi temizle</span>
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-3 min-w-[350px] rounded-md shadow", calendarContentClassName)} align="center">
        <div className="flex space-x-3">
          {/* Başlangıç Tarihi */}
          <div className="flex-1">
            <p className="text-xs font-medium mb-2 text-primary">Başlangıç</p>
            <Popover open={activeCalendar === 'start'} onOpenChange={(open) => !open && setActiveCalendar(null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 p-2 rounded-md",
                    !dateRange?.from && "text-muted-foreground",
                    dateRange?.from && "border-primary/40"
                  )}
                  onClick={(e) => handleCalendarButtonClick('start', e)}
                >
                  {formattedStartDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 min-w-[280px] rounded-md" align="center">
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={handleStartDateChange}
                  initialFocus
                  weekStartsOn={1}
                  className="rounded-md border shadow p-2"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Bitiş Tarihi */}
          <div className="flex-1">
            <p className="text-xs font-medium mb-2 text-primary">Bitiş</p>
            <Popover open={activeCalendar === 'end'} onOpenChange={(open) => !open && setActiveCalendar(null)}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 p-2 rounded-md",
                    !dateRange?.to && "text-muted-foreground",
                    dateRange?.to && "border-primary/40"
                  )}
                  onClick={(e) => handleCalendarButtonClick('end', e)}
                >
                  {formattedEndDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 min-w-[280px] rounded-md" align="center">
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={handleEndDateChange}
                  disabled={(date) => 
                    dateRange?.from ? date < dateRange.from : false
                  }
                  initialFocus
                  weekStartsOn={1}
                  className="rounded-md border shadow p-2"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 