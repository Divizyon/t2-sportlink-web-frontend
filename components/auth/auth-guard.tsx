"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { checkSessionState } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Yetkilendirme kontrolü yap
    authCheck();

    // Sayfa değişimlerinde auth kontrolü yap
    const handleRouteChange = () => {
      authCheck();
    };

    // Dönüş temizliği
    return () => {
      // Cleanup işlemleri (gelecekte gerekirse)
    };
  }, [router]);

  function authCheck() {
    // Oturum durumunu kontrol et
    const { isLoggedIn, userRole, requiresSecondAuth } = checkSessionState();

    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!isLoggedIn) {
      setAuthorized(false);
      router.push("/auth/login");
      return;
    }

    // Superadmin ikinci doğrulama gerekiyorsa login'e yönlendir
    if (requiresSecondAuth) {
      setAuthorized(false);
      router.push("/auth/login");
      
      toast({
        title: "İkinci doğrulama gerekiyor",
        description: "Güvenlik nedeniyle lütfen bilgilerinizi tekrar doğrulayın.",
        variant: "destructive",
      });
      return;
    }

    // Belirli roller gerekliyse kontrol et
    if (requiredRoles && requiredRoles.length > 0) {
      if (!userRole || !requiredRoles.includes(userRole)) {
        setAuthorized(false);
        router.push("/dashboard");
        
        toast({
          title: "Yetkisiz erişim",
          description: "Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.",
          variant: "destructive",
        });
        return;
      }
    }

    // Tüm kontroller başarılı, erişim sağla
    setAuthorized(true);
  }

  // İçeriği göster veya gizle
  if (authorized) {
    return <>{children}</>;
  } else {
    return null; // Yönlendirme yapılırken içeriği gizle
  }
} 