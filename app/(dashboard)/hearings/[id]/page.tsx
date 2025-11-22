import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, CalendarClock, FileText, MapPin, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface HearingDetailProps {
  params: {
    id: string
  }
}

export default async function HearingDetail({ params }: HearingDetailProps) {
  const session = await auth()
  
  if (!session) {
    return null // middleware will handle the redirect
  }
  
  const isAdmin = session.user.role === 'ADMIN'
  
  const hearing = await prisma.hearing.findUnique({
    where: {
      id: params.id,
      userId: isAdmin ? undefined : session.user.id
    },
    include: {
      case: {
        include: {
          clients: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
  
  if (!hearing) {
    notFound()
  }
  
  const formattedDate = format(new Date(hearing.date), 'EEEE, MMMM d, yyyy')
  const formattedTime = format(new Date(hearing.date), 'h:mm a')
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link
          href={`/cases/${hearing.caseId}`}
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Case
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{hearing.title}</h1>
        <div className="flex items-center gap-2 mt-1">
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
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Hearing Details</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/hearings/${params.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>
              </div>
              
              {hearing.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-muted-foreground">{hearing.location}</p>
                  </div>
                </div>
              )}
              
              {hearing.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-muted-foreground mt-1">{hearing.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Related Case</CardTitle>
              <CardDescription>Case information for this hearing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Link
                    href={`/cases/${hearing.caseId}`}
                    className="text-lg font-medium hover:text-emerald-600 transition-colors"
                  >
                    {hearing.case.title}
                  </Link>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>Case #{hearing.case.caseNumber || 'No number'}</span>
                    {hearing.case.court && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{hearing.case.court}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {hearing.case.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {hearing.case.description}
                    </p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium">Clients</p>
                  <div className="mt-2 space-y-2">
                    {hearing.case.clients.length > 0 ? (
                      hearing.case.clients.map((client) => (
                        <div key={client.id} className="text-sm">
                          <Link
                            href={`/clients/${client.id}`}
                            className="hover:text-emerald-600 transition-colors"
                          >
                            {client.name}
                          </Link>
                          <div className="text-muted-foreground">
                            {client.email && <span>{client.email}</span>}
                            {client.phone && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{client.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No clients assigned to this case</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/cases/${hearing.caseId}`}>
                  View Full Case Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Update</CardTitle>
              <CardDescription>Update the status of this hearing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className={hearing.status === 'COMPLETED' 
                    ? 'bg-sky-100 text-sky-800 border-sky-200' 
                    : ''}
                >
                  Completed
                </Button>
                <Button
                  variant="outline"
                  className={hearing.status === 'POSTPONED' 
                    ? 'bg-amber-100 text-amber-800 border-amber-200' 
                    : ''}
                >
                  Postponed
                </Button>
              </div>
              
              {hearing.status === 'POSTPONED' && (
                <div className="mt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/cases/${hearing.caseId}/add-hearing`}>
                      Reschedule
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{hearing.assignedTo?.name || session.user.name}</p>
                <p className="text-sm text-muted-foreground">{hearing.assignedTo?.email || session.user.email}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href={`/cases/${hearing.caseId}/add-document`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Documents
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/hearings/${params.id}/notes`}>
                  Add Notes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const session = await auth()
  
  if (!session) {
    return {
      title: "Hearing Details - Pakistan Legal Manager",
    }
  }
  
  try {
    const hearing = await prisma.hearing.findUnique({
      where: {
        id: params.id,
        userId: session.user.role === 'ADMIN' ? undefined : session.user.id
      },
      select: {
        title: true
      }
    })
    
    if (!hearing) {
      return {
        title: "Hearing Not Found - Pakistan Legal Manager",
      }
    }
    
    return {
      title: `${hearing.title} - Pakistan Legal Manager`,
    }
  } catch (error) {
    return {
      title: "Hearing Details - Pakistan Legal Manager",
    }
  }
} 