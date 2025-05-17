"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, Phone, Mail, Calendar, MapPin, Trophy, Shield, Star, CalendarCheck, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import type { UserType } from "@/interfaces/user";
import { useStore } from "@/lib/store";
import userService from "@/lib/services/userService";

interface UserDetailsProps {
  user: UserType | null;
  onUpdateUser: (updatedUser: UserType) => void;
}

interface EventInfo {
  id: string;
  title: string;
  date?: string;
  location?: string;
  status?: string;
  sport_type?: string;
}

export default function UserDetails({ user, onUpdateUser }: UserDetailsProps) {
  // Get current user info from store to check if they are a superadmin
  const currentUser = useStore(state => state.user);
  const isSuperAdmin = currentUser?.role === 'superadmin';
  
  // Etkinlik istatistikleri için state
  const [createdEventsCount, setCreatedEventsCount] = useState<number>(0);
  const [participatedEventsCount, setParticipatedEventsCount] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  
  // Diyalog control state
  const [createdEventsOpen, setCreatedEventsOpen] = useState<boolean>(false);
  const [participatedEventsOpen, setParticipatedEventsOpen] = useState<boolean>(false);
  const [reportsOpen, setReportsOpen] = useState<boolean>(false);
  
  // Etkinlik listeleri state
  const [createdEvents, setCreatedEvents] = useState<EventInfo[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<EventInfo[]>([]);

  // Kullanıcı değiştiğinde etkinlik sayılarını yükle
  useEffect(() => {
    if (user?.id) {
      setIsLoadingStats(true);
      
      // Oluşturulan etkinlikleri getir
      userService.getUserCreatedEvents(user.id)
        .then(response => {
          if (response.success && response.data) {
            // Veri kontrol ediliyor ve dizi olması sağlanıyor
            const eventsData = Array.isArray(response.data) ? response.data : 
              (response.data.events ? response.data.events : []);
            setCreatedEventsCount(eventsData.length || 0);
            setCreatedEvents(eventsData);
            console.log("Oluşturulan etkinlikler:", eventsData);
          }
        })
        .catch(error => {
          console.error("Oluşturulan etkinlikler alınırken hata:", error);
          setCreatedEvents([]);
        });
      
      // Katılınan etkinlikleri getir
      userService.getUserParticipatedEvents(user.id)
        .then(response => {
          if (response.success && response.data) {
            console.log("API katılınan etkinlik yanıtı:", response.data);
            
            // Veri kontrol ediliyor ve dizi olması sağlanıyor
            const eventsData = Array.isArray(response.data) ? response.data : 
              (response.data.events ? response.data.events : []);
            setParticipatedEventsCount(eventsData.length || 0);
            setParticipatedEvents(eventsData);
            console.log("Katılınan etkinlikler:", eventsData);
          }
        })
        .catch(error => {
          console.error("Katılınan etkinlikler alınırken hata:", error);
          setParticipatedEvents([]);
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    }
  }, [user?.id]);

  // Format date in DD.MM.YYYY format
  const formatShortDate = (dateString?: string): string => {
    if (!dateString) return 'Belirtilmemiş';

    try {
      const date = new Date(dateString);
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) return 'Belirtilmemiş';
      
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date).replace(/\//g, '.');
    } catch (e) {
      return 'Belirtilmemiş';
    }
  };

  // Get initials for avatar
  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="text-center py-10">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">Kullanıcı Seçilmedi</h3>
            <p className="mt-2 text-sm text-muted-foreground">Lütfen detaylarını görüntülemek için bir kullanıcı seçin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto relative shadow-sm border-gray-200 h-full">
        <CardHeader className="pt-4 pb-0 px-4">
          <CardTitle className="text-xl font-bold text-center">Profil Bilgileri</CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-4 mb-4 border dark:border-slate-700">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 border-2 border-white dark:border-slate-600 shadow-md mb-3">
                <AvatarImage src={user?.profile_picture || undefined} alt={user?.username} />
                <AvatarFallback className="bg-black text-white text-xl font-semibold">
                  {getInitials(user?.first_name, user?.last_name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold mb-1 dark:text-gray-100">{user?.first_name} {user?.last_name}</h2>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600 dark:text-gray-300 text-xs">@{user?.username}</span>
                <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-600/80 dark:hover:bg-green-600 text-white text-xs px-2 py-0.5">
                  {user?.role === "superadmin" ? "Süper Admin" :
                    user?.role === "admin" ? "Admin" : "Kullanıcı"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-3 dark:text-gray-200">Kişisel Bilgiler</h3>
            
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">E-posta</p>
                  <p className="font-medium text-sm dark:text-gray-200">{user?.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-green-500 dark:text-green-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Telefon</p>
                  <p className="font-medium text-sm dark:text-gray-200">
                    {user.phone && user.phone !== "" && user.phone !== "null" && user.phone !== "undefined" 
                      ? user.phone 
                      : 'Belirtilmemiş'
                    }
                  </p>
                </div>
              </div>

              {/* Registration Date */}
              {user?.created_at && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-purple-500 dark:text-purple-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Kayıt</p>
                    <p className="font-medium text-sm dark:text-gray-200">{formatShortDate(user.created_at)}</p>
                  </div>
                </div>
              )}

              {/* Location if available */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-red-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Konum</p>
                  <p className="font-medium text-sm">
                    {user?.default_location_latitude && user?.default_location_longitude
                      ? `${user.default_location_latitude.toFixed(6)}, ${user.default_location_longitude.toFixed(6)}`
                      : 'Konum Bilgisi Belirtilmemiş'
                    }
                  </p>
                </div>
              </div>
              
              {/* Role selection - only visible to superadmins */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center text-amber-500">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Rol</p>
                  {isSuperAdmin ? (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={user.role} 
                        onValueChange={(value) => {
                          if (value !== user.role) {
                            onUpdateUser({ ...user, role: value });
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs min-w-[120px]">
                          <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user" className="text-xs">Kullanıcı</SelectItem>
                          <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                          <SelectItem value="superadmin" className="text-xs">Süper Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="font-medium text-sm">
                      {user?.role === "superadmin" ? "Süper Admin" :
                        user?.role === "admin" ? "Admin" : "Kullanıcı"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 dark:text-gray-200">İstatistikler</h3>
            <div className="grid grid-cols-3 gap-3">
              <button 
                className="border dark:border-slate-600 rounded-lg p-3 flex flex-col items-center bg-white dark:bg-slate-700/80 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => setCreatedEventsOpen(true)}
              >
                <div className="w-6 h-6 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-1">
                  <Star className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold dark:text-gray-200">{isLoadingStats ? "..." : createdEventsCount}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs text-center">Oluşturduğum<br/>Etkinlikler</p>
              </button>
              <button 
                className="border dark:border-slate-600 rounded-lg p-3 flex flex-col items-center bg-white dark:bg-slate-700/80 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => setParticipatedEventsOpen(true)}
              >
                <div className="w-6 h-6 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-1">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold dark:text-gray-200">{isLoadingStats ? "..." : participatedEventsCount}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs text-center">Katıldığım<br/>Etkinlikler</p>
              </button>
              <button 
                className="border dark:border-slate-600 rounded-lg p-3 flex flex-col items-center bg-white dark:bg-slate-700/80 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => setReportsOpen(true)}
              >
                <div className="w-6 h-6 flex items-center justify-center text-green-500 dark:text-green-400 mb-1">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold dark:text-gray-200">0</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs text-center">Kullanıcı<br/>Raporları</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oluşturulan Etkinlikler Diyalogu */}
      <Dialog open={createdEventsOpen} onOpenChange={setCreatedEventsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Oluşturulan Etkinlikler</DialogTitle>
            <DialogDescription>
              {user.first_name} {user.last_name} tarafından oluşturulan etkinlikler
            </DialogDescription>
          </DialogHeader>

          {!Array.isArray(createdEvents) || createdEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Oluşturulan etkinlik bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {createdEvents.map(event => (
                <div key={event.id} className="border dark:border-slate-700 rounded-md p-3 bg-gray-50 dark:bg-slate-800/50">
                  <h4 className="font-medium text-sm dark:text-gray-200">{event.title}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {event.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 dark:text-gray-400" />
                        <span className="dark:text-gray-400">{formatShortDate(event.date)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 dark:text-gray-400" />
                        <span className="dark:text-gray-400">{event.location}</span>
                      </div>
                    )}
                    {event.sport_type && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 dark:text-gray-400" />
                        <span className="dark:text-gray-400">{event.sport_type}</span>
                      </div>
                    )}
                    {event.status && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-xs dark:border-slate-600 dark:bg-slate-700/80 dark:text-gray-300">
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
              {user.first_name} {user.last_name} tarafından katılınan etkinlikler
            </DialogDescription>
          </DialogHeader>

          {!Array.isArray(participatedEvents) || participatedEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Katılınan etkinlik bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {participatedEvents.map(event => (
                <div key={event.id} className="border dark:border-slate-700 rounded-md p-3 bg-gray-50 dark:bg-slate-800/50">
                  <h4 className="font-medium text-sm dark:text-gray-200">{event.title}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {event.date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 dark:text-gray-400" />
                        <span className="dark:text-gray-400">{formatShortDate(event.date)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 dark:text-gray-400" />
                        <span className="dark:text-gray-400">{event.location}</span>
                      </div>
                    )}
                    {event.sport_type && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 dark:text-gray-400" />
                        <span className="dark:text-gray-400">{event.sport_type}</span>
                      </div>
                    )}
                    {event.status && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-xs dark:border-slate-600 dark:bg-slate-700/80 dark:text-gray-300">
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

      {/* Kullanıcı Raporları Diyalogu */}
      <Dialog open={reportsOpen} onOpenChange={setReportsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Raporları</DialogTitle>
            <DialogDescription>
              {user.first_name} {user.last_name} kullanıcısına ait raporlar
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 text-center text-muted-foreground">
            <p>Henüz rapor bulunmamaktadır.</p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}