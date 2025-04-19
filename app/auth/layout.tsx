import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Giriş Yap veya Kayıt Ol | SportLink",
  description: "SportLink hesabınıza giriş yapın veya yeni bir hesap oluşturun",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center">
              <Image
                src="/sportLink.svg"
                alt="SportLink Logo"
                width={160}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Spor, hayatın en güzel aktivitelerinden biridir. SportLink ile spor dünyasının kapılarını aralayın."
              </p>
              <footer className="text-sm">SportLink Ekibi</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 