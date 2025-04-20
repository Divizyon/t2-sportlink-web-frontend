"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LogOut, UserCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { logout } from "@/lib/auth"

interface TopBarProps {
  onProfilePanelChange?: (open: boolean) => void;
}

export function TopBar({ onProfilePanelChange }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)

  // Profil paneli durumu değiştiğinde ana bileşene bildir
  useEffect(() => {
    if (onProfilePanelChange) {
      onProfilePanelChange(profileOpen);
    }
  }, [profileOpen, onProfilePanelChange]);

  // Örnek kullanıcı verileri - gerçek uygulamada kullanıcı verilerinizi buraya alabilirsiniz
  const user = {
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    role: "Admin",
    avatar: "/images/avatar.jpg", // Örnek bir avatar yolu
    joinDate: "10.06.2023"
  }

  const handleLogout = () => {
    // Artık kendi logout kodumuz yerine auth.ts'deki logout fonksiyonunu çağırıyoruz
    logout();
    // Not: Logout fonksiyonu zaten kullanıcıyı login sayfasına yönlendirdiği için
    // router.push() çağrısına burada ihtiyacımız yok
  }

  const handleEditProfile = () => {
    // Profil panelini kapat
    setProfileOpen(false);
    // Profil düzenleme sayfasına yönlendir
    router.push("/dashboard/profile/edit");
  }

  const getTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Ana Sayfa"
      case "/dashboard/users":
        return "Kullanıcı Yönetimi"
      case "/dashboard/events":
        return "Etkinlik Yönetimi"
      case "/dashboard/news":
        return "Spor Haberleri"
      case "/dashboard/announcements":
        return "Duyuru Yönetimi"
      case "/dashboard/security":
        return "Güvenlik"
      case "/dashboard/reports":
        return "Raporlar"
      case "/dashboard/profile/edit":
        return "Profil Düzenle"
      default:
        return ""
    }
  }

  const title = getTitle()

  return (
    <div className="h-16 border-b bg-background">
      <div className="flex h-full items-center px-8 justify-between">
        {title ? (
          <h1 className="text-2xl font-bold">{title}</h1>
        ) : (
          <div className="h-12 flex justify-center items-center">
            <img 
              src="/sportLink.svg" 
              alt="SportLink Logo" 
              className="h-12 w-auto"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-4">
                <SheetTitle>Profil Bilgileri</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {user.role}
                  </span>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Katılma Tarihi</p>
                  <p>{user.joinDate}</p>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" onClick={handleEditProfile}>
                    <div className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profili Düzenle
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
} 