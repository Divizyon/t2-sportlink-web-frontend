"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  Users,
  Calendar,
  Newspaper,
  Shield,
  BarChart2,
  Megaphone,
  Settings,
  BookOpen,
  Activity,
  Map,
  UserCog,
  UserPlus
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import adminService from "@/lib/services/adminService";

// Icon mapping bileşeni
const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const iconProps = { className: cn("h-5 w-5", className) };

  switch (name) {
    case "Home":
      return <Home {...iconProps} />;
    case "Users":
      return <Users {...iconProps} />;
    case "Calendar":
      return <Calendar {...iconProps} />;
    case "Newspaper":
      return <Newspaper {...iconProps} />;
    case "Shield":
      return <Shield {...iconProps} />;
    case "BarChart2":
      return <BarChart2 {...iconProps} />;
    case "Megaphone":
      return <Megaphone {...iconProps} />;
    case "Settings":
      return <Settings {...iconProps} />;
    case "BookOpen":
      return <BookOpen {...iconProps} />;
    case "Activity":
      return <Activity {...iconProps} />;
    case "Map":
      return <Map {...iconProps} />;
    case "UserCog":
      return <UserCog {...iconProps} />;
    case "UserPlus":
      return <UserPlus {...iconProps} />;
    default:
      return <div className={cn("h-5 w-5", className)} />;
  }
};

const baseRoutes = [
  {
    label: "Ana Sayfa",
    href: "/dashboard",
    icon: "Home",
  },
  {
    label: "Kullanıcılar",
    href: "/dashboard/users",
    icon: "Users",
  },
  {
    label: "Etkinlikler",
    href: "/dashboard/events",
    icon: "Calendar",
  },
  {
    label: "Spor Haberleri",
    href: "/dashboard/news",
    icon: "Newspaper",
  },
  {
    label: "Duyurular",
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

// Sadece superadmin için gösterilecek rotalar
const superAdminRoutes = [
  {
    label: "Admin Yönetimi",
    href: "/dashboard/admins",
    icon: "UserPlus",
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [routes, setRoutes] = useState(baseRoutes);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // SuperAdmin durumunu kontrol et ve rotaları güncelle
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        // Kullanıcı oturum açmış mı kontrol et
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await adminService.checkSuperAdminStatus();

        if (response.success && response.data.isSuperAdmin) {
          setIsSuperAdmin(true);
          setRoutes([...baseRoutes, ...superAdminRoutes]);
        }
      } catch (error) {
        console.error("SuperAdmin kontrolü sırasında hata:", error);
      }
    };

    checkSuperAdminStatus();
  }, []);

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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
                    pathname === route.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <IconComponent
                    name={route.icon}
                    className={pathname === route.href ? "text-primary" : "text-muted-foreground"}
                  />
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
                  pathname === route.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IconComponent
                  name={route.icon}
                  className={pathname === route.href ? "text-primary" : "text-muted-foreground"}
                />
                <span>{route.label}</span>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
} 