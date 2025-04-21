"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DayPickerProps, DayPickerSingleProps, DayPickerMultipleProps, DayPickerRangeProps } from "react-day-picker"
import { tr } from 'date-fns/locale'
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [selectedPickerMode, setSelectedPickerMode] = React.useState<"month" | "year">("month")
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    props.defaultMonth || new Date()
  )
  
  const [yearRange, setYearRange] = React.useState<number[]>(() => {
    const currentYear = new Date().getFullYear()
    // 21 yıl - 10 geçmiş, 10 gelecek + şu anki yıl
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  })
  
  const months = React.useMemo(() => {
    return [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ]
  }, [])

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(year)
    setCurrentMonth(newDate)
    setSelectedPickerMode("month")
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(monthIndex)
    setCurrentMonth(newDate)
    setShowDatePicker(false)
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentMonth(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentMonth(newDate)
  }

  // Her ay değişimini izle
  React.useEffect(() => {
    if (props.defaultMonth && props.defaultMonth.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(props.defaultMonth)
    }
  }, [props.defaultMonth])

  // Seçiciyi görüntülemek için referanslar
  const monthScrollRef = React.useRef<HTMLDivElement>(null)
  const yearScrollRef = React.useRef<HTMLDivElement>(null)

  // Ay seçici görüntülendiğinde seçili aya kaydır
  React.useEffect(() => {
    if (showDatePicker && selectedPickerMode === "month" && monthScrollRef.current) {
      const selectedMonthButton = monthScrollRef.current.querySelector(`[data-month="${currentMonth.getMonth()}"]`)
      if (selectedMonthButton) {
        selectedMonthButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }
  }, [showDatePicker, selectedPickerMode, currentMonth])

  // Yıl seçici görüntülendiğinde seçili yıla kaydır
  React.useEffect(() => {
    if (showDatePicker && selectedPickerMode === "year" && yearScrollRef.current) {
      const selectedYearButton = yearScrollRef.current.querySelector(`[data-year="${currentMonth.getFullYear()}"]`)
      if (selectedYearButton) {
        selectedYearButton.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }
  }, [showDatePicker, selectedPickerMode, currentMonth])

  // Önceki 10 yıla git
  const handlePrevYearGroup = () => {
    if (yearRange.length > 0) {
      const firstYear = yearRange[0] || new Date().getFullYear() - 10
      const newFirstYear = firstYear - 10
      const newYearRange = Array.from({ length: 21 }, (_, i) => newFirstYear + i)
      setYearRange(newYearRange)
    }
  }
  
  // Sonraki 10 yıla git
  const handleNextYearGroup = () => {
    if (yearRange.length > 0) {
      const lastYear = yearRange[yearRange.length - 1] || new Date().getFullYear() + 10
      const newFirstYear = lastYear - 10
      const newYearRange = Array.from({ length: 21 }, (_, i) => newFirstYear + i)
      setYearRange(newYearRange)
    }
  }

  const formatMonthYear = React.useMemo(() => {
    return format(currentMonth, "LLLL yyyy", { locale: tr })
  }, [currentMonth])

  // Custom weekday header component
  const CustomWeekHeader = React.useCallback(() => {
    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    
    return (
      <div className="flex w-full justify-between mb-1 px-1">
        {days.map((day, i) => (
          <div key={i} className="text-muted-foreground w-9 text-[0.8rem] font-normal text-center">
            {day}
          </div>
        ))}
      </div>
    );
  }, []);

  return (
    <div className="relative">
      <div className="flex justify-center items-center mb-4 relative">
        <Button
          variant="outline"
          className="h-8 px-3 text-sm font-medium"
          onClick={() => {
            setShowDatePicker(!showDatePicker)
            setSelectedPickerMode("month")
          }}
        >
          {formatMonthYear}
        </Button>
      </div>
      
      {showDatePicker && (
        <div className="absolute top-10 left-0 z-10 w-full bg-popover border rounded-md shadow-md">
          <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
            {selectedPickerMode === "year" ? (
              <Button
                variant="outline"
                className="h-7 px-2 text-xs font-medium w-full"
                onClick={() => setSelectedPickerMode("month")}
              >
                <span className="text-xs">{yearRange[0]} - {yearRange[yearRange.length-1]}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-7 px-2 text-xs font-medium w-full"
                onClick={() => setSelectedPickerMode("year")}
              >
                {currentMonth.getFullYear()}
              </Button>
            )}
          </div>
          
          {selectedPickerMode === "month" ? (
            <div className="p-2">
              <div 
                className="grid grid-cols-3 gap-1 max-h-48 overflow-auto" 
                ref={monthScrollRef}
              >
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant={currentMonth.getMonth() === index ? "default" : "outline"}
                    className={cn(
                      "h-9 text-sm justify-center",
                      currentMonth.getMonth() === index ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-month={index}
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2">
              <div className="flex justify-between mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex items-center justify-center"
                  onClick={handlePrevYearGroup}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Önceki 10 yıl</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex items-center justify-center"
                  onClick={handleNextYearGroup}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Sonraki 10 yıl</span>
                </Button>
              </div>
              <div 
                className="grid grid-cols-3 gap-1 max-h-48 overflow-auto" 
                ref={yearScrollRef}
              >
                {yearRange.map(year => (
                  <Button
                    key={year}
                    variant={currentMonth.getFullYear() === year ? "default" : "outline"}
                    className={cn(
                      "h-9 text-sm justify-center",
                      currentMonth.getFullYear() === year ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    data-year={year}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="relative mx-auto">
        <div className="p-2 px-9">
          {/* Custom weekday header */}
          <CustomWeekHeader />
          
          <div className="relative">
            {!showDatePicker && (
              <div className="absolute -left-7 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-accent"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <style jsx global>{`
              /* Temel takvim hücreleri */
              .rdp-cell {
                padding: 1px !important;
                margin: 0 !important;
                width: 36px !important; 
                height: 36px !important;
                position: relative !important;
              }
              
              /* Günleri bir kutu içinde göster - tıklanabilir alan */
              .rdp-button {
                width: 36px !important;
                height: 36px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                border-radius: 4px !important;
                background-color: #f3f4f6 !important;
                border: 2px solid #e5e7eb !important;
                font-size: 14px !important;
                padding: 0 !important;
                transition: all 0.15s ease !important;
                position: relative !important;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
              }
              
              /* Tıklanabilir alan göstergesi */
              .rdp-button::after {
                content: "";
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border-radius: 6px;
                border: 2px dashed #d1d5db;
                z-index: 0;
                pointer-events: none;
              }
              
              /* Günleri vurgula */
              .rdp-day {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                height: 100% !important;
                position: relative !important;
                z-index: 1 !important;
                font-weight: 500 !important;
              }
              
              /* Seçili gün stili */
              .rdp-day[aria-selected="true"],
              .rdp-button[aria-selected="true"] {
                background-color: hsl(var(--primary)) !important;
                color: hsl(var(--primary-foreground)) !important;
                font-weight: bold !important;
                border-color: hsl(var(--primary)) !important;
              }
              
              /* Seçili gün için tıklanabilir alan göstergesini gizle */
              .rdp-button[aria-selected="true"]::after {
                display: none !important;
              }
              
              /* Hover efekti */
              .rdp-button:hover:not([aria-selected="true"]) {
                background-color: hsl(var(--accent)) !important;
                color: hsl(var(--accent-foreground)) !important;
                border-color: hsl(var(--accent)) !important;
                transform: scale(1.05) !important;
                z-index: 2 !important;
              }
              
              /* Hover durumunda tıklanabilir alan göstergesini belirginleştir */
              .rdp-button:hover::after {
                border-color: hsl(var(--accent)) !important;
                border-width: 3px !important;
              }
              
              /* Aktif tıklama durumu */
              .rdp-button:active {
                transform: scale(0.96) !important;
              }
              
              /* Devre dışı günler */
              .rdp-day[aria-disabled="true"],
              .rdp-button[aria-disabled="true"] {
                opacity: 0.4 !important;
                background-color: transparent !important;
                border-color: transparent !important;
                cursor: not-allowed !important;
              }
              
              /* Devre dışı günler için tıklanabilir alan göstergesini gizle */
              .rdp-button[aria-disabled="true"]::after {
                display: none !important;
              }
              
              /* Bugünün tarihi */
              .rdp-day_today {
                position: relative !important;
                font-weight: 600 !important;
              }
              
              .rdp-button.rdp-day_today {
                border: 2px solid hsl(var(--primary)) !important;
                background-color: hsl(var(--primary) / 0.1) !important;
              }
              
              /* Bugünün tarihi için tıklanabilir alan göstergesini özelleştir */
              .rdp-button.rdp-day_today::after {
                border-color: hsl(var(--primary)) !important;
              }
              
              /* Satırlar */
              .rdp-row {
                display: flex !important;
                margin-bottom: 6px !important;
              }
              
              /* Tablo */
              .rdp-table {
                border-collapse: separate !important;
                border-spacing: 4px !important;
              }
              
              /* Takvim container */
              .rdp {
                margin: 0 !important;
                padding: 6px !important;
              }
              
              /* Mobil için daha büyük tıklama alanı */
              @media (max-width: 768px) {
                .rdp-cell, .rdp-button {
                  width: 40px !important;
                  height: 40px !important;
                }
              }
            `}</style>
            
            <DayPicker
              defaultMonth={currentMonth}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={tr}
              weekStartsOn={1}
              className={cn("", className)}
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-0",
                caption: "hidden", // Başlık gizlendi, kendi başlığımız var
                caption_label: "hidden",
                nav: "hidden", // Varsayılan navigasyon gizlendi, kendi oklarımızı kullanıyoruz
                nav_button: "hidden",
                nav_button_previous: "hidden",
                nav_button_next: "hidden",
                table: "w-full border-collapse",
                head_row: "sr-only", // Screen reader için gizli ama erişilebilir
                row: "flex w-full mt-2 justify-between",
                cell: "text-center text-sm relative h-9 w-9 p-0 focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal rounded-md inline-flex items-center justify-center transition-colors",
                ),
                day_range_end: "day-range-end",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
              }}
              modifiersStyles={{
                selected: {
                  fontWeight: "bold",
                },
                today: {
                  fontWeight: "bold",
                },
              }}
              showOutsideDays={showOutsideDays}
              formatters={{
                formatWeekdayName: () => "", // Boş döndür, kendi başlıklarımızı kullanıyoruz
                ...props.formatters
              }}
              {...props}
            />
            
            {!showDatePicker && (
              <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-accent"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar } 