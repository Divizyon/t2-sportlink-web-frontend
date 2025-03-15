import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface State {
  version: string
}

interface Actions {
  setVersion: (version: string) => void
}

const initialState: State = {
  version: '1.0.0'
}

export const useStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setVersion: (version) => set({ version }),
      }),
      {
        name: 'deep-vision-storage',
      }
    )
  )
) 