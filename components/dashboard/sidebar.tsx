"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";

const routes = [
  {
    label: "Ana Sayfa",
    href: "/dashboard",
    icon: "Home",
  },
  {
    label: "Kullanıcı Yönetimi",
    href: "/dashboard/users",
    icon: "Users",
  },
  {
    label: "Etkinlik Yönetimi",
    href: "/dashboard/events",
    icon: "Calendar",
  },
  {
    label: "Spor Haberleri",
    href: "/dashboard/news",
    icon: "Newspaper",
  },
  {
    label: "Duyuru Yönetimi",
    href: "/dashboard/announcements",
    icon: "Megaphone",
  },
  {
    label: "Güvenlik",
    href: "/dashboard/security",
    icon: "Shield",
  },
  {
    label: "Raporlar",
    href: "/dashboard/reports",
    icon: "BarChart2",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menüyü Aç</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center justify-center px-6 border-b">
            <Link href="/dashboard" className="flex items-center justify-center">
              <img 
                src="/sportLink.svg" 
                alt="SportLink Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="space-y-1 p-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <span>{route.label}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center justify-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center justify-center">
            <img 
              src="/sportLink.svg" 
              alt="SportLink Logo" 
              className="h-12 w-auto"
            />
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <span>{route.label}</span>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
} 