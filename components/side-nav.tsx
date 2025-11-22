'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Calendar, Briefcase, FileText, Gavel, Users, Settings 
} from 'lucide-react'

const links = [
  { name: 'Dashboard', href: '/', icon: FileText },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Hearings', href: '/hearings', icon: Gavel },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r bg-card px-3 py-4">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 py-2"
      >
        <Gavel className="h-6 w-6 text-emerald-600" />
        <span className="text-lg font-semibold">
          Legal Manager
        </span>
      </Link>
      <div className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const IconComponent = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:text-foreground',
                pathname === link.href
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <IconComponent className="h-4 w-4" />
              {link.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 