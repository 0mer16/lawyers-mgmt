'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { PlusCircle, Calendar, Search, ChevronRight, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth-guard'
import { toast } from 'sonner'

interface Hearing {
  id: string
  title: string
  date: string
  location: string | null
  status: 'SCHEDULED' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED'
  case: {
    id: string
    title: string
  }
}

export default function HearingsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [filteredHearings, setFilteredHearings] = useState<Hearing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilterLocal, setStatusFilterLocal] = useState(statusFilter || 'all')
  
  // Fetch hearings when component mounts
  useEffect(() => {
    async function fetchHearings() {
      try {
        const url = statusFilter 
          ? `/api/hearings?status=${statusFilter}` 
          : '/api/hearings'
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch hearings')
        }
        
        const data = await response.json()
        setHearings(data)
        setFilteredHearings(data)
      } catch (error) {
        console.error('Error fetching hearings:', error)
        toast.error('Failed to load hearings')
      } finally {
        setLoading(false)
      }
    }
    
    fetchHearings()
  }, [statusFilter])
  
  // Filter hearings based on search query and status
  useEffect(() => {
    let filtered = hearings
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(hearing => 
        hearing.title.toLowerCase().includes(query) || 
        hearing.case.title.toLowerCase().includes(query) ||
        (hearing.location && hearing.location.toLowerCase().includes(query))
      )
    }
    
    // Filter by status
    if (statusFilterLocal !== 'all') {
      filtered = filtered.filter(hearing => hearing.status === statusFilterLocal)
    }
    
    setFilteredHearings(filtered)
  }, [searchQuery, statusFilterLocal, hearings])
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilterLocal(value)
  }
  
  // Get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'POSTPONED':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }
  
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'EEE, MMM d, yyyy')
  }
  
  const getFormattedTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'h:mm a')
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Hearings</h1>
        </div>
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading hearings...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Hearings</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hearings..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/hearings/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Hearing
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <Select 
          value={statusFilterLocal} 
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="POSTPONED">Postponed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredHearings.length > 0 ? (
        <div className="grid gap-6">
          {filteredHearings.map((hearing) => (
            <Card key={hearing.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/hearings/${hearing.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-medium hover:text-emerald-600 transition-colors">
                          {hearing.title}
                        </h3>
                        <Badge className={getStatusBadgeColor(hearing.status)}>
                          {hearing.status.charAt(0) + hearing.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        Case: {hearing.case.title}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{getFormattedDate(hearing.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{getFormattedTime(hearing.date)}</span>
                        </div>
                      </div>
                      
                      {hearing.location && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <span>Location: {hearing.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No hearings found</h3>
            <p className="mb-4 mt-2 text-center text-muted-foreground">
              {searchQuery 
                ? "No hearings match your search criteria." 
                : statusFilterLocal !== 'all' 
                  ? `No hearings with status '${statusFilterLocal}' found.`
                  : "Get started by scheduling your first hearing."}
            </p>
            <Button asChild>
              <Link href="/hearings/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule Hearing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 