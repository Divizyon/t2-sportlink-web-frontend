"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, User, Mail, Calendar, MapPin, Shield, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UserProfileCardProps } from './types';
import axios from "axios";
import { useStore } from "@/lib/store";

// Skeleton bileşenini manuel olarak oluşturalım
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      {...props}
    />
  );
}

export function UserProfileCard({
  userId,
  username,
  fullName,
  avatar,
  onClose
}: UserProfileCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState<boolean>(false);

  // Zustand store kullanarak blockUserFromReports fonksiyonunu alalım
  const { blockUserFromReports } = useStore();

  // Kullanıcı bilgileri için auth store'dan aktif kullanıcıyı alalım
  const user = useStore(state => state.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Bilinmiyor';

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Kullanıcıyı engelleme işlemi
  const handleBlockUser = async () => {
    if (!userData || !userData.id || isBlocking) return;

    try {
      setIsBlocking(true);

      // blockUserFromReports fonksiyonu kullanılabilir mi kontrol et
      if (typeof blockUserFromReports === 'function') {
        const success = await blockUserFromReports(
          userData.id,
          `${userData.fullName || userData.username} raporlanma nedeniyle engellendi.`
        );

        if (success) {
          // Kullanıcı durumunu güncelle
          setUserData({
            ...userData,
            status: 'blocked'
          });
        }
      }
    } catch (error) {
      console.error("Block user error:", error);
    } finally {
      setIsBlocking(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Mevcut token'ı güvenli bir şekilde alıyoruz
        let token = '';

        // typeof window kontrolü ile client-side olduğumuzdan emin oluyoruz
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
        }

        console.log(`Kullanıcı bilgileri getiriliyor: ID=${userId}, username=${username}`);

        try {
          // Kullanıcı bilgilerini API'den çek
          const response = await axios.get(`/api/users/${userId}`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            }
          });

          if (response.status === 200 && response.data.success) {
            const userData = response.data.data;
            setUserData({
              id: userId,
              username: username || userData.username,
              fullName: fullName ||
                (userData.first_name && userData.last_name
                  ? `${userData.first_name} ${userData.last_name}`
                  : userData.full_name || username),
              firstName: userData.first_name,
              lastName: userData.last_name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              registrationDate: userData.registration_date || userData.created_at,
              lastLoginDate: userData.last_login_date,
              avatar: userData.profile_picture || avatar,
              address: userData.address,
              eventCount: userData.events?.length || 0,
              reportCount: userData.reports?.length || 0,
              status: userData.status || 'active',
            });
          } else {
            throw new Error("API yanıtı başarılı değil");
          }
        } catch (apiError) {
          console.warn("API'den veri alınamadı, props'tan gelen verileri kullanıyoruz:", apiError);
          // API başarısız olursa en azından props'tan gelen verileri kullan
          setUserData({
            id: userId,
            username: username,
            fullName: fullName || username,
            avatar: avatar,
            role: 'user',
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Kullanıcı bilgileri yüklenirken bir hata oluştu.");

        // API başarısız olursa en azından props'tan gelen verileri kullan
        setUserData({
          id: userId || '',
          username: username,
          fullName: fullName || username,
          avatar: avatar,
          role: 'user',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      // userId yoksa doğrudan props'tan gelen verileri kullan
      setUserData({
        id: userId || '',
        username: username,
        fullName: fullName || username,
        avatar: avatar,
        role: 'user',
      });
      setIsLoading(false);
    }
  }, [userId, username, fullName, avatar]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {error || "Kullanıcı bilgileri yüklenemedi."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto relative shadow-lg border-gray-200">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardHeader className="pb-2 pt-6 px-6 bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src={userData.avatar || undefined} alt={userData.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(userData.fullName || userData.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl mb-1">{userData.fullName || userData.username}</CardTitle>
            <CardDescription className="flex items-center text-sm">
              <User className="h-3.5 w-3.5 mr-1 opacity-70" />
              @{userData.username}
              {userData.status === 'blocked' && (
                <Badge variant="destructive" className="ml-2 text-xs py-0">
                  Engellendi
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Role */}
          <div className="flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-2">Rol:</span>
            <Badge variant="secondary">
              {userData.role === 'admin' ? 'Admin' :
                userData.role === 'superadmin' ? 'Süper Admin' : 'Kullanıcı'}
            </Badge>
          </div>

          {/* Email */}
          {userData.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">E-posta:</span>
              <span className="font-medium">{userData.email}</span>
            </div>
          )}

          {/* Phone */}
          {userData.phone && (
            <div className="flex items-center text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2 text-muted-foreground"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="text-muted-foreground mr-2">Telefon:</span>
              <span className="font-medium">{userData.phone}</span>
            </div>
          )}

          {/* Registration Date */}
          {userData.registrationDate && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Kayıt Tarihi:</span>
              <span className="font-medium">{formatDate(userData.registrationDate)}</span>
            </div>
          )}

          {/* Last Login Date */}
          {userData.lastLoginDate && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Son Giriş:</span>
              <span className="font-medium">{formatDate(userData.lastLoginDate)}</span>
            </div>
          )}

          {/* Address */}
          {userData.address && (
            <div className="flex items-start text-sm">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Adres:</span>
              <span className="font-medium">{userData.address}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {userData.eventCount !== undefined && (
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-blue-500 font-medium">{userData.eventCount}</div>
              <div className="text-gray-500">Etkinlik</div>
            </div>
          )}

          {userData.reportCount !== undefined && (
            <div className="bg-amber-50 p-2 rounded">
              <div className="text-amber-500 font-medium">{userData.reportCount}</div>
              <div className="text-gray-500">Rapor</div>
            </div>
          )}
        </div>

        {/* Block User Button - Only for Admins */}
        {isAdmin && userData.status !== 'blocked' && (
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={handleBlockUser}
            disabled={isBlocking}
          >
            <Shield className="mr-2 h-4 w-4" />
            {isBlocking ? 'İşleniyor...' : 'Kullanıcıyı Engelle'}
          </Button>
        )}

        {/* Warning for blocked users */}
        {userData.status === 'blocked' && (
          <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded flex items-center text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Bu kullanıcı şu anda engellenmiş durumda.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 