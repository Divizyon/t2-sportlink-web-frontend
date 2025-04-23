"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/services/api";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  // URL'den token'ı al ve doğrula
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    
    if (!tokenFromUrl) {
      setError("Geçerli bir şifre sıfırlama token'ı bulunamadı.");
      setIsValidatingToken(false);
      return;
    }
    
    // Token'ı doğrula
    const validateToken = async () => {
      try {
        // Not: Bu endpoint backend'de varsa kullanın
        // Eğer yoksa, bu kontrol adımını atlayabilirsiniz
        // await api.get(`/auth/validate-reset-token?token=${tokenFromUrl}`);
        
        // Token geçerli
        setToken(tokenFromUrl);
        setIsValidatingToken(false);
      } catch (error: any) {
        console.error("Token doğrulama hatası:", error);
        setError("Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.");
        setIsValidatingToken(false);
      }
    };
    
    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Form doğrulama
    if (password.length < 6) {
      setError("Şifre en az 6 karakter uzunluğunda olmalıdır.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Şifre sıfırlama isteği
      await api.post("/auth/reset-password", {
        token,
        password
      });
      
      setIsSuccess(true);
      toast({
        title: "Şifre Güncellendi",
        description: "Şifreniz başarıyla güncellenmiştir.",
      });
    } catch (error: any) {
      console.error("Şifre sıfırlama hatası:", error);
      setError(error.response?.data?.message || "Şifre sıfırlama işlemi sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">Şifre Sıfırlama</h2>
          <p className="text-muted-foreground">Token doğrulanıyor...</p>
        </div>
        
        <div className="flex justify-center pt-4">
          <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Şifre Sıfırlama</h2>
        <p className="text-muted-foreground">
          Yeni şifrenizi belirleyin
        </p>
      </div>
      
      <Separator />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isSuccess ? (
        <div className="space-y-4">
          <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
            <Check className="h-4 w-4 mr-2" />
            <AlertDescription>
              Şifreniz başarıyla güncellenmiştir. Artık yeni şifreniz ile giriş yapabilirsiniz.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Link href="/auth/login">
              <Button className="mt-2">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      ) : token ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">Yeni Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Yeni şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "İşleniyor..." : "Şifreyi Güncelle"}
          </Button>
          
          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline">
              <ArrowLeft className="inline mr-1 h-3 w-3" />
              Giriş sayfasına dön
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Geçersiz veya süresi dolmuş bir şifre sıfırlama bağlantısı kullanıyorsunuz.
          </p>
          <Link href="/auth/forgot-password">
            <Button variant="outline">
              Yeni Şifre Sıfırlama Bağlantısı İste
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 