"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import type { ReportedUser, ReportDetail } from "./types";

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
        <CardTitle>{selectedUser.username} Hakkında Raporlar</CardTitle>
      </CardHeader>
      <CardContent>

        <Separator className="mb-4" />

        <div className="space-y-4">
          <h4 className="font-medium">Rapor Geçmişi</h4>

          {reportDetails.length > 0 ? (
            reportDetails.map((report) => (
              <div
                key={report.id}
                className="border p-3 rounded-md hover:border-primary cursor-pointer transition-colors"
                onClick={() => onReportClick(report)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {report.reporterName}{" "}
                      <span className="text-muted-foreground text-sm">tarafından</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{report.reportDate}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {report.reviewed ? (
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
                    {report.reason}
                  </Badge>
                  <p className="text-sm">{report.description}</p>
                </div>

                {report.adminMessage && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>Admin notu:</span>
                    </div>
                    <p className="text-sm">{report.adminMessage}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-primary border-primary hover:bg-primary/5 text-xs px-2 py-0 h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportClick(report);
                  }}
                >
                  {report.reviewed ? "Detayları Görüntüle" : "İncele"}
                </Button>
              </div>
            ))
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