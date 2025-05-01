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
import { AlertCircle, Shield, User, Mail, Calendar, Phone, MapPin } from "lucide-react";

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
              <CardHeader className="px-0 pt-0 pb-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-md">
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-lg bg-rose-100 text-rose-700">
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-gray-800">{user.fullName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>@{user.username}</span>
                      <Badge variant="destructive">
                        Engellendi
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="px-4 pt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.location || "Konum belirtilmemiş"}</span>
                </div>
              </CardHeader>
              <CardContent className="px-0 pt-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-amber-500" />
                    Güvenlik Bilgileri
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-800">Engelleme Bilgileri</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-amber-700 pl-6">
                        <div>Engelleme Nedeni:</div>
                        <div className="font-medium">
                          {blockedUsers.find(u => u.id === user.id)?.reason || "Belirtilmemiş"}
                        </div>
                        <div>Engelleme Tarihi:</div>
                        <div className="font-medium">
                          {blockedUsers.find(u => u.id === user.id)?.date || "Belirtilmemiş"}
                        </div>
                        <div>Engelleyen Admin:</div>
                        <div className="font-medium">
                          {blockedUsers.find(u => u.id === user.id)?.admin || "Belirtilmemiş"}
                        </div>
                      </div>
                    </div>
                    
                    {user.failedLoginAttempts && user.failedLoginAttempts > 0 && (
                      <div className="bg-rose-50 border border-rose-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                          <span className="font-medium text-rose-800">Şüpheli Giriş Aktivitesi</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-rose-700 pl-6">
                          <div>Başarısız Giriş Sayısı:</div>
                          <div className="font-medium">{user.failedLoginAttempts}</div>
                          <div>Son Başarısız Giriş:</div>
                          <div className="font-medium">{user.lastFailedLogin}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Kişisel Bilgiler</h3>
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
                        <User className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Rol</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{user.role}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{formatDate(user.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-500" />
                        <span className="text-sm font-medium text-gray-700">Son Giriş</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{user.lastLogin}</span>
                    </div>
                  </div>
                </div>
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