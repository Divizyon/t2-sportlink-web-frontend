"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "lucide-react";
import type { ReportDetail } from "./types";
import { UserProfileCard } from "./UserProfileCard";

// Helper function to format date 
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Bilinmiyor';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

interface ReportSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedReport: ReportDetail | null;
  adminMessage: string;
  setAdminMessage: (message: string) => void;
  handleSaveAdminMessage: () => void;
}

export function ReportSheet({
  isOpen,
  setIsOpen,
  selectedReport,
  adminMessage,
  setAdminMessage,
  handleSaveAdminMessage,
}: ReportSheetProps) {
  const [profileUser, setProfileUser] = useState<{
    id: string;
    username: string;
    fullName?: string | undefined;
  } | null>(null);

  // Kullanıcı adı gösterimi için yardımcı fonksiyon
  const displayUsername = (username: string | undefined): string => {
    // Username undefined veya boş string ise daha kullanıcı dostu bir mesaj göster
    if (!username || username.trim() === '') {
      return "Kullanıcı";
    }
    return username;
  };

  const openUserProfile = (
    userId: string, 
    username: string, 
    fullName?: string
  ) => {
    if (!userId || !username) return;
    
    setProfileUser({
      id: userId,
      username: username,
      fullName: fullName
    });
  };

  const closeUserProfile = () => {
    setProfileUser(null);
  };

  if (!selectedReport) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Rapor Detayları</SheetTitle>
          <SheetDescription>
            <span className="inline-block mt-1">
              <Badge variant="outline">ID: {selectedReport.id}</Badge>
            </span>
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Raporlayan</h3>
              <Popover 
                open={profileUser?.id === selectedReport.reporter_id} 
                onOpenChange={(open) => !open && closeUserProfile()}
              >
                <PopoverTrigger asChild>
                  <div 
                    className="text-primary hover:underline cursor-pointer"
                    onClick={() => openUserProfile(
                      selectedReport.reporter_id, 
                      displayUsername(selectedReport.reporter_username || selectedReport.reporterName),
                      selectedReport.reporter_name
                    )}
                  >
                    {displayUsername(selectedReport.reporter_username || selectedReport.reporterName)}
                  </div>
                </PopoverTrigger>
                {profileUser?.id === selectedReport.reporter_id && (
                  <PopoverContent className="w-80 p-0" align="start">
                    <UserProfileCard
                      userId={profileUser?.id || ""}
                      username={profileUser?.username || ""}
                      fullName={profileUser?.fullName}
                      onClose={closeUserProfile}
                    />
                  </PopoverContent>
                )}
              </Popover>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Raporlanan</h3>
              <Popover 
                open={profileUser?.id === selectedReport.reported_id} 
                onOpenChange={(open) => !open && closeUserProfile()}
              >
                <PopoverTrigger asChild>
                  <div 
                    className="text-primary hover:underline cursor-pointer"
                    onClick={() => openUserProfile(
                      selectedReport.reported_id, 
                      displayUsername(selectedReport.reported_username || selectedReport.reportedName),
                      selectedReport.reported_name
                    )}
                  >
                    {displayUsername(selectedReport.reported_username || selectedReport.reportedName)}
                  </div>
                </PopoverTrigger>
                {profileUser?.id === selectedReport.reported_id && (
                  <PopoverContent className="w-80 p-0" align="start">
                    <UserProfileCard
                      userId={profileUser?.id || ""}
                      username={profileUser?.username || ""}
                      fullName={profileUser?.fullName}
                      onClose={closeUserProfile}
                    />
                  </PopoverContent>
                )}
              </Popover>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Rapor Tarihi</h3>
              <p>{formatDate(selectedReport.report_date || selectedReport.reportDate || "")}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Neden</h3>
              <Badge variant="secondary">{selectedReport.report_reason || selectedReport.reason}</Badge>
            </div>
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Admin Notu</h3>
              <Textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Bu raporla ilgili notunuzu ekleyin..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <Button 
            type="submit" 
            className="w-full" 
            onClick={handleSaveAdminMessage}
          >
            {adminMessage.trim() ? 'Notu Kaydet ve İncelendi Olarak İşaretle' : 'Notu Temizle ve İncelenmedi Olarak İşaretle'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 