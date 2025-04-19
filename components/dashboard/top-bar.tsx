"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"

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
        return ""
    }
  }

  const title = getTitle()

  return (
    <div className="h-16 border-b bg-background">
      <div className="flex h-full items-center px-8 justify-center">
        {title ? (
          <h1 className="text-2xl font-bold">{title}</h1>
        ) : (
          <div className="h-12 flex justify-center items-center">
            <img 
              src="/sportLink.svg" 
              alt="SportLink Logo" 
              className="h-12 w-auto"
            />
          </div>
        )}
      </div>
    </div>
  )
} 