"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

// Demo verisi - gerçek verilerle değiştirilmeli
const defaultData = [
  {
    name: "Futbol",
    events: 45,
  },
  {
    name: "Basketbol",
    events: 30,
  },
  {
    name: "Voleybol",
    events: 15,
  },
  {
    name: "Yüzme",
    events: 10,
  },
]

export interface SportEventsChartProps {
  title?: string
  description?: string
  data?: typeof defaultData
  className?: string
}

export function SportEventsChart({ 
  title = "Spor Dallarına Göre Etkinlikler", 
  description = "Seçilen tarihte spor dallarına göre etkinlik sayıları", 
  data: chartData = defaultData,
  className = ""
}: SportEventsChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{title}</CardTitle>
        <CardDescription className="text-center text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 15, right: 20, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.7} />
              <XAxis 
                dataKey="name"
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
                domain={[0, 'dataMax + 10']}
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
                formatter={(value: number) => [`${value} etkinlik`, 'Etkinlik Sayısı']}
                labelFormatter={(label: string) => `${label}`}
                itemStyle={{ color: '#333333' }}
                labelStyle={{ fontWeight: 'bold', color: '#000000' }}
              />
              <Line 
                type="monotone"
                dataKey="events"
                stroke="#333333"
                strokeWidth={2}
                dot={{ r: 5, fill: "#FFFFFF", strokeWidth: 2, stroke: "#333333" }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: '#000000', fill: "#FFFFFF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 