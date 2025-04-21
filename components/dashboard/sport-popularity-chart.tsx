"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { useTheme } from "next-themes"

// Spor dalları renkleri
const sportColors = {
  football: "#ff6384",
  basketball: "#36a2eb",
  volleyball: "#ffcd56",
  swimming: "#4bc0c0",
}

interface SportPopularityChartProps {
  title?: string
  description?: string
  data?: Record<string, number>
  className?: string
}

export function SportPopularityChart({
  title = "Popüler Spor Dalları",
  description = "Üyelerin ilgilendiği spor dalları dağılımı",
  data = {
    football: 45,
    basketball: 30,
    volleyball: 15,
    swimming: 10,
  },
  className = "",
}: SportPopularityChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  // Tema renklerini belirle
  const chartColors = {
    gridColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    textColor: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipBorder: isDark ? "#334155" : "#e2e8f0"
  }

  // Veriyi grafik için formatlama
  const formatData = () => {
    return Object.entries(data).map(([sport, percentage]) => {
      let sportName = sport
      
      // İngilizce spor isimlerini Türkçe'ye çevirme
      if (sport === "football") sportName = "Futbol"
      else if (sport === "basketball") sportName = "Basketbol"
      else if (sport === "volleyball") sportName = "Voleybol"
      else if (sport === "swimming") sportName = "Yüzme"
      
      return {
        name: sportName,
        value: percentage,
        color: sportColors[sport as keyof typeof sportColors] || "#999999"
      }
    }).sort((a, b) => b.value - a.value) // Büyükten küçüğe sıralama
  }

  const chartData = formatData()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={false} 
                stroke={chartColors.gridColor}
              />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`}
                stroke={chartColors.textColor}
                tick={{ fill: chartColors.textColor }}
                tickLine={{ stroke: chartColors.gridColor }}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                stroke={chartColors.textColor}
                tick={{ fill: chartColors.textColor }}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, "Yüzde"]}
                contentStyle={{ 
                  backgroundColor: chartColors.tooltipBg, 
                  borderColor: chartColors.tooltipBorder,
                  borderRadius: "6px", 
                  color: chartColors.textColor
                }}
                labelStyle={{ color: chartColors.textColor }}
              />
              <Legend wrapperStyle={{ color: chartColors.textColor }} />
              <Bar 
                dataKey="value" 
                name="Popülerlik (%)"
                fill="#8884d8" 
                radius={[0, 4, 4, 0]}
                label={{ 
                  position: 'right', 
                  formatter: (value: number) => `${value}%`,
                  fill: chartColors.textColor
                }}
              >
                {
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 