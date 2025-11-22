import { FileText } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2">
        <FileText className="h-10 w-10 text-emerald-600" />
        <h1 className="text-3xl font-bold">Pakistan Legal Manager</h1>
      </div>
      {children}
    </div>
  )
} 