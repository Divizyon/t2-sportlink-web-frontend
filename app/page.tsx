import { StoreDemo } from '../components/StoreDemo'
import LoginForm from '@/components/auth/LoginForm'
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Zustand State Management Example</h1>
      <LoginForm />
      <StoreDemo />
    </main>
  )
}
