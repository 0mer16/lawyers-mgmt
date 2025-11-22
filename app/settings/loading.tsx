import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <h2 className="text-xl font-semibold">Loading Settings...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we load your preferences</p>
      </div>
    </div>
  )
}

