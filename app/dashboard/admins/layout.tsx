"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import adminService from "@/lib/services/adminService"
import useAuth from "@/lib/hooks/useAuth"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        if (!isAuthenticated) {
            toast({
                title: "Erişim Engellendi",
                description: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
                variant: "destructive",
            });
            router.push("/auth/login");
            return;
        }

        // Kullanıcı admin mi kontrol et
        const checkSuperAdminStatus = async () => {
            try {
                const response = await adminService.checkSuperAdminStatus();

                if (response.success) {
                    setIsSuperAdmin(response.data.isSuperAdmin);

                    if (!response.data.isSuperAdmin) {
                        toast({
                            title: "Yetkisiz Erişim",
                            description: "Bu sayfaya erişmek için SuperAdmin yetkisine sahip olmalısınız.",
                            variant: "destructive",
                        });

                        // Kullanıcıyı dashboard'a yönlendir
                        setTimeout(() => {
                            router.push("/dashboard");
                        }, 500);
                    }
                }
            } catch (error) {
                console.error("SuperAdmin kontrolü sırasında hata:", error);
                toast({
                    title: "Hata",
                    description: "Yetki kontrolü sırasında bir hata oluştu.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkSuperAdminStatus();
    }, [isAuthenticated, router, toast]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Yetkisiz Erişim</h1>
                <p className="text-muted-foreground">Bu sayfaya erişmek için SuperAdmin yetkisine sahip olmalısınız.</p>
                <Button onClick={() => router.push("/dashboard")}>Dashboard'a Dön</Button>
            </div>
        );
    }

    return <>{children}</>;
} 