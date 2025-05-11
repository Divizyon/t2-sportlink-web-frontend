'use client';

import ProfileForm from "@/components/profile/ProfileForm";
import type { ProfileFormData } from "@/components/profile/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, MapPin, Trophy, CalendarCheck } from "lucide-react";
import { useEffect } from "react";
import { useUserProfile } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useUserProfile();
  // Kullanılmayan state yerine sabit değerler kullanıyoruz
  const createdEventsCount = 0;
  const participatedEventsCount = 0;

  useEffect(() => {
    // Load the profile when component mounts
    if (!profile) {
      useUserProfile().loadProfile();
    }
  }, [profile]);

  const handleSubmit = async (data: ProfileFormData) => {
    // Update profile using the useUserProfile hook
    await updateProfile({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || "",
    });
  };
  
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

  // Get initials for avatar fallback
  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  if (loading || !profile) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Profil Yönetimi</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card className="border dark:border-slate-700">
              <CardHeader className="px-6 pt-6 pb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-6 w-40 mt-4" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-2">
            <Card className="border dark:border-slate-700">
              <CardHeader>
                <CardTitle>Profil Bilgilerini Düzenle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Prepare form data from profile
  const userData = {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    bio: '',
    role: profile.role || 'user',
    username: profile.username || ''
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profil Yönetimi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol taraf - Profil bilgileri (1/3) */}
        <div className="col-span-1">
          <div className="space-y-6">
            <Card className="border dark:border-slate-700">
              <CardHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50/90 to-green-50/90 dark:from-slate-800 dark:to-slate-800 border-b dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-600 shadow-sm">
                    <AvatarImage src={profile.profile_picture || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {getInitials(profile.first_name, profile.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl text-gray-800 dark:text-gray-100">{profile.first_name} {profile.last_name}</CardTitle>
                    <CardDescription className="text-sm flex items-center gap-2 mt-1">
                      <span className="dark:text-gray-300">@{profile.username}</span>
                      <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-600/80 dark:hover:bg-green-600">
                        {profile.role === 'superadmin' ? 'Süper Admin' : 
                          profile.role === 'admin' ? 'Admin' : 'Üye'}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-5">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Kişisel Bilgiler</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</span>
                        </div>
                        <span className="text-sm bg-white dark:bg-slate-700/80 px-2 py-1 rounded border dark:border-slate-600">{profile.email}</span>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</span>
                        </div>
                        <span className="text-sm bg-white dark:bg-slate-700/80 px-2 py-1 rounded border dark:border-slate-600">
                          {profile.phone || 'Belirtilmemiş'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kayıt Tarihi</span>
                        </div>
                        <span className="text-sm bg-white dark:bg-slate-700/80 px-2 py-1 rounded border dark:border-slate-600">
                          {formatShortDate(profile.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500 dark:text-red-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Konum</span>
                        </div>
                        <span className="text-sm bg-white dark:bg-slate-700/80 px-2 py-1 rounded border dark:border-slate-600">
                          {profile.location || 'Belirtilmemiş'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">İstatistikler</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700/80 rounded-md border dark:border-slate-600">
                        <Trophy className="h-5 w-5 text-amber-500 dark:text-amber-400 mb-1" />
                        <span className="text-sm font-medium dark:text-gray-200">{createdEventsCount}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Etkinlik</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-700/80 rounded-md border dark:border-slate-600">
                        <CalendarCheck className="h-5 w-5 text-blue-500 dark:text-blue-400 mb-1" />
                        <span className="text-sm font-medium dark:text-gray-200">{participatedEventsCount}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Katılım</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sağ taraf - Profil düzenleme formu (2/3) */}
        <div className="col-span-2">
          <Card className="border dark:border-slate-700">
            <CardHeader>
              <CardTitle>Profil Bilgilerini Düzenle</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Kişisel bilgilerinizi güncelleyebilirsiniz. Değişiklikler profilinize hemen yansıyacaktır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialData={userData} onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 