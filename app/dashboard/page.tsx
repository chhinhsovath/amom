import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MoneyApp Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {session.user?.name}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Invoices"
            value="0"
            description="Total unpaid"
            link="/invoices"
          />
          <DashboardCard
            title="Bills"
            value="0"
            description="Due this month"
            link="/bills"
          />
          <DashboardCard
            title="Bank Balance"
            value="$0.00"
            description="Across all accounts"
            link="/banking"
          />
          <DashboardCard
            title="Reports"
            value="View"
            description="Financial insights"
            link="/reports"
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction href="/invoices/new" label="Create Invoice" />
              <QuickAction href="/bills/new" label="Enter Bill" />
              <QuickAction href="/banking/transactions" label="Bank Transactions" />
              <QuickAction href="/contacts/new" label="Add Contact" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  description,
  link,
}: {
  title: string
  value: string
  description: string
  link: string
}) {
  return (
    <Link
      href={link}
      className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow"
    >
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Link>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block w-full text-left px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {label}
    </Link>
  )
}