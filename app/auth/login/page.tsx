"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import useAuth from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    login,
    isLoading,
    error: authError,
    isAuthenticated,
    clearError,
    resendEmailConfirmation
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [localError, setLocalError] = useState("");

  // Debug - localStorage öğelerini kontrol et
  useEffect(() => {
    try {
      console.log("Debug - LocalStorage Kontrol:");
      console.log("access_token:", localStorage.getItem("access_token"));
      console.log("token:", localStorage.getItem("token"));
    } catch (error) {
      console.error("LocalStorage debug kontrolü sırasında hata:", error);
    }
  }, []);

  // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
  useEffect(() => {
    try {
      if (isAuthenticated) {
        console.log("Login: Kullanıcı zaten giriş yapmış!");
        setRedirecting(true);

        // Doğrudan sayfayı yönlendir
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    } catch (error) {
      console.error("Kimlik doğrulama kontrolü sırasında hata:", error);
      // Hata durumunda oturum temizle
      localStorage.clear();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Form submission'ı önle

    setLocalError("");
    clearError(); // Zustand store'daki hatayı temizle

    if (!email || !password) {
      setLocalError("Email ve şifre alanları boş bırakılamaz");
      return;
    }

    try {
      const result = await login({
        email,
        password
      });

      // Güvenli bir şekilde result ve session kontrolü yap
      if (result && result.session && result.session.access_token) {
        console.log("Login: Giriş başarılı, yönlendiriliyor...");

        // Auth anahtarlarını senkronize et
        try {
          // Auth.ts tarafından kullanılan anahtar
          localStorage.setItem('token', result.session.access_token);

          // Tarayıcıda ikisi de olmasını sağla
          if (!localStorage.getItem('token')) {
            localStorage.setItem('token', result.session.access_token);
          }

          // Kullanıcı rolü bilgisini ayarla
          if (result.user && result.user.role) {
            localStorage.setItem('userRole', result.user.role);
          }

          console.log("Token'lar senkronize edildi:",
            "access_token:", !!localStorage.getItem("access_token"),
            "token:", !!localStorage.getItem("token"));
        } catch (error) {
          console.error("Token senkronizasyonu sırasında hata:", error);
        }

        // Toast'u try/catch içine alarak hata olasılığını azalt
        try {
          toast({
            title: "Giriş başarılı",
            description: "Ana sayfaya yönlendiriliyorsunuz",
          });
        } catch (toastError) {
          console.error("Toast gösterilirken hata:", toastError);
        }

        // Yönlendirme öncesi durum ayarla
        setRedirecting(true);

        // Tarayıcı konumunu doğrudan değiştir - setTimeout ile işlemi asenkron yap
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100); // Yönlendirme süresini artır
      } else if (result && (result as any).needsEmailVerification) {
        // Email doğrulama gerekiyor
        setNeedsEmailVerification(true);
        setLocalError("Email adresinizi doğrulamanız gerekmektedir. Doğrulama emaili için gelen kutunuzu kontrol edin.");
      } else {
        // Geçerli token ya da oturum yok
        console.warn("Login: Geçerli bir token alınamadı");
        setLocalError("Giriş yapılamadı: Sunucudan geçerli bir yanıt alınamadı.");
      }
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setLocalError(error.message || "Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");

      // E-posta doğrulama hatasını yakalamak için özel kontrol
      if (error.message?.includes('doğrulama')) {
        setNeedsEmailVerification(true);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setLocalError("Email adresi gereklidir");
      return;
    }

    setResendingEmail(true);

    try {
      await resendEmailConfirmation(email);

      toast({
        title: "Email gönderildi",
        description: "Doğrulama emaili adresinize yeniden gönderildi.",
      });
    } catch (error: any) {
      console.error("Email gönderme hatası:", error);
      setLocalError(error.message || "Doğrulama emaili gönderilirken bir hata oluştu.");
    } finally {
      setResendingEmail(false);
    }
  };

  // Yönlendirme yapılıyorsa yükleme durumu göster
  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-screen">
        <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  // Gösterilecek hata mesajı - önce yerel hata, sonra auth store'dan gelen hata
  const errorMessage = localError || authError;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Giriş Yap</h2>
        <p className="text-muted-foreground">
          Hesabınıza giriş yaparak devam edin
        </p>
      </div>

      <Separator />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>

          {needsEmailVerification && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendingEmail}
                type="button"
              >
                {resendingEmail ? "Gönderiliyor..." : "Doğrulama Emailini Yeniden Gönder"}
              </Button>
            </div>
          )}
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Email Adresi</Label>
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Email adresinizi girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
            Şifremi Unuttum
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          {/* Kayıt ol bağlantısı kaldırıldı - sadece admin ve süper admin kullanıcılar girebilir */}
        </p>
      </div>
    </div>
  );
} 