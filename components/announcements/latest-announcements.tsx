"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getAnnouncements } from "@/lib/api/announcements"
import type { Announcement } from "@/lib/api/announcements"
import { useToast } from "@/components/ui/use-toast"

export function LatestAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements()
      // Son 5 duyuruyu göster
      setAnnouncements(data.slice(0, 5))
    } catch (error) {
      toast({
        title: "Hata",
        description: "Duyurular yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Duyurular</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-lg border p-4 hover:bg-accent"
            >
              <h3 className="font-semibold">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground">
                {announcement.content}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(announcement.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 