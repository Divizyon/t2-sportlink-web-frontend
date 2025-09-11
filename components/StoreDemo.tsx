'use client'

import { useStore } from '@/lib/store'

export const StoreDemo = () => {
  const { isAuthenticated, user } = useStore()

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</h2>
      {isAuthenticated && user && (
        <p>Hoş geldiniz, {user.username || user.first_name || 'Kullanıcı'}</p>
      )}
    </div>
  )
} 