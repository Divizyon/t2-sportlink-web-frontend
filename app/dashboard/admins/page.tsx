"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Search, UserPlus, ShieldAlert, Trash2 } from "lucide-react"
import useAuth from "@/lib/hooks/useAuth"
import adminService from "@/lib/services/adminService"
import type { AdminUser, AdminCreateData } from "@/lib/services/adminService"

export default function AdminsPage() {
    const { isAuthenticated } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [redirecting, setRedirecting] = useState(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    })
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState<AdminCreateData>({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: ""
    })

    // SuperAdmin durumunu kontrol et
    useEffect(() => {
        if (!isAuthenticated) {
            setRedirecting(true)
            toast({
                title: "Erişim Engellendi",
                description: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
                variant: "destructive",
            })
            setTimeout(() => {
                router.push("/auth/login")
            }, 100)
            return
        }

        const checkSuperAdminStatus = async () => {
            try {
                const response = await adminService.checkSuperAdminStatus()

                if (response.success) {
                    setIsSuperAdmin(response.data.isSuperAdmin)

                    if (!response.data.isSuperAdmin) {
                        toast({
                            title: "Yetkisiz Erişim",
                            description: "Bu sayfaya erişmek için SuperAdmin yetkisine sahip olmalısınız.",
                            variant: "destructive",
                        })
                        setTimeout(() => {
                            router.push("/dashboard")
                        }, 500)
                    } else {
                        // SuperAdmin yetkisi var, admin listesini yükle
                        loadAdmins(1)
                    }
                }
            } catch (error) {
                console.error("SuperAdmin kontrolü sırasında hata:", error)
                toast({
                    title: "Hata",
                    description: "Yetki kontrolü sırasında bir hata oluştu.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        checkSuperAdminStatus()
    }, [isAuthenticated, toast, router])

    // Admin listesini yükle
    const loadAdmins = async (page = 1, filter?: string) => {
        try {
            setIsLoading(true)
            const response = await adminService.getAdminsList(page, 10, filter)

            if (response.success) {
                setAdmins(response.data.admins)
                setPagination(response.data.pagination)
            }
        } catch (error) {
            console.error("Admin listesi alınırken hata:", error)
            toast({
                title: "Hata",
                description: "Admin listesi yüklenirken bir hata oluştu.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Admin oluştur
    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basit form doğrulama
        if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
            toast({
                title: "Eksik Bilgi",
                description: "Lütfen tüm zorunlu alanları doldurun.",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            const response = await adminService.createAdmin(formData)

            if (response.success) {
                toast({
                    title: "Başarılı",
                    description: "Admin kullanıcısı başarıyla oluşturuldu.",
                })

                // Formu sıfırla ve dialogu kapat
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    first_name: "",
                    last_name: "",
                    phone: ""
                })
                setCreateDialogOpen(false)

                // Listeyi yenile
                loadAdmins(1)
            }
        } catch (error: any) {
            console.error("Admin oluştururken hata:", error)
            toast({
                title: "Hata",
                description: error.message || "Admin oluşturulurken bir hata oluştu.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Admin devre dışı bırak
    const handleDeactivateAdmin = async (adminId: string) => {
        try {
            const response = await adminService.deactivateAdmin(adminId)

            if (response.success) {
                toast({
                    title: "Başarılı",
                    description: "Admin kullanıcısı başarıyla devre dışı bırakıldı.",
                })

                // Listeyi yenile
                loadAdmins(pagination.page)
            }
        } catch (error: any) {
            console.error("Admin devre dışı bırakılırken hata:", error)
            toast({
                title: "Hata",
                description: error.message || "Admin devre dışı bırakılırken bir hata oluştu.",
                variant: "destructive",
            })
        }
    }

    // Arama işlemi
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        loadAdmins(1, searchQuery)
    }

    // Form input değişikliği
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (isLoading || redirecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
        )
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Yetkisiz Erişim</h1>
                <p className="text-muted-foreground">Bu sayfaya erişmek için SuperAdmin yetkisine sahip olmalısınız.</p>
                <Button onClick={() => router.push("/dashboard")}>Dashboard'a Dön</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-0 py-4 max-w-full h-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                <div>
                
                </div>

                {/* Dialog bileşeni - gizli ama hala erişilebilir */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Yeni Admin Kullanıcısı Oluştur</DialogTitle>
                            <DialogDescription>
                                Yeni bir admin kullanıcısı oluşturmak için gerekli bilgileri girin.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateAdmin} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">Ad *</Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Soyad *</Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Kullanıcı Adı *</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Şifre *</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ""}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateDialogOpen(false)}
                                >
                                    İptal
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Oluştur
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Admin Listesi - Yeni UI, Haber Listesine Benzer Şekilde */}
            <Card className="h-[calc(100vh-120px)] flex flex-col">
                <CardHeader className="pl-4 pb-2">
                    <CardTitle>Admin Kullanıcıları</CardTitle>
                    <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-4">
                            <div className="relative flex w-[300px] overflow-hidden rounded-md ring-1 ring-input">
                                <Input
                                    placeholder="Admin ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <Button
                                    variant="outline"
                                    className="rounded-none h-9 px-3 border-0 bg-background hover:bg-muted"
                                    onClick={(e) => handleSearch(e as any)}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button size="sm" className="gap-1" onClick={() => setCreateDialogOpen(true)}>
                            <UserPlus className="h-4 w-4" /> Yeni Admin Ekle
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <div className="border mx-0 mt-0 mb-0 flex-1 flex flex-col">
                        <div className="overflow-auto h-[calc(100vh-200px)]">
                            <Table className="min-w-full table-fixed">
                                <TableHeader className="sticky top-0 bg-white z-10 dark:bg-background">
                                    <TableRow>
                                        <TableHead className="w-[150px]">Kullanıcı Adı</TableHead>
                                        <TableHead className="w-[200px]">Ad Soyad</TableHead>
                                        <TableHead className="w-[200px]">E-posta</TableHead>
                                        <TableHead className="w-[150px]">Oluşturulma Tarihi</TableHead>
                                        <TableHead className="w-[100px] text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-y-auto">
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                <div className="flex flex-col justify-center items-center py-8">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                                    <span className="text-muted-foreground">Yükleniyor...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : admins.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                <div className="flex flex-col items-center py-8">
                                                    <ShieldAlert className="h-10 w-10 text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">Admin kullanıcısı bulunamadı</h3>
                                                    <p className="text-muted-foreground mb-4">Henüz sistemde kayıtlı admin bulunmamaktadır veya arama kriterlerinize uygun admin yoktur.</p>
                                                    <Button variant="outline" onClick={() => loadAdmins(1)}>
                                                        Tüm Adminleri Göster
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        admins.map((admin) => (
                                            <TableRow key={admin.id} className="hover:bg-muted cursor-pointer h-14">
                                                <TableCell className="font-medium max-w-[150px] truncate py-4">{admin.username}</TableCell>
                                                <TableCell className="max-w-[200px] truncate py-4">{admin.first_name} {admin.last_name}</TableCell>
                                                <TableCell className="max-w-[200px] truncate py-4">{admin.email}</TableCell>
                                                <TableCell className="max-w-[150px] whitespace-nowrap py-4">{new Date(admin.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeactivateAdmin(admin.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* Pagination */}
                        {!isLoading && admins.length > 0 && pagination.totalPages > 1 && (
                            <div className="mt-2 p-2 border-t flex justify-center">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages > 0 ? pagination.totalPages : 1}
                                    onPageChange={(page) => loadAdmins(page, searchQuery || undefined)}
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 