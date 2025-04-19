"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { getAnnouncements, deleteAnnouncement } from "@/lib/api/announcements"
import type { Announcement } from "@/lib/api/announcements"
import { useToast } from "@/components/ui/use-toast"

export function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements()
      setAnnouncements(data)
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

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id)
      setAnnouncements(announcements.filter((a) => a.id !== id))
      toast({
        title: "Başarılı",
        description: "Duyuru başarıyla silindi",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Duyuru silinirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>İçerik</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell>{announcement.title}</TableCell>
              <TableCell>{announcement.content}</TableCell>
              <TableCell>
                {new Date(announcement.createdAt).toLocaleDateString("tr-TR")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(announcement.id)}
                >
                  Sil
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 