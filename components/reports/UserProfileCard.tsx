"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, User, Mail, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserProfileCardProps } from "./types";

export function UserProfileCard({
  userId,
  username,
  fullName,
  avatar,
  onClose
}: UserProfileCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // For demo purposes, we'll just use the provided data
  // In a real application, you would fetch user data here
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch user data from API
        // For now, we'll just use the props data
        setUserData({
          id: userId,
          username: username,
          fullName: fullName || username,
          avatar: avatar
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, username, fullName, avatar]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-pulse h-20 w-full bg-gray-200 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Kullanıcı bilgileri yüklenemedi.
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
            <AvatarImage src={userData.avatar || ""} alt={userData.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(userData.fullName || userData.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl text-gray-800">{userData.fullName}</CardTitle>
            <CardDescription className="text-sm flex items-center gap-2 mt-1">
              <span>@{userData.username}</span>
              <Badge className="bg-primary">Üye</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Kullanıcı ID:</span>
            <span>{userData.id}</span>
          </div>
          
          <Separator />
          
          <div className="py-2">
            <h3 className="text-sm font-medium mb-2">Hızlı İşlemler</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Profili Görüntüle
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Mesaj Gönder
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 