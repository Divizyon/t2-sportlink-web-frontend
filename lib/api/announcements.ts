export interface Announcement {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
  startDate: string | null
  endDate: string | null
  creatorId: string | null
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface CreateAnnouncementDTO {
  title: string
  content: string
  isPublished?: boolean
  startDate?: string | null
  endDate?: string | null
}

export interface UpdateAnnouncementDTO {
  title?: string
  content?: string
  isPublished?: boolean
  startDate?: string | null
  endDate?: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getAnnouncements(page = 1, pageSize = 10, publishedOnly = false): Promise<PaginatedResponse<Announcement>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      published: publishedOnly.toString()
    });

    const response = await fetch(`${API_URL}/api/announcements?${params}`);
    if (!response.ok) {
      throw new Error('Duyurular alınamadı');
    }
    return await response.json();
  } catch (error) {
    console.error('Duyurular alınırken hata oluştu:', error);
    return { success: false, data: [], pagination: { page, pageSize, totalCount: 0, totalPages: 0 } };
  }
}

export async function getActiveAnnouncements(): Promise<{ success: boolean, data: Announcement[] }> {
  try {
    const response = await fetch(`${API_URL}/api/announcements/active`);
    if (!response.ok) {
      throw new Error('Aktif duyurular alınamadı');
    }
    return await response.json();
  } catch (error) {
    console.error('Aktif duyurular alınırken hata oluştu:', error);
    return { success: false, data: [] };
  }
}

export async function getAnnouncementById(id: string): Promise<{ success: boolean, data: Announcement | null }> {
  try {
    const response = await fetch(`${API_URL}/api/announcements/${id}`);
    if (!response.ok) {
      throw new Error('Duyuru alınamadı');
    }
    return await response.json();
  } catch (error) {
    console.error('Duyuru alınırken hata oluştu:', error);
    return { success: false, data: null };
  }
}

export async function getAnnouncementBySlug(slug: string): Promise<{ success: boolean, data: Announcement | null }> {
  try {
    const response = await fetch(`${API_URL}/api/announcements/slug/${slug}`);
    if (!response.ok) {
      throw new Error('Duyuru alınamadı');
    }
    return await response.json();
  } catch (error) {
    console.error('Duyuru alınırken hata oluştu:', error);
    return { success: false, data: null };
  }
}

export async function createAnnouncement(data: CreateAnnouncementDTO): Promise<{ success: boolean, data: Announcement | null }> {
  try {
    const response = await fetch(`${API_URL}/api/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Duyuru oluşturulamadı');
    }
    return await response.json();
  } catch (error) {
    console.error('Duyuru oluşturulurken hata oluştu:', error);
    return { success: false, data: null };
  }
}

export async function updateAnnouncement(id: string, data: UpdateAnnouncementDTO): Promise<{ success: boolean, data: Announcement | null }> {
  try {
    const response = await fetch(`${API_URL}/api/announcements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Duyuru güncellenemedi');
    }
    return await response.json();
  } catch (error) {
    console.error('Duyuru güncellenirken hata oluştu:', error);
    return { success: false, data: null };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean, message?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/announcements/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Duyuru silinemedi');
    }
    return await response.json();
  } catch (error) {
    console.error('Duyuru silinirken hata oluştu:', error);
    return { success: false };
  }
} 