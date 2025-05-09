import "./globals.css";
import "../public/css/calendar-fix.css";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SportLink - Spor Ağı",
  description: "Spor yapmaktan keyif alanların buluşma noktası",
  viewport: "width=device-width, initial-scale=1",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
