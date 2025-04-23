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

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, isLoading, error: authError, isAuthenticated, clearError } = useAuth();
  
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  
  // Form alanları
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationLatitude, setLocationLatitude] = useState(0);
  const [locationLongitude, setLocationLongitude] = useState(0);

  // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      setRedirecting(true);
      // Önce yönlendirme durumunu ayarla
      setTimeout(() => {
        // Sonraki tik'te yönlendirmeyi gerçekleştir
        window.location.href = "/dashboard";
      }, 100);
    }
  }, [isAuthenticated]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    try {
      // Konum bilgilerini alma (örnek olarak istanbulun konumu kullanılıyor)
      // Gerçek uygulamada kullanıcının konumunu alabiliriz
      const defaultLatitude = 41.0082;
      const defaultLongitude = 28.9784;
      
      const result = await register({
        email,
        password,
        username,
        first_name: firstName,
        last_name: lastName,
        phone,
        default_location_latitude: locationLatitude || defaultLatitude,
        default_location_longitude: locationLongitude || defaultLongitude
      });

      setSuccess(true);
      
      toast({
        title: "Kayıt başarılı!",
        description: "Email adresinize doğrulama bağlantısı gönderildi. Lütfen emailinizi kontrol edin.",
      });
      
      // Form alanlarını temizle
      setEmail("");
      setPassword("");
      setUsername("");
      setFirstName("");
      setLastName("");
      setPhone("");
      
    } catch (error: any) {
      console.error("Kayıt hatası:", error);
      setLocalError(error.message || "Kayıt yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
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

  // Gösterilecek hata mesajı
  const errorMessage = localError || authError;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Kayıt Ol</h2>
        <p className="text-muted-foreground">
          Yeni bir hesap oluşturun
        </p>
      </div>
      
      <Separator />
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {success ? (
        <div className="space-y-4">
          <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
            <AlertDescription>
              Kayıt işleminiz başarıyla tamamlandı! Email adresinize doğrulama bağlantısı gönderildi. 
              Lütfen email adresinizi kontrol edin ve hesabınızı doğrulayın.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center space-x-4">
            <Button onClick={() => {
              setRedirecting(true);
              setTimeout(() => {
                window.location.href = "/auth/login";
              }, 100);
            }}>
              Giriş Sayfasına Dön
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Adınız"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Soyadınız"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Telefon numaranız"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Şifrenizi belirleyin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>
      )}
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Zaten bir hesabınız var mı?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
} 