import LoginForm from '@/components/auth/LoginForm'
export default function Home() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8 text-center">Zustand State Management Example</h1>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
