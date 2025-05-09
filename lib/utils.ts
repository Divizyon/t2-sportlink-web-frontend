import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * İsim ve soyisimden baş harfleri çıkararak avatar için fallback değeri oluşturur
 * @param name İsim ve soyisim
 * @returns Baş harfler (en fazla 2 harf)
 */
export function userInitials(name: string): string {
  if (!name || typeof name !== 'string') return "??";
  
  const nameTrimmed = name.trim();
  if (!nameTrimmed) return "??";
  
  const parts = nameTrimmed.split(/\s+/);
  
  if (parts.length === 0) return "??";
  
  if (parts.length === 1) {
    // Sadece isim varsa, ilk iki harfi al
    return nameTrimmed.substring(0, 2).toUpperCase();
  }
  
  // İsim ve soyisim varsa, her ikisinin ilk harfini al
  return (
    (parts[0]?.charAt(0) || "") + 
    (parts[parts.length - 1]?.charAt(0) || "")
  ).toUpperCase() || "??";
}
