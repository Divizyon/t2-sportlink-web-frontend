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
import { Loader2, Search, UserPlus, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import useAuth from "@/lib/hooks/useAuth"
import adminService from "@/lib/services/adminService"
import type { AdminUser, AdminCreateData } from "@/lib/services/adminService"

export default function AdminsPage() {
    const { user, isAuthenticated } = useAuth()
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Admin Yönetimi</h1>
                    <p className="text-muted-foreground mt-1">
                        Admin kullanıcılarını görüntüleyin, oluşturun ve yönetin.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Arama formu */}
                    <form onSubmit={handleSearch} className="flex w-full lg:w-auto gap-2">
                        <Input
                            type="text"
                            placeholder="İsim, e-posta veya kullanıcı adı ile ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                        <Button type="submit" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    {/* Admin Oluştur */}
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="whitespace-nowrap">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Admin Oluştur
                            </Button>
                        </DialogTrigger>
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
            </div>

            {/* Admin Listesi */}
            <Card>
                <CardHeader>
                    <CardTitle>Admin Kullanıcıları</CardTitle>
                    <CardDescription>
                        Sistemde kayıtlı tüm admin kullanıcıları ve bilgileri
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kullanıcı Adı</TableHead>
                                <TableHead>Ad Soyad</TableHead>
                                <TableHead>E-posta</TableHead>
                                <TableHead>Oluşturulma Tarihi</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        <span className="mt-2 text-sm text-muted-foreground block">Yükleniyor...</span>
                                    </TableCell>
                                </TableRow>
                            ) : admins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <p className="text-muted-foreground">Kayıtlı admin kullanıcısı bulunamadı.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell className="font-medium">{admin.username}</TableCell>
                                        <TableCell>{admin.first_name} {admin.last_name}</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{new Date(admin.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeactivateAdmin(admin.id)}
                                            >
                                                Devre Dışı Bırak
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {pagination.totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => loadAdmins(page, searchQuery || undefined)}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                        Toplam {pagination.total} admin kullanıcısı
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
} 