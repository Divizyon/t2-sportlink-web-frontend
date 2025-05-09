"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  // Sadece client tarafında render et - sadece ilk yüklemede çalışacak
  useEffect(() => {
    setIsClient(true);
  }, []); // Boş dependency array ile sadece bir kez çalışır

  // Server tarafında boş içerik göster
  if (!isClient) {
    return <div className="loading">Yükleniyor...</div>; // Boş sayfa yerine yükleniyor göster
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onProfilePanelChange={setProfilePanelOpen} />
        <main 
          className={`flex-1 overflow-y-auto p-6 transition-all duration-200 ease-in-out flex flex-col ${
            profilePanelOpen ? "filter blur-sm pointer-events-none" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
} 