"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LogOut, UserCircle, ChevronRight, Mail, Phone, Calendar, User, MapPin, Shield, Trophy, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { logout } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"
import ProfileForm from "@/components/profile/ProfileForm"
import type { ProfileFormData } from "@/components/profile/ProfileForm"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface TopBarProps {
  onProfilePanelChange?: (open: boolean) => void;
}

export function TopBar({ onProfilePanelChange }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showEventsDetails, setShowEventsDetails] = useState(false)
  const [showReportsDetails, setShowReportsDetails] = useState(false)

  // Profil paneli durumu değiştiğinde ana bileşene bildir
  useEffect(() => {
    if (onProfilePanelChange) {
      onProfilePanelChange(profileOpen);
    }
  }, [profileOpen, onProfilePanelChange]);

  // Örnek kullanıcı verileri - gerçek uygulamada kullanıcı verilerinizi buraya alabilirsiniz
  const userData = {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: '555-123-4567',
    bio: '',
    role: "admin",
    avatar: "/images/avatar.jpg", // Örnek bir avatar yolu
    profileImage: "/images/avatar.jpg",
    username: "ahmetyilmaz",
    joinDate: "10.06.2023",
    registrationDate: "2023-06-10",
    location: 'İstanbul, Türkiye',
    interests: ['Futbol', 'Basketbol', 'Yüzme'],
    events: 12,
    friends: 0,
    reportedUsers: 5,
    createdEvents: [
      { id: 1, title: "Haftalık Futbol Maçı", date: "15.07.2023" },
      { id: 2, title: "Basketbol Turnuvası", date: "22.07.2023" },
      { id: 3, title: "Yüzme Yarışması", date: "05.08.2023" }
    ],
    reportedItems: [
      { id: 1, username: "mehmetdemir", reason: "Uygunsuz içerik", date: "20.06.2023" },
      { id: 2, username: "ayşeyılmaz", reason: "Spam", date: "15.07.2023" },
      { id: 3, username: "canaydin", reason: "Taciz", date: "02.08.2023" },
      { id: 4, username: "selinyıldız", reason: "Yanıltıcı bilgi", date: "10.08.2023" },
      { id: 5, username: "ibrahimkaya", reason: "Kurallara aykırı paylaşım", date: "22.08.2023" }
    ]
  }

  const handleSubmit = async (data: ProfileFormData) => {
    // API çağrısı burada yapılacak
    console.log('Form data:', data);
    setIsEditing(false); // After submit, close the dialog
  };

  const handleLogout = () => {
    // Artık kendi logout kodumuz yerine auth.ts'deki logout fonksiyonunu çağırıyoruz
    logout();
    // Not: Logout fonksiyonu zaten kullanıcıyı login sayfasına yönlendirdiği için
    // router.push() çağrısına burada ihtiyacımız yok
  }

  const handleEditProfile = () => {
    setIsEditing(true);
    setProfileOpen(false); // Close profile sheet when opening edit dialog
  }

  const getTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/dashboard/users":
        return "Kullanıcılar";
      case "/dashboard/events":
        return "Etkinlikler";
      case "/dashboard/news":
        return "Haberler";
      case "/dashboard/announcements":
        return "Duyurular";
      case "/dashboard/settings":
        return "Ayarlar";
      case "/dashboard/security":
        return "Güvenlik";
      case "/dashboard/reports":
        return "Raporlar";
      default:
        return "Dashboard";
    }
  };

  const title = getTitle()

  return (
    <div className="h-16 border-b bg-background">
      <div className="grid grid-cols-3 h-full items-center px-8">
        <div className="flex-1">
          {/* Sol taraf boş bırakılıyor */}
        </div>
        
        <div className="flex justify-center items-center">
          {title ? (
            <h1 className="text-2xl font-bold uppercase text-center">{title}</h1>
          ) : (
            <div className="h-12 flex justify-center items-center">
              <img 
                src="/sportLink.svg" 
                alt="SportLink Logo" 
                className="h-12 w-auto"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 justify-end">
          <ThemeSwitcher />
          <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Profil Bilgileri</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Profil Başlık */}
                <div className="flex flex-col items-center space-y-3 bg-gradient-to-r from-green-50 to-blue-50 py-4 px-3 rounded-lg">
                  <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-gray-800">{userData.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">@{userData.username}</span>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {userData.role === 'admin' ? 'Admin' : userData.role === 'manager' ? 'Yönetici' : 'Kullanıcı'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{userData.bio}</p>
                  </div>
                </div>
                
                {/* Kişisel Bilgiler */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">E-posta</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{userData.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Telefon</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{userData.phone}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Kayıt</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {userData.joinDate}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Konum</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border truncate">
                        {userData.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">İstatistikler</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setShowEventsDetails(true)}
                    >
                      <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                      <span className="text-sm font-medium">{userData.events}</span>
                      <span className="text-xs text-gray-500">Etkinlik</span>
                    </div>
                    <div 
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setShowReportsDetails(true)}
                    >
                      <Shield className="h-5 w-5 text-red-500 mb-1" />
                      <span className="text-sm font-medium">{userData.reportedUsers}</span>
                      <span className="text-xs text-gray-500">Raporlama</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" onClick={handleEditProfile}>
                    <div className="flex items-center">
                      <Pencil className="mr-2 h-4 w-4" />
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

      {/* Events Details Dialog */}
      <Dialog open={showEventsDetails} onOpenChange={setShowEventsDetails}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Oluşturduğunuz Etkinlikler</DialogTitle>
            <DialogDescription>
              Oluşturduğunuz tüm etkinliklerin listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {userData.createdEvents.length > 0 ? (
              <div className="space-y-3">
                {userData.createdEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">Henüz etkinlik oluşturmadınız</p>
            )}
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Details Dialog */}
      <Dialog open={showReportsDetails} onOpenChange={setShowReportsDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>İncelediğiniz Raporlar</DialogTitle>
            <DialogDescription>
              İncelediğiniz kullanıcı raporlarının listesi
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {userData.reportedItems.length > 0 ? (
              <div className="space-y-3">
                {userData.reportedItems.map((report) => (
                  <div key={report.id} className="p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium text-sm">@{report.username}</h4>
                      <span className="text-xs text-gray-500">{report.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 text-red-600 border-red-200 bg-red-50">
                        {report.reason}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">Henüz incelediğiniz rapor bulunmuyor</p>
            )}
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-5 pb-3 bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Profil Bilgilerini Düzenle</DialogTitle>
                <DialogDescription>
                  Kişisel bilgilerinizi güncelleyebilirsiniz. Değişiklikler profilinize hemen yansıyacaktır.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="p-6">
            <ProfileForm initialData={userData} onSubmit={handleSubmit} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 