import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Calendar, Phone, MapPin, AlertCircle, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  lastLogin?: string;
  status: string;
  phone?: string;
  createdAt?: string;
  location?: string;
  failedLoginAttempts?: number;
  lastFailedLogin?: string;
}

interface BlockedUser {
  id: string;
  username: string;
  reason: string;
  date: string;
  admin: string;
  adminId: string;
}

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  blockedUsers: BlockedUser[];
  formatDate: (dateString?: string) => string;
}

export function UserDetailDialog({ 
  open, 
  onOpenChange, 
  user, 
  blockedUsers,
  formatDate
}: UserDetailDialogProps) {
  // Kullanıcının engelleme durumunu kontrol et
  const blockedUserInfo = user ? blockedUsers.find(b => b.id === user.id) : null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kullanıcı Bilgileri</DialogTitle>
          <DialogDescription>
            Engellenen kullanıcının detaylı bilgileri
          </DialogDescription>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <Card className="border-0 shadow-none">
              <CardHeader className={`px-0 pt-0 pb-3 rounded-md ${
                user.status === "Engellendi" ? 
                "bg-gradient-to-r from-red-50 to-pink-50" : 
                "bg-gradient-to-r from-blue-50 to-indigo-50"
              }`}>
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className={`text-lg ${
                      user.status === "Engellendi" ?
                      "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-gray-800">{user.fullName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>@{user.username}</span>
                      <Badge className={`${
                        user.status === "Engellendi" ? 
                        "bg-red-500 hover:bg-red-600" : 
                        "bg-green-500 hover:bg-green-600"
                      }`}>
                        {user.status}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="px-4 pt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.location || "Konum belirtilmemiş"}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                <Tabs defaultValue="contact">
                  <TabsList className="mb-4">
                    <TabsTrigger value="contact">Kişisel</TabsTrigger>
                    <TabsTrigger value="security">Güvenlik</TabsTrigger>
                    {blockedUserInfo && <TabsTrigger value="block-info">Engelleme</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="contact" className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">İletişim Bilgileri</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">E-posta</span>
                          </div>
                          <span className="text-sm bg-white px-2 py-1 rounded border">{user.email}</span>
                        </div>
                        
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Telefon</span>
                          </div>
                          <span className="text-sm bg-white px-2 py-1 rounded border">{user.phone || '-'}</span>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-teal-500" />
                            <span className="text-sm font-medium text-gray-700">Son Giriş</span>
                          </div>
                          <span className="text-sm bg-white px-2 py-1 rounded border">{user.lastLogin}</span>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                          </div>
                          <span className="text-sm bg-white px-2 py-1 rounded border">{formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Güvenlik Bilgileri</h3>
                      
                      {user.failedLoginAttempts && user.failedLoginAttempts > 0 ? (
                        <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-4">
                          <div className="flex gap-2 items-center">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">Şüpheli Aktivite</span>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            Bu hesapta {user.failedLoginAttempts} başarısız giriş denemesi tespit edildi.
                            Son deneme: {user.lastFailedLogin || "bilinmiyor"}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4">
                          <div className="flex gap-2 items-center">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">Güvenli Aktivite</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Bu hesapta şüpheli aktivite tespit edilmedi.
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Son Giriş</span>
                          </div>
                          <span className="text-sm bg-white px-2 py-1 rounded border">{user.lastLogin || "Bilinmiyor"}</span>
                        </div>
                        
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">Hesap Durumu</span>
                          </div>
                          <Badge className={`${
                            user.status === "Engellendi" ? 
                            "bg-red-500 hover:bg-red-600" : 
                            "bg-green-500 hover:bg-green-600"
                          }`}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {blockedUserInfo && (
                    <TabsContent value="block-info">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-red-700 mb-3">Engelleme Bilgileri</h3>
                        
                        <Separator className="my-2" />
                        
                        <div className="space-y-4 mt-3">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-gray-700">Engelleme Sebebi</span>
                            </div>
                            <span className="text-sm bg-white px-2 py-1 rounded border">{blockedUserInfo.reason}</span>
                          </div>
                          
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-gray-700">Engelleme Tarihi</span>
                            </div>
                            <span className="text-sm bg-white px-2 py-1 rounded border">{blockedUserInfo.date}</span>
                          </div>
                          
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-gray-700">İşlemi Yapan</span>
                            </div>
                            <span className="text-sm bg-white px-2 py-1 rounded border">{blockedUserInfo.admin}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 