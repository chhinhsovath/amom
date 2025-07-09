import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          MoneyApp - Financial Management
        </h1>
        
        <div className="text-center">
          {session ? (
            <div>
              <p className="mb-4">Welcome, {session.user?.name}!</p>
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div>
              <p className="mb-4">Please log in to continue</p>
              <Link
                href="/auth/login"
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}