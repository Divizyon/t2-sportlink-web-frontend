'use client';

import ProfileForm from "@/components/profile/ProfileForm";
import type { ProfileFormData } from "@/components/profile/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, User, MapPin, BookOpen, Trophy, Award } from "lucide-react";

export default function ProfilePage() {
  const handleSubmit = async (data: ProfileFormData) => {
    // API çağrısı burada yapılacak
    console.log('Form data:', data);
  };

  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    bio: 'Frontend Developer',
    role: 'developer',
    username: 'johndoe',
    profileImage: '/images/avatar.png',
    registrationDate: '2023-01-15',
    location: 'İstanbul, Türkiye',
    interests: ['Futbol', 'Basketbol', 'Yüzme'],
    events: 12,
    friends: 45
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profil Yönetimi</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol taraf - Profil bilgileri (1/3) */}
        <div className="col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={userData.profileImage} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl text-gray-800">{userData.firstName} {userData.lastName}</CardTitle>
                    <CardDescription className="text-sm flex items-center gap-2 mt-1">
                      <span>@{userData.username}</span>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Üye
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-5">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
                    <div className="space-y-4">
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
                          <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">
                          {new Date(userData.registrationDate).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-700">Konum</span>
                        </div>
                        <span className="text-sm bg-white px-2 py-1 rounded border">
                          {userData.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">İlgi Alanları</h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">İstatistikler</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md border">
                        <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                        <span className="text-sm font-medium">{userData.events}</span>
                        <span className="text-xs text-gray-500">Etkinlik</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md border">
                        <User className="h-5 w-5 text-blue-500 mb-1" />
                        <span className="text-sm font-medium">{userData.friends}</span>
                        <span className="text-xs text-gray-500">Arkadaş</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgilerini Düzenle</CardTitle>
              <CardDescription>
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