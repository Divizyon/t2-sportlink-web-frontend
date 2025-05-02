"use client";

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import useAuth from "@/lib/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ReportFilterBar } from "@/components/reports/ReportFilterBar"
import { ReportedUsersList } from "@/components/reports/ReportedUsersList"
import { ReportDetails } from "@/components/reports/ReportDetails"
import { ReportSheet } from "@/components/reports/ReportSheet"
import type { ReportedUser, ReportDetail } from "@/components/reports/types"
import { useStore } from "@/lib/store"

export default function ReportsPage() {
  const auth = useAuth("admin")
  const router = useRouter()
  
  // Zustand store
  const { 
    reportedUsers, 
    reportSelectedUser,
    reportDetails, 
    reportIsLoading,
    reportError,
    reportCurrentPage,
    totalReportedUsers,
    getReportedUsers,
    getReportDetailsForUser,
    getAllReports,
    getEventReports,
    setReportSelectedUser,
    setReportSelectedReport,
    updateReport,
    removeReport,
    blockUserFromReports,
    searchReportedUsers
  } = useStore()
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all")
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false)
  const [adminMessage, setAdminMessage] = useState("")
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)

  // Veri yükleme
  useEffect(() => {
    getReportedUsers(currentPage, limit)
  }, [getReportedUsers, currentPage, limit])

  const handleUserSelect = (user: ReportedUser) => {
    setReportSelectedUser(user)
    // getReportDetailsForUser is called inside setReportSelectedUser
  }

  const handleBlockUser = async (userId: string, username: string) => {
    try {
      const success = await blockUserFromReports(userId, "Rapor nedeniyle engellendi")
      
      if (success) {
        toast({
          title: "Kullanıcı engellendi",
          description: `${username} başarıyla engellendi ve güvenlik listesine eklendi.`,
        })
        
        // Refresh the list of reported users
        getReportedUsers(currentPage, limit)
      } else {
        toast({
          title: "Hata",
          description: reportError || "Kullanıcı engellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Block user error:", error)
      toast({
        title: "API Hatası",
        description: "Kullanıcı engelleme API'si henüz implemente edilmemiş olabilir.",
        variant: "destructive",
      })
      
      // Update UI optimistically assuming the action worked
      // This is a temporary solution until the API is implemented
      const updatedUsers = reportedUsers.map(user => 
        user.id === userId ? { ...user, status: "blocked" as const } : user
      )
      
      // We're simulating a successful block operation on the frontend
      // This should be removed once the backend API is working
      toast({
        title: "Simule Edildi",
        description: `${username} engellendi (yalnızca UI güncellemesi).`,
      })
    }
  }

  const handleRemoveReport = async (reportId: string, username: string) => {
    try {
      const success = await removeReport(reportId)
      
      if (success) {
        toast({
          title: "Rapor kaldırıldı",
          description: `${username} için rapor kaldırıldı.`,
        })
        
        // If the user was selected, clear selection
        if (reportSelectedUser && reportDetails.length <= 1) {
          setReportSelectedUser(null)
        }
        
        // Refresh report list
        if (reportSelectedUser) {
          getReportDetailsForUser(reportSelectedUser.id)
        }
      } else {
        toast({
          title: "Hata",
          description: reportError || "Rapor kaldırılırken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Remove report error:", error)
      toast({
        title: "API Hatası",
        description: "Rapor kaldırma API'si henüz implemente edilmemiş olabilir.",
        variant: "destructive",
      })
      
      // Update UI optimistically assuming the action worked
      toast({
        title: "Simule Edildi",
        description: `${username} için rapor kaldırıldı (yalnızca UI güncellemesi).`,
      })
      
      // If current user is selected, refresh details optimistically
      if (reportSelectedUser) {
        // Filter out the removed report from the details
        const updatedDetails = reportDetails.filter(report => report.id !== reportId)
        
        // If this was the last report for the user, clear selection
        if (updatedDetails.length === 0) {
          setReportSelectedUser(null)
        }
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    getReportedUsers(1, limit) // Filtreleri temizleyince tüm verileri tekrar getir
    setCurrentPage(1)
  }

  const handleSearch = () => {
    searchReportedUsers(searchTerm, statusFilter)
  }

  const handleReportClick = (report: ReportDetail) => {
    setSelectedReport(report)
    setReportSelectedReport(report)
    setAdminMessage(report.adminMessage || "")
    setIsReportSheetOpen(true)
  }

  const handleSaveAdminMessage = async () => {
    if (!selectedReport) return

    // Check if admin message is empty (trimmed)
    const isEmptyMessage = adminMessage.trim() === '';

    try {
      // Update report via API using updateReport
      await updateReport(selectedReport.id, {
        adminMessage: isEmptyMessage ? '' : adminMessage,
        reviewed: !isEmptyMessage,
        reviewerAdmin: isEmptyMessage ? undefined : (auth.user?.username || "Admin")
      })
      
      setIsReportSheetOpen(false)
      toast({
        title: isEmptyMessage ? "Admin notu temizlendi" : "Admin notu kaydedildi",
        description: isEmptyMessage 
          ? "Rapor incelenmedi olarak işaretlendi." 
          : "Rapor incelendi olarak işaretlendi.",
      })
      
      // Refresh report details if a user is selected
      if (reportSelectedUser) {
        getReportDetailsForUser(reportSelectedUser.id)
      }
    } catch (error) {
      console.error("Update report error:", error)
      
      // Check if this is an API error (404 or other)
      if (error instanceof Error && error.message.includes("404")) {
        toast({
          title: "API Hatası",
          description: "Rapor güncelleme API'si henüz implemente edilmemiş olabilir.",
          variant: "destructive",
        })
        
        // Update UI optimistically
        setIsReportSheetOpen(false)
        toast({
          title: "Simule Edildi",
          description: `Rapor notu ${isEmptyMessage ? 'temizlendi' : 'güncellendi'} (yalnızca UI).`,
        })
      } else {
        toast({
          title: "Hata",
          description: reportError || "Admin notu kaydedilirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
  }

  if (!auth.hasRequiredRole) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Yetkiniz Bulunmamaktadır</h1>
        <p>Bu sayfayı görüntülemek için admin yetkisi gerekmektedir.</p>
      </div>
    )
  }

  if (reportIsLoading && reportedUsers.length === 0) {
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
                onSearch={handleSearch}
              />
            </CardHeader>
            <CardContent>
              <ReportedUsersList
                reportedUsers={reportedUsers}
                selectedUser={reportSelectedUser}
                handleUserSelect={handleUserSelect}
                handleBlockUser={handleBlockUser}
                handleRemoveReport={handleRemoveReport}
                currentPage={reportCurrentPage}
                totalUsers={totalReportedUsers}
                pageSize={limit}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Sağ panel (1/3) - Rapor detayları */}
        <div className="w-full md:w-1/3">
          <ReportDetails
            selectedUser={reportSelectedUser}
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