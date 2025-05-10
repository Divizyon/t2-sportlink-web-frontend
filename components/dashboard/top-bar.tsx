"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronRight, Mail, Phone, Calendar, User, MapPin, Trophy, Pencil, X, LogOut, Star, CalendarCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
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
import { useUserProfile } from "@/lib/hooks"
import { LogoutButton } from "@/components/auth/logout-button"
import userService from "@/lib/services/userService"

interface TopBarProps {
  onProfilePanelChange?: (open: boolean) => void;
}

export function TopBar({ onProfilePanelChange }: TopBarProps) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showEventsDetails, setShowEventsDetails] = useState(false)
  
  // Oluşturduğum ve katıldığım etkinlikler için state'ler
  const [createdEventsOpen, setCreatedEventsOpen] = useState(false)
  const [participatedEventsOpen, setParticipatedEventsOpen] = useState(false)
  const [createdEvents, setCreatedEvents] = useState<any[]>([])
  const [participatedEvents, setParticipatedEvents] = useState<any[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // useUserProfile hook'unu kullanarak profil bilgilerini al
  const { profile, loading, loadProfile, updateProfile } = useUserProfile();

  // İlk render'da profil bilgilerini yükle
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Profil yüklendiğinde etkinlikleri getir
  useEffect(() => {
    if (profile?.id) {
      setIsLoadingEvents(true);
      
      // Oluşturulan etkinlikleri getir
      userService.getUserCreatedEvents(profile.id)
        .then(response => {
          if (response.success && response.data) {
            // Veri kontrol ediliyor ve dizi olması sağlanıyor
            const eventsData = Array.isArray(response.data) ? response.data : 
              (response.data.events ? response.data.events : []);
            setCreatedEvents(eventsData);
            console.log("Profil: Oluşturulan etkinlikler yüklendi:", eventsData);
          }
        })
        .catch(error => {
          console.error("Oluşturulan etkinlikler alınırken hata:", error);
          setCreatedEvents([]);
        });
      
      // Katılınan etkinlikleri getir
      userService.getUserParticipatedEvents(profile.id)
        .then(response => {
          if (response.success && response.data) {
            // Veri kontrol ediliyor ve dizi olması sağlanıyor  
            const eventsData = Array.isArray(response.data) ? response.data : 
              (response.data.events ? response.data.events : []);
            setParticipatedEvents(eventsData);
            console.log("Profil: Katılınan etkinlikler yüklendi:", eventsData);
          }
        })
        .catch(error => {
          console.error("Katılınan etkinlikler alınırken hata:", error);
          setParticipatedEvents([]);
        })
        .finally(() => {
          setIsLoadingEvents(false);
        });
    }
  }, [profile?.id]);

  // Profil paneli durumu değiştiğinde ana bileşene bildir
  useEffect(() => {
    if (onProfilePanelChange) {
      onProfilePanelChange(profileOpen);
    }
  }, [profileOpen, onProfilePanelChange]);

  const handleSubmit = async (data: ProfileFormData) => {
    // API çağrısı burada yapılacak
    const result = await updateProfile({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || "",
    });

    if (result.success) {
      setIsEditing(false); // After submit, close the dialog
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setProfileOpen(false); // Close profile sheet when opening edit dialog
  }

  // Tarihi kısa formatta biçimlendir
  const formatShortDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Profil henüz yüklenmediyse loading durumunu göster
  if (loading || !profile) {
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
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Tam adı birleştir
  const fullName = profile.name || `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`;
  const profilePicture = profile.profileImage || profile.profile_picture;
  // Kullanıcı istatistikleri
  const eventCount = profile.events || 0;
  const friendCount = profile.friends || 0;
  // Konum bilgisi
  const locationInfo = profile.location || "Konum Bilgisi Belirtilmemiş";
  // Kayıt tarihi
  const registerDate = profile.registrationDate || (profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : '');

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
                  <AvatarImage src={profilePicture || undefined} alt={fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
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
                    <AvatarImage src={profilePicture || undefined} alt={fullName} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-gray-800">{fullName}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">@{profile.username}</span>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {profile.role === 'superadmin' ? 'Süper Admin' :
                          profile.role === 'admin' ? 'Admin' :
                            profile.role === 'manager' ? 'Yönetici' : 'Kullanıcı'}
                      </Badge>
                    </div>
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
                      <span className="text-sm bg-white px-2 py-1 rounded border">{profile.email}</span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Telefon</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{profile.phone || 'Belirtilmemiş'}</span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Kayıt</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {formatShortDate(registerDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Konum</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border truncate">
                        {locationInfo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">İstatistikler</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setCreatedEventsOpen(true)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center text-amber-500 mb-1">
                        <Star className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">{isLoadingEvents ? "..." : createdEvents.length}</p>
                      <p className="text-xs text-gray-500 text-center">Oluşturduğum<br/>Etkinlikler</p>
                    </button>
                    <button 
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setParticipatedEventsOpen(true)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center text-blue-500 mb-1">
                        <CalendarCheck className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium">{isLoadingEvents ? "..." : participatedEvents.length}</p>
                      <p className="text-xs text-gray-500 text-center">Katıldığım<br/>Etkinlikler</p>
                    </button>
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

                <LogoutButton 
                  variant="destructive" 
                  className="w-full"
                  showIcon={true}
                  text="Çıkış Yap"
                />
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
            {profile.createdEvents && profile.createdEvents.length > 0 ? (
              <div className="space-y-2">
                {profile.createdEvents.map((event: any, index: number) => (
                  <div key={index} className="p-2 border rounded">
                    {event.title || "İsimsiz Etkinlik"}
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

      {/* Oluşturulan Etkinlikler Diyalogu */}
      <Dialog open={createdEventsOpen} onOpenChange={setCreatedEventsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Oluşturulan Etkinlikler</DialogTitle>
            <DialogDescription>
              {profile.first_name} {profile.last_name} tarafından oluşturulan etkinlikler
            </DialogDescription>
          </DialogHeader>

          {isLoadingEvents ? (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-t-2 border-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Etkinlikler yükleniyor...</p>
            </div>
          ) : !Array.isArray(createdEvents) || createdEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Oluşturulan etkinlik bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {createdEvents.map((event) => (
                <div key={event.id} className="border rounded-md p-3 bg-gray-50">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {event.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatShortDate(event.event_date)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.sport?.name && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>{event.sport.name}</span>
                      </div>
                    )}
                    {event.status && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-xs">
                          {event.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Katılınan Etkinlikler Diyalogu */}
      <Dialog open={participatedEventsOpen} onOpenChange={setParticipatedEventsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Katılınan Etkinlikler</DialogTitle>
            <DialogDescription>
              {profile.first_name} {profile.last_name} tarafından katılınan etkinlikler
            </DialogDescription>
          </DialogHeader>

          {isLoadingEvents ? (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-t-2 border-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Etkinlikler yükleniyor...</p>
            </div>
          ) : !Array.isArray(participatedEvents) || participatedEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Katılınan etkinlik bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {participatedEvents.map((event) => (
                <div key={event.id} className="border rounded-md p-3 bg-gray-50">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {event.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatShortDate(event.event_date)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.sport?.name && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>{event.sport.name}</span>
                      </div>
                    )}
                    {event.status && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-xs">
                          {event.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
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
            <ProfileForm
              initialData={{
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                username: profile.username || '',
                email: profile.email || '',
                phone: profile.phone || '',
                role: profile.role || '',
              }}
              onSubmit={handleSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 