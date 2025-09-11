import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Backend API'ye istek gönder - ikinci doğrulama için tekrar login endpoint'ini kullanıyoruz
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    // Başarılı giriş yanıtını kontrol et
    if (data.success && data.token && data.admin) {
      // Admin rolünün gerçekten superadmin olup olmadığını kontrol et
      if (data.admin.role === 'superadmin') {
        return NextResponse.json({ 
          success: true, 
          message: 'İkinci doğrulama başarılı'
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: 'Superadmin yetkisi gereklidir'
        }, { status: 403 });
      }
    }

    // Giriş başarısız olduysa hata döndür
    return NextResponse.json(
      { success: false, message: 'Doğrulama başarısız' },
      { status: 401 }
    );
  } catch (error) {
    console.error('İkinci doğrulama hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 