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
import { Mail, Calendar, Phone, MapPin } from "lucide-react";

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
}

interface AdminDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: UserData | null;
  formatDate: (dateString?: string) => string;
}

export function AdminDetailDialog({ 
  open, 
  onOpenChange, 
  admin, 
  formatDate 
}: AdminDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin Bilgileri</DialogTitle>
          <DialogDescription>
            İşlemi gerçekleştiren admin detayları
          </DialogDescription>
        </DialogHeader>
        {admin && (
          <div className="space-y-4">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0 pt-0 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md">
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={admin.avatar} alt={admin.username} />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                      {admin.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-gray-800">{admin.fullName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>@{admin.username}</span>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="px-4 pt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{admin.location || "Konum belirtilmemiş"}</span>
                </div>
              </CardHeader>
              <CardContent className="px-0 pt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">E-posta</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{admin.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Telefon</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{admin.phone || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-500" />
                        <span className="text-sm font-medium text-gray-700">Son Giriş</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{admin.lastLogin}</span>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Kayıt Tarihi</span>
                      </div>
                      <span className="text-sm bg-white px-2 py-1 rounded border">{formatDate(admin.createdAt)}</span>
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