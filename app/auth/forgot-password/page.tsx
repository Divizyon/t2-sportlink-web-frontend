"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import useAuth from "@/lib/hooks/useAuth";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { forgotPassword, isLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    
    if (!email) {
      setLocalError("Lütfen email adresinizi girin");
      return;
    }
    
    try {
      const result = await forgotPassword(email);
      
      setIsSuccess(true);
      toast({
        title: "İşlem başarılı",
        description: "Şifre sıfırlama bağlantısı email adresinize gönderildi.",
      });
    } catch (error: any) {
      console.error("Şifre sıfırlama hatası:", error);
      setLocalError(error.message || "Şifre sıfırlama işlemi sırasında bir hata oluştu.");
    }
  };

  // Gösterilecek hata mesajı
  const errorMessage = localError || authError;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Şifremi Unuttum</h2>
        <p className="text-muted-foreground">
          Email adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz
        </p>
      </div>
      
      <Separator />
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {isSuccess ? (
        <div className="space-y-4">
          <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
            <AlertDescription>
              Şifre sıfırlama bağlantısı email adresinize gönderildi. 
              Lütfen email kutunuzu kontrol edin.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="outline" className="mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Giriş sayfasına dön
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Adresi</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </Button>
          
          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline">
              <ArrowLeft className="inline mr-1 h-3 w-3" />
              Giriş sayfasına dön
            </Link>
          </div>
        </form>
      )}
    </div>
  );
} 