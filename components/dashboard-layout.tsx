'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { FileText, Menu, Search, Settings, User, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DashboardNav } from '@/components/dashboard-nav'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth-guard'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const nameInitials = user?.name
    ? user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U'
  
  const userName = user?.name || 'User'
  const userRole = user?.role || 'User'
  
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast.success('Signed out successfully')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 md:gap-10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 sm:max-w-xs">
                <div className="flex items-center gap-2 pt-2 pb-6">
                  <FileText className="h-6 w-6 text-emerald-600" />
                  <span className="text-lg font-bold">Pakistan Legal Manager</span>
                </div>
                <DashboardNav />
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="hidden items-center gap-2 md:flex">
              <FileText className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold">Pakistan Legal Manager</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <form className="hidden items-center lg:flex">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-72 pl-8"
                />
              </div>
            </form>
            
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-emerald-100 text-emerald-800">
                      {nameInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  Signed in as {user?.email || 'User'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {isSearchOpen && (
          <div className="container flex items-center pb-4 lg:hidden">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8"
              />
            </div>
          </div>
        )}
      </header>
      
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
          <div className="flex h-full flex-col p-4">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex-1 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  )
} 