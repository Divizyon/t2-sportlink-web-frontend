import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Kimlik doğrulama gereklidir' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Backend API'ye istek gönder
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/admin/dashboard-permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // API yanıtı olmadığında ön uçta (local storage'dan) hesaplanan izinleri kullan
    if (response.status === 404) {
      // Tarayıcıda olmadığımız için localStorage doğrudan kullanamayız
      // Bunun yerine token'dan bilgileri elde etmeye çalışabiliriz (veya daha önceden alınmış)
      // Bu örnekte varsayılan değerler döndürüyoruz
      return NextResponse.json({
        success: true,
        dashboardAccess: {
          hasAccess: true,
          // Token'dan rol bilgisi çıkarmak için JWT kütüphanesi kullanılmalı
          // Bu örnek için default değer kullanıyoruz
          canCreateAdmins: false
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Dashboard izinleri alınırken hata:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 