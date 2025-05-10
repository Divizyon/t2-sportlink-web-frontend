"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { checkSessionState } from "@/lib/auth";

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Sadece client tarafında çalışacak
    // Yetkilendirme kontrolü yap
    authCheck();

    // Dönüş temizliği
    return () => {
      // Cleanup işlemleri (gelecekte gerekirse)
    };
  }, [requiredRoles]); // Sadece requiredRoles değiştiğinde etkileşime gir

  function authCheck() {
    setIsChecking(true);

    try {
      // Oturum durumunu kontrol et
      const { isLoggedIn, userRole, requiresSecondAuth } = checkSessionState();

      // Giriş yapılmamışsa login sayfasına yönlendir
      if (!isLoggedIn) {
        setAuthorized(false);
        // Doğrudan yönlendirme yap
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 100);
        setIsChecking(false);
        return;
      }

      // Superadmin ikinci doğrulama gerekiyorsa login'e yönlendir
      if (requiresSecondAuth) {
        setAuthorized(false);
        toast({
          title: "İkinci doğrulama gerekiyor",
          description: "Güvenlik nedeniyle lütfen bilgilerinizi tekrar doğrulayın.",
          variant: "destructive",
        });

        // Doğrudan yönlendirme yap
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 100);

        setIsChecking(false);
        return;
      }

      // Belirli roller gerekliyse kontrol et
      if (requiredRoles && requiredRoles.length > 0) {
        if (!userRole || !requiredRoles.includes(userRole)) {
          setAuthorized(false);

          toast({
            title: "Yetkisiz erişim",
            description: "Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.",
            variant: "destructive",
          });

          // Doğrudan yönlendirme yap
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 100);

          setIsChecking(false);
          return;
        }
      }

      // Tüm kontroller başarılı, erişim sağla
      setAuthorized(true);
      setIsChecking(false);
    } catch (error) {
      console.error("Yetkilendirme kontrolü sırasında hata:", error);
      setAuthorized(false);

      toast({
        title: "Oturum hatası",
        description: "Oturum bilgilerinize erişilemiyor. Lütfen tekrar giriş yapın.",
        variant: "destructive",
      });

      // Doğrudan yönlendirme yap
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);

      setIsChecking(false);
    }
  }

  // İçeriği göster veya yükleniyor durumunu göster
  if (authorized) {
    return <>{children}</>;
  } else if (isChecking) {
    return <div className="flex justify-center items-center h-screen"></div>;
  } else {
    return <div className="flex justify-center items-center h-screen">Yönlendiriliyor...</div>;
  }
} 