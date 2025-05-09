import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

/**
 * Kullanıcı profil bilgilerini getiren API route
 * Bu route frontend tarafından kullanıcının public profil bilgilerini almak için kullanılır
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const userId = params.id;
    const headersList = headers();

    try {
        // API endpoint URL'i - backend URL'iniz ile değiştirin
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // Authorization token'ını headerlar veya cookie'den al
        let token = headersList.get('Authorization') || '';

        // Bearer prefix'ini kaldır (eğer varsa)
        if (token.startsWith('Bearer ')) {
            token = token.substring(7);
        }

        if (!token) {
            // Eğer request header'da token yoksa, cookie'den almayı dene
            const cookieStore = cookies();
            const authToken = cookieStore.get('authToken');
            if (authToken) {
                token = authToken.value;
            }
        }

        // Kullanıcı bilgisi sorgusu
        console.log(`API isteği yapılıyor: ${apiUrl}/api/users/${userId}`);
        console.log(`Token: ${token ? 'Token var' : 'Token yok'}`);

        const response = await fetch(`${apiUrl}/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
        });

        if (!response.ok) {
            console.error(`API hatası: ${response.status} ${response.statusText}`);
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                {
                    success: false,
                    message: errorData.message || `Kullanıcı bilgileri alınamadı. Hata: ${response.status}`
                },
                { status: response.status }
            );
        }

        const userData = await response.json();

        return NextResponse.json({
            success: true,
            data: userData.data || userData
        });
    } catch (error) {
        console.error('Kullanıcı profili alınırken hata:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Sunucu hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')
            },
            { status: 500 }
        );
    }
} 