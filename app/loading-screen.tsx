'use client'

import { useEffect, useState } from 'react'
import { Scale } from 'lucide-react'

export default function LoadingScreen() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-6 rounded-full animate-pulse">
            <Scale className="h-16 w-16 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Lawyers Management System
        </h1>
        <p className="text-lg text-slate-600 mb-4">
          Loading your legal practice platform{dots}
        </p>
        <div className="flex justify-center">
          <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  )
}
