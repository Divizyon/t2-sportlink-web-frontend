"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useAuth from "@/lib/hooks/useAuth";

export default function VerifyEmailPage() {
  const { verifyEmail, isLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // URL'den token parametresini al
  useEffect(() => {
    async function verifyToken() {
      const token = searchParams.get("token");
      
      if (!token) {
        setError("Doğrulama için geçerli bir token gerekmektedir.");
        setIsVerifying(false);
        return;
      }
      
      try {
        const result = await verifyEmail(token);
        setIsSuccess(true);
        toast({
          title: "Email Doğrulandı",
          description: "Email adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.",
        });
      } catch (error: any) {
        console.error("Email doğrulama hatası:", error);
        setError(error.message || "Email doğrulama işlemi sırasında bir hata oluştu.");
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyToken();
  }, [searchParams, verifyEmail, toast]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Email Doğrulama</h2>
        <p className="text-muted-foreground">
          Email adresinizi doğrulama işlemi
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Email adresiniz doğrulanıyor...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
        ) : isSuccess ? (
          <div className="space-y-4">
            <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
              <Check className="h-4 w-4 mr-2" />
              <AlertDescription>
                Email adresiniz başarıyla doğrulandı. Artık hesabınıza giriş yapabilirsiniz.
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
        ) : null}
      </div>
    </div>
  );
} 