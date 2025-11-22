'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Calendar, FileText, Settings, Users, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function DashboardNav() {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: 'Cases',
      href: '/cases',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Clients',
      href: '/clients',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Calendar',
      href: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <nav className="flex gap-1 lg:flex-col">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            'flex h-12 items-center justify-start gap-3 px-4 hover:bg-muted',
            pathname === item.href
              ? 'bg-muted font-medium text-foreground'
              : 'font-normal text-muted-foreground'
          )}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            <span>{item.title}</span>
          </Link>
        </Button>
      ))}
    </nav>
  )
} 