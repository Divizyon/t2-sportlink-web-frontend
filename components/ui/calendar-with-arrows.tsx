"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DateRange, DayClickEventHandler } from "react-day-picker"
import { tr } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CalendarWithArrowsProps = React.ComponentProps<typeof DayPicker>

function CalendarWithArrows({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarWithArrowsProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    props.defaultMonth || new Date()
  )
  
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

  return (
    <div className="flex items-start calendar-with-arrows-container">
      {/* Sol Ok */}
      <div className="mr-2 flex items-center h-64 justify-center">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full side-arrow z-10"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Önceki ay</span>
        </Button>
      </div>
      
      {/* Takvim */}
      <div className="relative z-0"> 
        <DayPicker
          defaultMonth={currentMonth}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className={cn("p-3 calendar-no-caption", className)}
          classNames={{
            root: "w-full flex justify-center",
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-2",
            caption: "hidden",
            caption_label: "hidden",
            nav: "hidden",
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-center",
            head_cell:
              "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex justify-center items-center",
            row: "flex w-full mt-1 justify-center",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent flex justify-center items-center",
              "[&:has([aria-selected].day-outside)]:bg-accent/50",
              "[&:has([aria-selected].day-range-end)]:rounded-r-md"
            ),
            day: cn(
              "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground flex justify-center items-center cursor-pointer"
            ),
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
            ...classNames,
          }}
          showOutsideDays={showOutsideDays}
          locale={tr}
          formatters={{
            formatCaption: () => '',
          }}
          {...props}
        />
      </div>
      
      {/* Sağ Ok */}
      <div className="ml-2 flex items-center h-64 justify-center">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full side-arrow z-10"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Sonraki ay</span>
        </Button>
      </div>
    </div>
  )
}

CalendarWithArrows.displayName = "CalendarWithArrows"

export { CalendarWithArrows } 