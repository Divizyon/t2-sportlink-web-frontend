"use client";

import React from "react";
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
import type { ReportDetail } from "./types";

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
  if (!selectedReport) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Rapor Detayları</SheetTitle>
          <SheetDescription>
            <Badge variant="outline" className="mt-1">ID: {selectedReport.id}</Badge>
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Raporlayan</h3>
              <p>{selectedReport.reporterName}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedReport.reporterId}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Rapor Tarihi</h3>
              <p>{selectedReport.reportDate}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Neden</h3>
              <Badge variant="secondary">{selectedReport.reason}</Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Açıklama</h3>
              <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
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
            disabled={adminMessage.trim() === ''}
          >
            Notu Kaydet ve Raporu İşaretle
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 