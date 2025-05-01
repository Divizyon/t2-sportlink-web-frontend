import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ListFilter, Calendar } from "lucide-react";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

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

interface BlockedUsersProps {
  blockedUsers: BlockedUser[];
  usersData: Record<string, UserData>;
  onUserClick: (userId: string) => void;
  onAdminClick: (adminId: string) => void;
}

export function BlockedUsers({ 
  blockedUsers, 
  usersData, 
  onUserClick, 
  onAdminClick 
}: BlockedUsersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedReasons([]);
    toast({
      title: "Filtreler Temizlendi",
      description: "Tüm filtreler temizlendi."
    });
  };

  const handleReasonChange = (reason: string) => {
    setSelectedReasons(prev => {
      if (prev.includes(reason)) {
        return prev.filter(r => r !== reason);
      } else {
        return [...prev, reason];
      }
    });
  };

  // Tüm sebepleri belirle
  const allReasons = [...new Set(blockedUsers.map(user => user.reason))];

  // Filtrelenmiş kullanıcılar
  const filteredUsers = blockedUsers.filter(user => {
    // Arama terimine göre filtrele
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.admin.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sebep filtresine göre filtrele
    const matchesReason = selectedReasons.length === 0 || 
      selectedReasons.includes(user.reason);
    
    return matchesSearch && matchesReason;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engellenen Kullanıcılar</CardTitle>
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-4">
            <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button 
                variant="outline" 
                className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Select>
              <SelectTrigger className="w-10 h-10 p-0 [&>svg]:hidden">
                <div className="flex items-center justify-center w-full h-full relative">
                  <Filter className="h-5 w-5" />
                  {selectedReasons.length > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary"></span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                <div className="mb-2 px-2 font-semibold text-sm">Sebebe Göre Filtrele</div>
                <div className="flex flex-col gap-2 p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-all-reasons" 
                      checked={selectedReasons.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedReasons([]);
                        }
                      }}
                    />
                    <div className="flex items-center text-sm cursor-pointer">
                      <ListFilter className="mr-2 h-4 w-4" />
                      <label htmlFor="filter-all-reasons">Tüm Sebepler</label>
                    </div>
                  </div>
                  
                  {allReasons.map((reason, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`filter-reason-${index}`} 
                        checked={selectedReasons.includes(reason)}
                        onCheckedChange={() => handleReasonChange(reason)}
                      />
                      <div className="flex items-center text-sm cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                        <label htmlFor={`filter-reason-${index}`}>{reason}</label>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedReasons.length > 0 && (
                  <div className="flex justify-center p-2 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Sebep</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Engelleyen Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div
                    onClick={() => onUserClick(user.id)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={usersData[user.id]?.avatar} />
                      <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                        {usersData[user.id]?.fullName.split(" ").map(name => name[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="group">
                      <span className="text-sm font-medium text-foreground relative inline-block">
                        {user.username}
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.reason}</TableCell>
                <TableCell>{user.date}</TableCell>
                <TableCell>
                  <div
                    onClick={() => onAdminClick(user.adminId)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={usersData[user.adminId]?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {usersData[user.adminId]?.fullName.split(" ").map(name => name[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="group">
                      <span className="text-sm font-medium text-foreground relative inline-block">
                        {user.admin}
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  {searchTerm || selectedReasons.length > 0 
                    ? "Filtreleme kriterlerine uygun kullanıcı bulunamadı."
                    : "Engellenen kullanıcı bulunmamaktadır."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 