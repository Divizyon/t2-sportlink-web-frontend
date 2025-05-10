"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import useAuth from "@/lib/hooks/useAuth"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Kimlik doğrulama kontrolü
  useEffect(() => {
    // 500ms gecikme ile görsel geçiş ekleyelim
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.log("Dashboard: Kullanıcı giriş yapmamış!");
        setRedirecting(true);

        toast({
          title: "Erişim Engellendi",
          description: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
          variant: "destructive",
        });

        // Önce yönlendirme durumunu set et
        setTimeout(() => {
          // Tarayıcı konumunu doğrudan değiştir
          window.location.href = "/auth/login";
        }, 100);
      } else {
        setIsLoading(false);

        // Kullanıcı SuperAdmin mi kontrol et
        const checkSuperAdminStatus = async () => {
          try {
            const adminService = (await import('@/lib/services/adminService')).default;
            const response = await adminService.checkSuperAdminStatus();

            if (response.success) {
              setIsSuperAdmin(response.data.isSuperAdmin);
            }
          } catch (error) {
            console.error("SuperAdmin kontrolü sırasında hata:", error);
          }
        };

        checkSuperAdminStatus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
  };

  if (isLoading || redirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {user?.first_name}</h1>
          <p className="text-muted-foreground mt-1">Spor etkinlikleri dünyasına katılmaya hazır mısınız?</p>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          Çıkış Yap
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Etkinlikler"
          description="Tüm etkinlikleri görüntüle ve katıl"
          link="/events"
          linkText="Etkinlikleri Keşfet"
        />

        <DashboardCard
          title="Profil"
          description="Profil bilgilerinizi güncelleyin"
          link="/profile"
          linkText="Profil'e Git"
        />

        <DashboardCard
          title="Spor Dalları"
          description="Tüm spor dallarını keşfedin"
          link="/sports"
          linkText="Spor Dallarını Görüntüle"
        />

        {isSuperAdmin && (
          <DashboardCard
            title="Admin Yönetimi"
            description="Admin kullanıcılarını yönetin"
            link="/dashboard/admins"
            linkText="Admin Sayfasına Git"
          />
        )}
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

function DashboardCard({ title, description, link, linkText }: DashboardCardProps) {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-card">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Link href={link}>
        <Button variant="outline" className="w-full">
          {linkText}
        </Button>
      </Link>
    </div>
  );
} 