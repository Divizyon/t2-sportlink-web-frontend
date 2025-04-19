export interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch('/api/announcements')
    if (!response.ok) {
      throw new Error('Duyurular alınamadı')
    }
    return response.json()
  } catch (error) {
    console.error('Duyurular alınırken hata oluştu:', error)
    return []
  }
}

export async function createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
  try {
    const response = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Duyuru oluşturulamadı')
    }
    return response.json()
  } catch (error) {
    console.error('Duyuru oluşturulurken hata oluştu:', error)
    throw error
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Duyuru silinemedi')
    }
  } catch (error) {
    console.error('Duyuru silinirken hata oluştu:', error)
    throw error
  }
} 