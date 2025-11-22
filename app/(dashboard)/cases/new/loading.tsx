import { Loader2 } from "lucide-react"

export default function NewCaseLoading() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <h3 className="font-medium text-lg">Loading form...</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we prepare the case form.
        </p>
      </div>
    </div>
  )
} 