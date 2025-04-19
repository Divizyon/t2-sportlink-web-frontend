"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Newspaper,
  Shield,
  BarChart,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Ana Sayfa",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Kullanıcı Yönetimi",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Etkinlik Yönetimi",
    href: "/dashboard/events",
    icon: Calendar,
  },
  {
    title: "Spor Haberleri",
    href: "/dashboard/news",
    icon: Newspaper,
  },
  {
    title: "Güvenlik",
    href: "/dashboard/security",
    icon: Shield,
  },
  {
    title: "Raporlar",
    href: "/dashboard/reports",
    icon: BarChart,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-background border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="font-bold text-xl">SportLink</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 