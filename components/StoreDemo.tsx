'use client'

import { useStore } from '@/lib/store'

export const StoreDemo = () => {
  const { version, setVersion } = useStore()

  const handleVersionChange = () => {
    setVersion('2.0.0')
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Current Version: {version}</h2>
      <button
        onClick={handleVersionChange}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Update Version"
      >
        Update Version
      </button>
    </div>
  )
} 