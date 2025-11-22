'use client'

import { SideNav } from "@/components/side-nav"
import TopNav from "@/components/top-nav"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuthGuard()
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }
  
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex flex-col flex-grow overflow-hidden">
        <TopNav />
        <div className="flex-grow overflow-y-auto bg-muted/50 p-6">
          {children}
        </div>
      </div>
    </div>
  )
} 