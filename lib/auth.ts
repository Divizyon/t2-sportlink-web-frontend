import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Admin giriş fonksiyonu
export const loginAdmin = async (credentials: { username: string; password: string }) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('token', data.token);

      // Kullanıcı rolünü localStorage'a kaydet (dashboard permission hatası için)
      if (data.admin && data.admin.role) {
        localStorage.setItem('userRole', data.admin.role);
      }

      // Dashboard erişim izinlerini kaydet
      if (data.dashboardAccess) {
        localStorage.setItem('dashboardAccess', JSON.stringify(data.dashboardAccess));
      }
    }

    return data;
  } catch (error) {
    console.error('Giriş yapılırken hata:', error);
    throw error;
  }
};

// İkinci doğrulama aşamasını tamamlar (superadmin için)
export const completeSecondAuth = async (credentials: { username: string; password: string }) => {
  try {
    // Önceki kimlik bilgileriyle karşılaştırmak için yeniden giriş yap
    const response = await fetch('/api/admin/verify-second-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success) {
      // İkinci doğrulama başarılı, oturum durumunu "verified" olarak güncelle
      localStorage.setItem('sessionState', 'verified');

      return {
        success: true,
        message: 'İkinci doğrulama başarılı'
      };
    }

    return data;
  } catch (error) {
    console.error('İkinci doğrulama hatası:', error);
    throw error;
  }
};

// Oturum durumunu kontrol eder
export const checkSessionState = () => {
  try {
    // Önce 'token' anahtarına bak (auth.ts tarafından kullanılan)
    let token = localStorage.getItem('token');
    
    // Eğer 'token' yoksa 'access_token' anahtarına bak (authService tarafından kullanılan)
    if (!token) {
      token = localStorage.getItem('access_token');
      
      // Eğer access_token varsa, token anahtarına da kopyala
      if (token) {
        localStorage.setItem('token', token);
        console.log("Token senkronize edildi: access_token -> token");
      }
    } else {
      // Eğer token varsa, access_token anahtarına da kopyala
      if (!localStorage.getItem('access_token')) {
        localStorage.setItem('access_token', token);
        console.log("Token senkronize edildi: token -> access_token");
      }
    }
    
    const userRole = localStorage.getItem('userRole');
    const sessionState = localStorage.getItem('sessionState') || 'initial';

    return {
      isLoggedIn: !!token,
      userRole: userRole,
      sessionState: sessionState,
      isSuperAdmin: userRole === 'superadmin',
      requiresSecondAuth: userRole === 'superadmin' && sessionState === 'initial'
    };
  } catch (error) {
    console.error('Oturum durumu kontrol edilirken hata oluştu:', error);
    return {
      isLoggedIn: false,
      userRole: null,
      sessionState: 'error',
      isSuperAdmin: false,
      requiresSecondAuth: false
    };
  }
};

// Dashboard izinlerini getirir
export const getDashboardPermissions = async () => {
  try {
    const response = await fetch('/api/admin/dashboard-permissions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Dashboard izinleri alınırken hata oluştu:', error);

    // Eğer 404 hatası alırsak, varsayılan değer döndür
    const userRole = localStorage.getItem('userRole');
    return {
      success: true,
      dashboardAccess: {
        hasAccess: true,
        canCreateAdmins: userRole === 'superadmin'
      }
    };
  }
};

// Çıkış yapar
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('admin');
  localStorage.removeItem('dashboardAccess');
  localStorage.removeItem('sessionState');
  
  // Sayfayı yenile veya login sayfasına yönlendir
  window.location.href = '/auth/login';
};

// Rol tabanlı erişim kontrolü için yardımcı fonksiyonlar
export const hasRole = (requiredRole: string) => {
  const userRole = localStorage.getItem('userRole');
  return userRole === requiredRole;
};

export const hasOneOfRoles = (requiredRoles: string[]) => {
  const userRole = localStorage.getItem('userRole');
  return userRole ? requiredRoles.includes(userRole) : false;
};

// Korumalı sayfa mantığı için özel hook
export const useAuthProtection = (requiredRoles?: string[]) => {
  const router = useRouter();
  
  useEffect(() => {
    const { isLoggedIn, userRole, requiresSecondAuth } = checkSessionState();
    
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    if (requiresSecondAuth) {
      // Superadmin ikinci doğrulama gerekiyorsa login'e yönlendir
      router.push('/auth/login');
      return;
    }
    
    // Belirli roller gerekliyse kontrol et
    if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
      // Yetkisiz erişim - dashboard'a yönlendir veya yetkisiz sayfası göster
      router.push('/dashboard');
      return;
    }
  }, [router, requiredRoles]);
  
  return checkSessionState();
}; 