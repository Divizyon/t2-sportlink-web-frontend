"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createAnnouncement } from "@/lib/api/announcements"
import { useToast } from "@/components/ui/use-toast"

export function AnnouncementForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createAnnouncement({ title, content })
      setTitle("")
      setContent("")
      toast({
        title: "Başarılı",
        description: "Duyuru başarıyla oluşturuldu",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Duyuru oluşturulurken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Başlık
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Duyuru başlığı"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          İçerik
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Duyuru içeriği"
          required
          className="min-h-[100px]"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Ekleniyor..." : "Duyuru Ekle"}
      </Button>
    </form>
  )
} 