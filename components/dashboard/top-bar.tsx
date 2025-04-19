"use client"

import { usePathname } from "next/navigation"

export function TopBar() {
  const pathname = usePathname()

  const getTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Ana Sayfa"
      case "/dashboard/users":
        return "Kullanıcı Yönetimi"
      case "/dashboard/events":
        return "Etkinlik Yönetimi"
      case "/dashboard/news":
        return "Spor Haberleri"
      case "/dashboard/announcements":
        return "Duyuru Yönetimi"
      case "/dashboard/security":
        return "Güvenlik"
      case "/dashboard/reports":
        return "Raporlar"
      default:
        return "SportLink"
    }
  }

  return (
    <div className="h-16 border-b bg-background">
      <div className="flex h-full items-center px-8">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
      </div>
    </div>
  )
} 