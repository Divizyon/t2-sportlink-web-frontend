"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Komponent mount edildikten sonra render et
  // (Hydration hatalarını önlemek için)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div className="flex items-center">
      <label htmlFor="theme-toggle" className="cursor-pointer">
        <div className="relative">
          {/* Track (arka plan) */}
          <div 
            className={`
              w-14 h-7 rounded-full transition-colors duration-300
              ${isDark ? 'bg-slate-700' : 'bg-slate-200'}
            `}
          />
          
          {/* Güneş ikonu (sol tarafta sabit) */}
          <div className="absolute top-1.5 left-1.5 flex items-center justify-center">
            <Sun className="h-4 w-4 text-amber-500" />
          </div>
          
          {/* Ay ikonu (sağ tarafta sabit) */}
          <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
            <Moon className="h-4 w-4 text-yellow-300" />
          </div>
          
          {/* Kaydırıcı (ikonsuz) */}
          <div 
            className={`
              absolute top-0.5 left-0.5 w-6 h-6 rounded-full 
              transform transition-transform duration-300 shadow-md
              ${isDark ? 'translate-x-7 bg-slate-900' : 'translate-x-0 bg-white'}
            `}
          />
        </div>
        
        <input
          id="theme-toggle"
          type="checkbox"
          checked={isDark}
          onChange={() => setTheme(isDark ? "light" : "dark")}
          className="sr-only"
          aria-label={isDark ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
        />
      </label>
    </div>
  )
}