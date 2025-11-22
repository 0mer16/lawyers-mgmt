import { redirect } from "next/navigation"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }
  
  const isAdmin = session.user.role === 'ADMIN'
  
  // Parse the date from search params or use current date
  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear()
  const month = searchParams.month ? parseInt(searchParams.month) - 1 : new Date().getMonth()
  
  const currentDate = new Date(year, month)
  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start, end })
  
  // Get previous and next month for navigation
  const prevMonth = new Date(year, month - 1)
  const nextMonth = new Date(year, month + 1)
  
  // Fetch hearings for the month
  const hearings = await prisma.hearing.findMany({
    where: {
      userId: isAdmin ? undefined : session.user.id,
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      case: true
    },
    orderBy: {
      date: 'asc'
    }
  })
  
  // Group hearings by day
  const hearingsByDay = days.map(day => {
    const dayHearings = hearings.filter(hearing => 
      isSameDay(new Date(hearing.date), day)
    )
    return {
      date: day,
      hearings: dayHearings
    }
  })
  
  // Get upcoming hearings
  const upcomingHearings = hearings
    .filter(hearing => new Date(hearing.date) >= new Date())
    .slice(0, 5)
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link href="/cases">
            <Plus className="mr-2 h-4 w-4" /> Schedule Hearing
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    asChild
                  >
                    <Link href={`/calendar?month=${prevMonth.getMonth() + 1}&year=${prevMonth.getFullYear()}`}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    asChild
                  >
                    <Link href={`/calendar?month=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                <div className="p-2">Sun</div>
                <div className="p-2">Mon</div>
                <div className="p-2">Tue</div>
                <div className="p-2">Wed</div>
                <div className="p-2">Thu</div>
                <div className="p-2">Fri</div>
                <div className="p-2">Sat</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mt-1">
                {/* Empty cells for days before the start of the month */}
                {Array.from({ length: start.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="p-2 border rounded-md h-24 bg-muted/20" />
                ))}
                
                {/* Days of the month */}
                {hearingsByDay.map(({ date, hearings }) => (
                  <div
                    key={date.toISOString()}
                    className={`p-2 border rounded-md h-24 ${
                      isSameDay(date, new Date()) 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : ''
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{format(date, 'd')}</div>
                    {hearings.length > 0 ? (
                      <div className="space-y-1 overflow-y-auto max-h-[4rem]">
                        {hearings.map(hearing => (
                          <Link 
                            key={hearing.id} 
                            href={`/hearings/${hearing.id}`}
                            className="flex items-start gap-1 text-xs p-1 rounded bg-emerald-100 hover:bg-emerald-200 transition-colors"
                          >
                            <Clock className="h-3 w-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                            <div className="truncate">
                              {format(new Date(hearing.date), 'h:mm a')} - {hearing.title}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                
                {/* Empty cells for days after the end of the month */}
                {Array.from({ length: 6 - end.getDay() }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="p-2 border rounded-md h-24 bg-muted/20" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Hearings</CardTitle>
              <CardDescription>Your next scheduled hearings</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingHearings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingHearings.map(hearing => (
                    <div key={hearing.id} className="flex flex-col gap-2 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <Link 
                          href={`/hearings/${hearing.id}`}
                          className="font-medium hover:text-emerald-600 transition-colors"
                        >
                          {hearing.title}
                        </Link>
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
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{format(new Date(hearing.date), 'EEE, MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{format(new Date(hearing.date), 'h:mm a')}</span>
                      </div>
                      <Link 
                        href={`/cases/${hearing.caseId}`}
                        className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                      >
                        Case: {hearing.case.title}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium">No upcoming hearings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You don't have any hearings scheduled this month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/cases">
                  <Plus className="mr-2 h-4 w-4" /> Schedule Hearing
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cases">
                  View All Cases
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: "Calendar - Pakistan Legal Manager",
  }
} 