"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import authService from "@/lib/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authService.login({
        email,
        password
      });

      if (result.token) {
        toast({
          title: "Giriş başarılı",
          description: "Ana sayfaya yönlendiriliyorsunuz",
        });
        
        // Ana sayfaya yönlendir
        router.push("/dashboard");
      } else if ((result as any).needsEmailVerification) {
        // Email doğrulama gerekiyor
        setNeedsEmailVerification(true);
        setError("Email adresinizi doğrulamanız gerekmektedir. Doğrulama emaili için gelen kutunuzu kontrol edin.");
      } else {
        setError(result.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.");
      }
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      setError(error.message || "Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      setError("Email adresi gereklidir");
      return;
    }
    
    setResendingEmail(true);
    
    try {
      const result = await authService.resendEmailConfirmation(email);
      
      toast({
        title: "Email gönderildi",
        description: "Doğrulama emaili adresinize yeniden gönderildi.",
      });
    } catch (error: any) {
      console.error("Email gönderme hatası:", error);
      setError(error.message || "Doğrulama emaili gönderilirken bir hata oluştu.");
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Giriş Yap</h2>
        <p className="text-muted-foreground">
          Hesabınıza giriş yaparak devam edin
        </p>
      </div>
      
      <Separator />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          
          {needsEmailVerification && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResendVerification}
                disabled={resendingEmail}
              >
                {resendingEmail ? "Gönderiliyor..." : "Doğrulama Emailini Yeniden Gönder"}
              </Button>
            </div>
          )}
        </Alert>
      )}
      
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Email / Kullanıcı Adı</Label>
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="Email adresinizi veya kullanıcı adınızı girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
} 