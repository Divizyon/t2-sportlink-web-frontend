"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean;
  text?: string;
}

export function LogoutButton({
  showIcon = true,
  text = "Çıkış Yap",
  ...props
}: LogoutButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    try {
      // Auth kütüphanesindeki logout fonksiyonunu çağır
      logout();
      
      // Başarılı bildirim göster
      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
      
      // Login sayfasına yönlendir
      router.push("/auth/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      toast({
        title: "Çıkış yapılamadı",
        description: "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      {...props}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {text}
    </Button>
  );
} 