"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Shield, X, Eye } from "lucide-react"
import useAuth from "@/lib/hooks/useAuth"
import { Separator } from "@/components/ui/separator"

// Rapor verileri için örnek tipler
interface ReportedUser {
  id: string
  username: string
  reportCount: number
  lastReportDate: string
  status: "active" | "blocked"
}

interface ReportDetail {
  id: string
  reporterId: string
  reporterName: string
  reportDate: string
  reason: string
  description: string
}

export default function ReportsPage() {
  const { isAdmin } = useAuth()
  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ReportedUser | null>(null)
  const [reportDetails, setReportDetails] = useState<ReportDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)

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
        { id: "r1", reporterId: "5", reporterName: "user5", reportDate: "2024-04-25", reason: "Kötü davranış", description: "Etkinlik sırasında kaba davrandı." },
        { id: "r2", reporterId: "4", reporterName: "user4", reportDate: "2024-04-24", reason: "Uygunsuz içerik", description: "Profil fotoğrafı uygunsuz içerik barındırıyor." },
        { id: "r3", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Taciz", description: "Özel mesajlarda rahatsız edici ifadeler kullandı." },
      ],
      "2": [
        { id: "r4", reporterId: "1", reporterName: "user1", reportDate: "2024-04-24", reason: "Spam", description: "Sürekli spam mesajlar gönderiyor." },
        { id: "r5", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Sahte profil", description: "Sahte bilgilerle açılmış bir profil." },
      ],
      "3": [
        { id: "r6", reporterId: "2", reporterName: "user2", reportDate: "2024-04-23", reason: "Nefret söylemi", description: "Yorumlarda nefret söylemi içeren ifadeler kullandı." },
      ],
      "4": [
        { id: "r7", reporterId: "5", reporterName: "user5", reportDate: "2024-04-22", reason: "Kötü davranış", description: "Etkinlikte agresif davranışlar sergiledi." },
      ],
      "5": [
        { id: "r8", reporterId: "1", reporterName: "user1", reportDate: "2024-04-21", reason: "Uygunsuz içerik", description: "Paylaşımları uygunsuz içerik barındırıyor." },
        { id: "r9", reporterId: "2", reporterName: "user2", reportDate: "2024-04-20", reason: "Taciz", description: "Rahatsız edici mesajlar gönderiyor." },
      ],
    }

    setReportedUsers(mockReportedUsers)
    setLoading(false)

    // İlk kullanıcıyı seç
    if (mockReportedUsers.length > 0) {
      setSelectedUser(mockReportedUsers[0])
      setReportDetails(mockReportDetails[mockReportedUsers[0].id])
    }
  }, [])

  const handleUserSelect = (user: ReportedUser) => {
    setSelectedUser(user)
    // Gerçek uygulamada bu veriler API'dan çekilecek
    const userReports: { [key: string]: ReportDetail[] } = {
      "1": [
        { id: "r1", reporterId: "5", reporterName: "user5", reportDate: "2024-04-25", reason: "Kötü davranış", description: "Etkinlik sırasında kaba davrandı." },
        { id: "r2", reporterId: "4", reporterName: "user4", reportDate: "2024-04-24", reason: "Uygunsuz içerik", description: "Profil fotoğrafı uygunsuz içerik barındırıyor." },
        { id: "r3", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Taciz", description: "Özel mesajlarda rahatsız edici ifadeler kullandı." },
      ],
      "2": [
        { id: "r4", reporterId: "1", reporterName: "user1", reportDate: "2024-04-24", reason: "Spam", description: "Sürekli spam mesajlar gönderiyor." },
        { id: "r5", reporterId: "3", reporterName: "user3", reportDate: "2024-04-23", reason: "Sahte profil", description: "Sahte bilgilerle açılmış bir profil." },
      ],
      "3": [
        { id: "r6", reporterId: "2", reporterName: "user2", reportDate: "2024-04-23", reason: "Nefret söylemi", description: "Yorumlarda nefret söylemi içeren ifadeler kullandı." },
      ],
      "4": [
        { id: "r7", reporterId: "5", reporterName: "user5", reportDate: "2024-04-22", reason: "Kötü davranış", description: "Etkinlikte agresif davranışlar sergiledi." },
      ],
      "5": [
        { id: "r8", reporterId: "1", reporterName: "user1", reportDate: "2024-04-21", reason: "Uygunsuz içerik", description: "Paylaşımları uygunsuz içerik barındırıyor." },
        { id: "r9", reporterId: "2", reporterName: "user2", reportDate: "2024-04-20", reason: "Taciz", description: "Rahatsız edici mesajlar gönderiyor." },
      ],
    }
    setReportDetails(userReports[user.id])
  }

  const handleBlockUser = (userId: string) => {
    // Gerçek uygulamada bu işlem API üzerinden yapılacak
    setReportedUsers(reportedUsers.map(user => 
      user.id === userId ? { ...user, status: "blocked" } : user
    ))
    alert(`Kullanıcı ${userId} engellendi`)
  }

  const handleRemoveReport = (userId: string) => {
    // Gerçek uygulamada bu işlem API üzerinden yapılacak
    setReportedUsers(reportedUsers.filter(user => user.id !== userId))
    if (selectedUser?.id === userId) {
      setSelectedUser(null)
      setReportDetails([])
    }
    alert(`Kullanıcı ${userId} rapor listesinden kaldırıldı`)
  }

  if (!isAdmin) {
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
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Raporlar</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sol panel (2/3) - Raporlanan kullanıcılar listesi */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Raporlanan Kullanıcılar</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı Adı</TableHead>
                    <TableHead>Rapor Sayısı</TableHead>
                    <TableHead>Son Rapor Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportedUsers.map((user) => (
                    <TableRow 
                      key={user.id}
                      className={`cursor-pointer ${selectedUser?.id === user.id ? 'bg-muted' : ''}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.reportCount}</TableCell>
                      <TableCell>{user.lastReportDate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {user.status === 'blocked' ? 'Engellendi' : 'Aktif'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          {user.status !== 'blocked' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleBlockUser(user.id)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Engelle
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveReport(user.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Kaldır
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Raporlanan kullanıcı bulunmamaktadır.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        {/* Sağ panel (1/3) - Rapor detayları */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedUser 
                  ? `${selectedUser.username} Hakkında Raporlar` 
                  : "Rapor Detayları"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">{selectedUser.username}</h3>
                        <p className="text-sm text-muted-foreground">
                          Toplam {selectedUser.reportCount} rapor
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${selectedUser.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {selectedUser.status === 'blocked' ? 'Engellendi' : 'Aktif'}
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Rapor Geçmişi</h4>
                    
                    {reportDetails.length > 0 ? (
                      reportDetails.map((report) => (
                        <div key={report.id} className="border p-3 rounded-md">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">
                              {report.reporterName} tarafından rapor edildi
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {report.reportDate}
                            </p>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">
                            Sebep: {report.reason}
                          </p>
                          <p className="text-sm mt-2">
                            {report.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Bu kullanıcı için detaylı rapor bulunmamaktadır.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <Eye className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Detaylarını görmek için bir kullanıcı seçin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 