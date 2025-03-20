import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 space-y-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
} 