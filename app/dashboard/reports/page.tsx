"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Raporlar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <p className="text-muted-foreground text-center mb-4">
            Bu özellik yakında kullanıma açılacaktır.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 