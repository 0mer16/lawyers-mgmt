import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import RenderInit from './render-init'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pakistan Legal Manager - Lawyers Management System',
  description: 'A comprehensive management system for law firms in Pakistan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RenderInit>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </RenderInit>
      </body>
    </html>
  )
}