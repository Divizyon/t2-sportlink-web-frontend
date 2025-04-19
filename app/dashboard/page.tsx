"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Newspaper, Megaphone } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Son Etkinlikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">Futbol Turnuvası</p>
                    <p className="text-sm text-muted-foreground">15 Nisan 2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Detaylar
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">Basketbol Maçı</p>
                    <p className="text-sm text-muted-foreground">20 Nisan 2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Detaylar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Son Haberler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Fenerbahçe'den Muhteşem Galibiyet</p>
                <p className="text-sm text-muted-foreground">15 Nisan 2024</p>
              </div>
              <div>
                <p className="font-medium">Basketbolda Büyük Başarı</p>
                <p className="text-sm text-muted-foreground">14 Nisan 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Son Duyurular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Spor Tesisi Bakım Çalışması</p>
                <p className="text-sm text-muted-foreground">20-22 Nisan tarihleri arasında spor tesisimizde bakım çalışması yapılacaktır.</p>
              </div>
              <div>
                <p className="font-medium">Yaz Spor Okulu Kayıtları</p>
                <p className="text-sm text-muted-foreground">2024 yaz spor okulu kayıtları başlamıştır. Son başvuru tarihi 30 Nisan 2024'tür.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 