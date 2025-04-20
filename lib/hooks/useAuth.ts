import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';
import type { UserData } from '../services/authService';

export const useAuth = (requiredRole?: string) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // localStorage'dan kullanıcı bilgilerini al
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = authService.getLocalUser();
          setUser(userData);
          
          // Eğer belirli bir rol gerekiyorsa kontrol et
          if (requiredRole && userData) {
            const hasRole = userData.role === requiredRole || 
                           // superadmin her şeyi yapabilir
                           userData.role === 'superadmin' ||
                           // 'admin' rolüne sahip kullanıcılar, 'user' gerektiren işlemleri yapabilir
                           (userData.role === 'admin' && requiredRole === 'user');
            
            setHasRequiredRole(hasRole);
            
            // Kullanıcının yetkisi yoksa ana sayfaya yönlendir
            if (!hasRole) {
              console.warn(`Kullanıcının '${requiredRole}' rolü yok. Mevcut rol: ${userData.role}`);
              router.push('/dashboard');
            }
          } else {
            // Rol kontrolü yoksa veya kullanıcı yoksa
            setHasRequiredRole(true);
          }
        } else {
          // Kimlik doğrulama yapılmamışsa login'e yönlendir
          router.push('/auth/login');
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  return { user, isLoading, isAuthenticated, hasRequiredRole };
};

export default useAuth; 