import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Mail, MapPin, Phone, PlusCircle, Tag, User } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface ClientDetailProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ClientDetailProps) {
  const session = await auth()
  
  if (!session) {
    redirect("/signin")
  }
  
  return {
    title: `Client Details - Pakistan Legal Manager`,
  }
}

export default async function ClientDetails({ params }: ClientDetailProps) {
  const session = await auth()
  
  if (!session) {
    return null // middleware will handle the redirect
  }
  
  const isAdmin = session.user.role === 'ADMIN'
  
  const client = await prisma.client.findUnique({
    where: {
      id: params.id,
      userId: isAdmin ? undefined : session.user.id
    },
    include: {
      cases: {
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          lawyer: {
            select: {
              id: true,
              name: true
            }
          },
          hearings: {
            orderBy: {
              date: 'asc'
            },
            take: 1
          }
        }
      }
    }
  })
  
  if (!client) {
    notFound()
  }
  
  // Get next hearing if any
  const nextHearing = client.cases
    .map(caseItem => caseItem.hearings[0])
    .filter(hearing => hearing && new Date(hearing.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/clients" className="flex items-center text-sm text-muted-foreground hover:underline mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to clients
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <Button variant="outline">Edit Client</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-start">
                <dt className="flex items-center text-muted-foreground w-1/3">
                  <User className="mr-2 h-4 w-4" />
                  Name
                </dt>
                <dd className="font-medium">{client.name}</dd>
              </div>
              <div className="flex items-start">
                <dt className="flex items-center text-muted-foreground w-1/3">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </dt>
                <dd className="font-medium">{client.email || "Not provided"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="flex items-center text-muted-foreground w-1/3">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone
                </dt>
                <dd className="font-medium">{client.phone || "Not provided"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="flex items-center text-muted-foreground w-1/3">
                  <MapPin className="mr-2 h-4 w-4" />
                  Address
                </dt>
                <dd className="font-medium">{client.address || "Not provided"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="flex items-center text-muted-foreground w-1/3">
                  <Tag className="mr-2 h-4 w-4" />
                  CNIC
                </dt>
                <dd className="font-medium">{client.cnic || "Not provided"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Case Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Total Cases</dt>
                <dd className="font-medium">{client.cases.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Active Cases</dt>
                <dd className="font-medium">
                  {client.cases.filter(c => ['ACTIVE', 'PENDING'].includes(c.status)).length}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Closed Cases</dt>
                <dd className="font-medium">
                  {client.cases.filter(c => !['ACTIVE', 'PENDING'].includes(c.status)).length}
                </dd>
              </div>
              <div className="pt-2">
                <Link href={`/clients/${client.id}/new-case`}>
                  <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Case
                  </Button>
                </Link>
              </div>
            </dl>
          </CardContent>
        </Card>
      
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Upcoming Hearing</CardTitle>
          </CardHeader>
          <CardContent>
            {nextHearing ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{nextHearing.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(nextHearing.date), 'PPP')} at {format(new Date(nextHearing.date), 'p')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{nextHearing.location || "Not specified"}</p>
                </div>
                <Link href={`/hearings/${nextHearing.id}`}>
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground mb-2">No upcoming hearings</p>
                <Link href={`/clients/${client.id}/schedule-hearing`}>
                  <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Schedule Hearing
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Cases</h2>
      {client.cases.length > 0 ? (
        <div className="space-y-4">
          {client.cases.map((caseItem: any) => (
            <Link href={`/cases/${caseItem.id}`} key={caseItem.id}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{caseItem.title}</h3>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-muted-foreground mr-4">
                          Case #{caseItem.caseNumber || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Assigned: {caseItem.lawyer?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        caseItem.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" :
                        caseItem.status === 'PENDING' ? "bg-amber-100 text-amber-800 hover:bg-amber-100" :
                        caseItem.status === 'WON' ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                        caseItem.status === 'LOST' ? "bg-red-100 text-red-800 hover:bg-red-100" :
                        caseItem.status === 'SETTLED' ? "bg-purple-100 text-purple-800 hover:bg-purple-100" :
                        "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {caseItem.status.charAt(0) + caseItem.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  {caseItem.hearings[0] && (
                    <div className="mt-3 text-sm">
                      <p className="text-muted-foreground">Next Hearing</p>
                      <p>{format(new Date(caseItem.hearings[0].date), 'PPP')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No cases found</h3>
            <p className="mb-4 mt-2 text-center text-muted-foreground">
              This client doesn't have any cases yet.
            </p>
            <Link href={`/clients/${client.id}/new-case`}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Case
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 