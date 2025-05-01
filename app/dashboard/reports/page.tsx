"use client";

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Shield, X, Eye, Search, Filter, XCircle, MessageSquare, ListFilter, CheckCircle2, Trash2 } from "lucide-react"
import useAuth from "@/lib/hooks/useAuth"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ReportFilterBar } from "@/components/reports/ReportFilterBar"
import { ReportedUsersList } from "@/components/reports/ReportedUsersList"
import { ReportDetails } from "@/components/reports/ReportDetails"
import { ReportSheet } from "@/components/reports/ReportSheet"
import type { ReportedUser, ReportDetail } from "@/components/reports/types"

export default function ReportsPage() {
  const auth = useAuth("admin")
  const router = useRouter()
  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ReportedUser | null>(null)
  const [reportDetails, setReportDetails] = useState<ReportDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all")
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null)
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false)
  const [adminMessage, setAdminMessage] = useState("")

  // Örnek veri
  useEffect(() => {
    // Gerçek uygulamada bu verilerin API'dan çekilmesi gerekir
    const mockReportedUsers: ReportedUser[] = [
      { id: "1", username: "user1", reportCount: 3, lastReportDate: "2024-04-25", status: "active" },
      { id: "2", username: "user2", reportCount: 5, lastReportDate: "2024-04-24", status: "active" },
      { id: "3", username: "user3", reportCount: 2, lastReportDate: "2024-04-23", status: "blocked" },
      { id: "4", username: "user4", reportCount: 1, lastReportDate: "2024-04-22", status: "active" },
      { id: "5", username: "user5", reportCount: 4, lastReportDate: "2024-04-21", status: "active" },
    ]

    const mockReportDetails: { [key: string]: ReportDetail[] } = {
      "1": [
        { id: "r1", reporterId: "5", reporterName: "user5", reportDate: "2024-04-25", reason: "Kötü davranış", description: "Etkinlik sırasında kaba davrandı.", reviewed: false },
        { id: "r2", reporterId: "4", reporterName: "user4", reportDate: "2024-04-24", reason: "Uygunsuz içerik", description: "Profil fotoğrafı uygunsuz içerik barındırıyor.", reviewed: false },
        { id: "r3", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Taciz", description: "Özel mesajlarda rahatsız edici ifadeler kullandı.", reviewed: false },
      ],
      "2": [
        { id: "r4", reporterId: "1", reporterName: "user1", reportDate: "2024-04-24", reason: "Spam", description: "Sürekli spam mesajlar gönderiyor.", reviewed: false },
        { id: "r5", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Sahte profil", description: "Sahte bilgilerle açılmış bir profil.", reviewed: false },
      ],
      "3": [
        { id: "r6", reporterId: "2", reporterName: "user2", reportDate: "2024-04-23", reason: "Nefret söylemi", description: "Yorumlarda nefret söylemi içeren ifadeler kullandı.", reviewed: false },
      ],
      "4": [
        { id: "r7", reporterId: "5", reporterName: "user5", reportDate: "2024-04-22", reason: "Kötü davranış", description: "Etkinlikte agresif davranışlar sergiledi.", reviewed: false },
      ],
      "5": [
        { id: "r8", reporterId: "1", reporterName: "user1", reportDate: "2024-04-21", reason: "Uygunsuz içerik", description: "Paylaşımları uygunsuz içerik barındırıyor.", reviewed: false },
        { id: "r9", reporterId: "2", reporterName: "user2", reportDate: "2024-04-20", reason: "Taciz", description: "Rahatsız edici mesajlar gönderiyor.", reviewed: false },
      ],
    }

    setReportedUsers(mockReportedUsers)
    setLoading(false)

    // İlk kullanıcıyı seç
    const firstUser = mockReportedUsers[0]
    if (firstUser) {
      setSelectedUser(firstUser)
      const details = mockReportDetails[firstUser.id]
      if (details) {
        setReportDetails(details)
      } else {
        setReportDetails([])
      }
    }
  }, [])

  const handleUserSelect = (user: ReportedUser) => {
    setSelectedUser(user)
    // Gerçek uygulamada bu veriler API'dan çekilecek
    const userReports: { [key: string]: ReportDetail[] } = {
      "1": [
        { id: "r1", reporterId: "5", reporterName: "user5", reportDate: "2024-04-25", reason: "Kötü davranış", description: "Etkinlik sırasında kaba davrandı.", reviewed: false },
        { id: "r2", reporterId: "4", reporterName: "user4", reportDate: "2024-04-24", reason: "Uygunsuz içerik", description: "Profil fotoğrafı uygunsuz içerik barındırıyor.", reviewed: false },
        { id: "r3", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Taciz", description: "Özel mesajlarda rahatsız edici ifadeler kullandı.", reviewed: false },
      ],
      "2": [
        { id: "r4", reporterId: "1", reporterName: "user1", reportDate: "2024-04-24", reason: "Spam", description: "Sürekli spam mesajlar gönderiyor.", reviewed: false },
        { id: "r5", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Sahte profil", description: "Sahte bilgilerle açılmış bir profil.", reviewed: false },
      ],
      "3": [
        { id: "r6", reporterId: "2", reporterName: "user2", reportDate: "2024-04-23", reason: "Nefret söylemi", description: "Yorumlarda nefret söylemi içeren ifadeler kullandı.", reviewed: false },
      ],
      "4": [
        { id: "r7", reporterId: "5", reporterName: "user5", reportDate: "2024-04-22", reason: "Kötü davranış", description: "Etkinlikte agresif davranışlar sergiledi.", reviewed: false },
      ],
      "5": [
        { id: "r8", reporterId: "1", reporterName: "user1", reportDate: "2024-04-21", reason: "Uygunsuz içerik", description: "Paylaşımları uygunsuz içerik barındırıyor.", reviewed: false },
        { id: "r9", reporterId: "2", reporterName: "user2", reportDate: "2024-04-20", reason: "Taciz", description: "Rahatsız edici mesajlar gönderiyor.", reviewed: false },
      ],
    }
    
    const details = userReports[user.id]
    if (details) {
      setReportDetails(details)
    } else {
      setReportDetails([])
    }
  }

  const handleBlockUser = (userId: string, username: string) => {
    // Kullanıcıyı raporlanan kullanıcılar listesinden kaldır
    setReportedUsers(reportedUsers.filter(user => user.id !== userId))
    
    // Eğer engellenen kullanıcı seçili kullanıcıysa, seçimi temizle
    if (selectedUser?.id === userId) {
      setSelectedUser(null)
      setReportDetails([])
    }
    
    // Engellenen kullanıcıyı Güvenlik sayfasındaki engellenen kullanıcılar listesine eklemek için
    // localStorage'a kaydedelim (gerçek uygulamada API kullanılacaktır)
    try {
      const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]')
      blockedUsers.push({
        id: userId,
        username: username,
        blockedAt: new Date().toISOString(),
        reason: 'Rapor nedeniyle engellendi',
      })
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers))
      
      toast({
        title: "Kullanıcı engellendi",
        description: `${username} başarıyla engellendi ve güvenlik listesine eklendi.`,
      })
    } catch (error) {
      console.error("Engellenen kullanıcılar listesine eklenirken hata oluştu:", error)
      toast({
        title: "Kullanıcı engellendi",
        description: `${username} engellendi fakat güvenlik listesine eklenirken hata oluştu.`,
        variant: "destructive",
      })
    }
  }

  const handleRemoveReport = (userId: string, username: string) => {
    // Gerçek uygulamada bu işlem API üzerinden yapılacak
    setReportedUsers(reportedUsers.filter(user => user.id !== userId))
    if (selectedUser?.id === userId) {
      setSelectedUser(null)
      setReportDetails([])
    }
    toast({
      title: "Rapor kaldırıldı",
      description: `${username} rapor listesinden kaldırıldı.`,
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  const filteredUsers = reportedUsers.filter(user => {
    // Kullanıcı adı araması
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Durum filtresi
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleReportClick = (report: ReportDetail) => {
    setSelectedReport(report)
    setAdminMessage(report.adminMessage || "")
    setIsReportSheetOpen(true)
  }

  const handleSaveAdminMessage = () => {
    if (!selectedReport) return

    // Gerçek uygulamada bu işlem API üzerinden yapılacak
    setReportDetails(reportDetails.map(report => 
      report.id === selectedReport.id 
        ? { ...report, adminMessage, reviewed: true } 
        : report
    ))
    
    setIsReportSheetOpen(false)
    toast({
      title: "Admin notu kaydedildi",
      description: "Rapor incelendi olarak işaretlendi.",
    })
  }

  if (!auth.hasRequiredRole) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Yetkiniz Bulunmamaktadır</h1>
        <p>Bu sayfayı görüntülemek için admin yetkisi gerekmektedir.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Raporlar</h1>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Raporlar</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sol panel (2/3) - Raporlanan kullanıcılar listesi */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Raporlanan Kullanıcılar</CardTitle>
              
              {/* Arama ve filtreleme bileşeni */}
              <ReportFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                clearFilters={clearFilters}
              />
            </CardHeader>
            <CardContent>
              <ReportedUsersList
                reportedUsers={filteredUsers}
                selectedUser={selectedUser}
                handleUserSelect={handleUserSelect}
                handleBlockUser={handleBlockUser}
                handleRemoveReport={handleRemoveReport}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Sağ panel (1/3) - Rapor detayları */}
        <div className="w-full md:w-1/3">
          <ReportDetails
            selectedUser={selectedUser}
            reportDetails={reportDetails}
            onReportClick={handleReportClick}
          />
        </div>
      </div>
      
      {/* Rapor detay sayfası */}
      <ReportSheet
        isOpen={isReportSheetOpen}
        setIsOpen={setIsReportSheetOpen}
        selectedReport={selectedReport}
        adminMessage={adminMessage}
        setAdminMessage={setAdminMessage}
        handleSaveAdminMessage={handleSaveAdminMessage}
      />
    </div>
  )
} 