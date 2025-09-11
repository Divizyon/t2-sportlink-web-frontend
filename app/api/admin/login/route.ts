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

    // Backend API'ye istek gönder
    const backendUrl = 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    // Yanıtı direkt olarak ilet
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin giriş hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 