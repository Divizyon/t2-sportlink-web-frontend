"use client";

import { useEffect, useState } from "react";
import authService from "@/lib/services/authService";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // İlk render'da token kontrolü yap
  useEffect(() => {
    // Sayfa yüklendiğinde token kontrolü yap
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        console.log("AuthGuard: Kullanıcı giriş yapmamış");
        // Giriş sayfasına yönlendir
        window.location.href = "/auth/login";
        return;
      }

      // Token varsa authenticated olarak işaretle
      console.log("AuthGuard: Kullanıcı kimliği doğrulandı");
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    // Kontrol fonksiyonunu çağır
    checkAuth();
    
    // localStorage değişikliklerini dinle
    const handleStorageChange = () => {
      console.log("AuthGuard: Storage değişikliği algılandı");
      const isAuth = authService.isAuthenticated();
      if (!isAuth && isAuthenticated) {
        console.log("AuthGuard: Token kaldırıldı, yönlendiriliyor...");
        window.location.href = "/auth/login";
      }
    };

    // Storage değişikliklerini dinle
    window.addEventListener("storage", handleStorageChange);
    
    // Component unmount olduğunda event listener'ı kaldır
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-screen">
        <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return <>{children}</>;
} 