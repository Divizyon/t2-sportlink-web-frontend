"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare, CheckCircle2, User } from "lucide-react";
import type { ReportedUser, ReportDetail } from "./types";
import { UserProfileCard } from "./UserProfileCard";

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 40) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

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

interface ReportDetailsProps {
  selectedUser: ReportedUser | null;
  reportDetails: ReportDetail[];
  onReportClick: (report: ReportDetail) => void;
}

export function ReportDetails({
  selectedUser,
  reportDetails,
  onReportClick,
}: ReportDetailsProps) {
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
    fullName?: string,
    event?: React.MouseEvent
  ) => {
    if (event) event.stopPropagation();
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

  // İlk render'da veya reportDetails değiştiğinde
  // ilk raporu seçen yardımcı fonksiyon
  const selectFirstReport = () => {
    if (reportDetails && reportDetails.length > 0) {
      const firstReport = reportDetails[0];
      if (firstReport) {
        onReportClick(firstReport);
      }
    }
  };

  if (!selectedUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapor Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Detayları görüntülemek için bir kullanıcı seçin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>
          <Popover
            open={profileUser?.id === selectedUser.id}
            onOpenChange={(open) => !open && closeUserProfile()}
          >
            <PopoverTrigger asChild>
              <span
                className="cursor-pointer text-primary hover:underline"
                onClick={(e) => openUserProfile(selectedUser.id, selectedUser.username, selectedUser.fullName, e)}
              >
                {displayUsername(selectedUser.username)}
              </span>
            </PopoverTrigger>
            {profileUser?.id === selectedUser.id && (
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
          {' '}Hakkında Raporlar
        </CardTitle>
      </CardHeader>
      <CardContent>

        <Separator className="mb-4" />

        <div className="space-y-4">
          <h4 className="font-medium">Rapor Geçmişi</h4>

          {reportDetails.length > 0 ? (
            <>
              {/* İlk raporu seçmek için düğme ekleyelim */}
              <button
                onClick={selectFirstReport}
                className="text-sm text-primary hover:underline mb-2"
              >
                İlk raporu göster
              </button>

              {reportDetails.map((report) => (
                <div
                  key={report.id}
                  className="border p-3 rounded-md hover:border-primary cursor-pointer transition-colors"
                  onClick={() => onReportClick(report)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        <span>Raporlayan: </span>
                        <Popover
                          open={profileUser?.id === report.reporter_id}
                          onOpenChange={(open) => !open && closeUserProfile()}
                        >
                          <PopoverTrigger asChild>
                            <span
                              className="text-primary hover:underline"
                              onClick={(e) => openUserProfile(
                                report.reporter_id,
                                displayUsername(report.reporter_username || report.reporterName),
                                report.reporter_name,
                                e
                              )}
                            >
                              {displayUsername(report.reporter_username || report.reporterName)}
                            </span>
                          </PopoverTrigger>
                          {profileUser?.id === report.reporter_id && (
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
                        <span className="ml-1 text-xs text-muted-foreground font-mono">(ID: {report.reporter_id})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(report.report_date || report.reportDate || "")}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {report.status === "reviewed" || report.reviewed ? (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                          İncelendi
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600">
                          Bekliyor
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <Badge variant="secondary" className="mb-2">
                      {report.report_reason || report.reason}
                    </Badge>
                    <p className="text-sm">{report.description}</p>
                  </div>

                  {(report.admin_notes || report.adminMessage) && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>Admin notu:</span>
                      </div>
                      <p className="text-sm">{truncateText(report.admin_notes || report.adminMessage || "")}</p>
                      {report.reviewerAdmin && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3 mr-1" />
                          <span>İnceleyen admin: {report.reviewerAdmin}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-3">
              Bu kullanıcı için henüz rapor detayı bulunmamaktadır.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 