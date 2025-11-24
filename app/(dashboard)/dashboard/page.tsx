'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { format, startOfDay, endOfDay } from "date-fns"
import { CalendarClock, FileText, Users, Briefcase, Clock, ArrowRight, BarChart2, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthGuard } from "@/hooks/use-auth-guard"

// Define types for dashboard data
interface Case {
  id: string
  title: string
  status: string
  clients: {
    id: string
    name: string
  }[]
}

interface Hearing {
  id: string
  title: string
  status: string
  date: string
  case: {
    id: string
    title: string
  }
}

interface DashboardStats {
  activeCasesCount: number
  clientsCount: number
  todayHearings: Hearing[]
  upcomingHearings: Hearing[]
  recentCases: Case[]
  casesWon: number
  casesLost: number
  pendingCases: number
  caseTypeDistribution: {
    [key: string]: number
  }
  courtDistribution: {
    [key: string]: number
  }
  hearingsThisMonth: number
  documentsCount: number
}

export default function Dashboard() {
  const { user } = useAuthGuard()
  const [stats, setStats] = useState<DashboardStats>({
    activeCasesCount: 0,
    clientsCount: 0,
    todayHearings: [],
    upcomingHearings: [],
    recentCases: [],
    casesWon: 0,
    casesLost: 0,
    pendingCases: 0,
    caseTypeDistribution: {},
    courtDistribution: {},
    hearingsThisMonth: 0,
    documentsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)
  
  useEffect(() => {
    // Fetch dashboard data only when user is available
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch('/api/dashboard')
          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.error && (
              errorData.error.includes('database') || 
              errorData.error.includes('column') || 
              errorData.error.includes('migration')
            )) {
              setDbError(true);
            }
            throw new Error(errorData.error || 'Failed to fetch dashboard data');
          }
          const data = await response.json()
          setStats(data)
          setDbError(false)
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchDashboardData()
    }
  }, [user])
  
  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard data...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your cases and upcoming hearings
        </p>
      </div>
      
      {dbError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Migration Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              The application schema has been updated and requires database migration. Please follow
              the instructions in the MIGRATION-README.md file to update your database.
            </p>
            <Button variant="outline" size="sm" className="w-fit" asChild>
              <Link href="/migration-instructions">View Migration Instructions</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCasesCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently active cases that require attention
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/cases?status=active"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              View all active cases
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Clients currently registered in the system
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/clients"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              View all clients
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Hearings</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayHearings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Hearings scheduled for today
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/calendar"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              View calendar
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Performance Stats */}
      <div className="grid gap-6 md:grid-cols-4 mt-6">
        <Card className="bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cases Won</CardTitle>
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.casesWon || 0}</div>
            <p className="text-xs text-green-700">
              Successfully concluded cases
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cases Lost</CardTitle>
            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.casesLost || 0}</div>
            <p className="text-xs text-red-700">
              Unsuccessful case outcomes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingCases || 0}</div>
            <p className="text-xs text-amber-700">
              Cases awaiting court dates
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hearings This Month</CardTitle>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarClock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.hearingsThisMonth || 0}</div>
            <p className="text-xs text-blue-700">
              Upcoming hearings this month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Case Analytics and Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Recent Documents Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <CardDescription>Recently added case documents</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-2">
              {stats.documentsCount > 0 ? (
                <div className="rounded-lg border p-3">
                  <Link href="/documents" className="flex justify-between items-center">
                    <div className="font-medium">{stats.documentsCount} documents available</div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="rounded-lg border p-3 text-muted-foreground">
                  No documents yet
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/documents">View All Documents</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Upcoming Hearings Card */}
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Upcoming Hearings
            </CardTitle>
            <CardDescription>Your nearest scheduled hearings</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-2">
              {stats.upcomingHearings?.length > 0 ? (
                stats.upcomingHearings.slice(0, 5).map(hearing => (
                  <Link href={`/hearings/${hearing.id}`} key={hearing.id}>
                    <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between mb-1">
                        <div className="font-medium">{hearing.title}</div>
                        <Badge variant={hearing.status === 'SCHEDULED' ? 'outline' : 'secondary'}>
                          {hearing.status.charAt(0) + hearing.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {hearing.case.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(hearing.date), 'PPP p')}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border p-3 text-muted-foreground">
                  No upcoming hearings
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/hearings">View All Hearings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Upcoming Hearings Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Hearings</CardTitle>
            <CardDescription>Next 7 days schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingHearings?.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingHearings.map((hearing) => (
                  <div key={hearing.id} className="flex items-start gap-4 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{hearing.title}</p>
                        <Badge
                          className={
                            hearing.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-800' :
                            hearing.status === 'COMPLETED' ? 'bg-sky-100 text-sky-800' :
                            hearing.status === 'POSTPONED' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {hearing.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Case: {hearing.case.title}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarClock className="mr-1 h-3 w-3" />
                        <span>
                          {format(new Date(hearing.date), 'EEE, MMM d, yyyy')} at {format(new Date(hearing.date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex h-8 w-8 p-0" asChild>
                      <Link href={`/hearings/${hearing.id}`}>
                        <span className="sr-only">View hearing details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarClock className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No upcoming hearings</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  You don't have any hearings scheduled for the next 7 days.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/hearings/new">Schedule a Hearing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Latest cases added</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCases?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCases.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-start gap-4 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Briefcase className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{caseItem.title}</p>
                        <Badge
                          className={
                            caseItem.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            caseItem.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            caseItem.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                            caseItem.status === 'WON' ? 'bg-sky-100 text-sky-800' :
                            caseItem.status === 'LOST' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }
                        >
                          {caseItem.status}
                        </Badge>
                      </div>
                      {caseItem.clients?.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Client: {caseItem.clients[0].name}
                          {caseItem.clients?.length > 1 && ` +${caseItem.clients.length - 1} more`}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="flex h-8 w-8 p-0" asChild>
                      <Link href={`/cases/${caseItem.id}`}>
                        <span className="sr-only">View case details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No recent cases</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Start adding cases to see them listed here.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/cases/new">Add a Case</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}