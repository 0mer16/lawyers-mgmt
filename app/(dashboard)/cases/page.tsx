import Link from "next/link"
import { format } from "date-fns"
import { PlusCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Case, Client } from "@/types"

export default async function CasesPage() {
  const session = await auth()
  
  const isAdmin = session?.user.role === 'ADMIN'
  
  const activeCases = await prisma.case.findMany({
    where: {
      userId: isAdmin ? undefined : session?.user.id,
      status: {
        in: ['ACTIVE', 'PENDING']
      }
    },
    include: {
      clients: true,
      lawyer: {
        select: {
          id: true,
          name: true,
        }
      },
      hearings: {
        orderBy: {
          date: 'asc'
        },
        take: 1
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
  
  const closedCases = await prisma.case.findMany({
    where: {
      userId: isAdmin ? undefined : session?.user.id,
      status: {
        in: ['CLOSED', 'WON', 'LOST', 'SETTLED']
      }
    },
    include: {
      clients: true,
      lawyer: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5
  })
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cases</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link href="/cases/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Case
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search cases by title, client, or case number..."
            className="pl-8"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      
      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Active Cases</TabsTrigger>
          <TabsTrigger value="closed">Closed Cases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6">
            {activeCases.length > 0 ? (
              activeCases.map((caseItem) => (
                <CaseCard 
                  key={caseItem.id} 
                  caseItem={caseItem as Case}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <h3 className="text-lg font-medium">No active cases</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start by creating a new case for your client
                  </p>
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" asChild>
                    <Link href="/cases/new">
                      <PlusCircle className="mr-2 h-4 w-4" /> Create Case
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="closed" className="mt-6">
          <div className="grid gap-6">
            {closedCases.length > 0 ? (
              closedCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem as Case} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <h3 className="text-lg font-medium">No closed cases</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Closed cases will appear here when you change their status
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CaseItemProps {
  caseItem: Case;
}

function CaseCard({ caseItem }: CaseItemProps) {
  const statusColorMap: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    PENDING: "bg-amber-100 text-amber-800",
    CLOSED: "bg-gray-100 text-gray-800",
    WON: "bg-sky-100 text-sky-800",
    LOST: "bg-red-100 text-red-800",
    SETTLED: "bg-purple-100 text-purple-800",
  }
  
  const formattedDate = caseItem.fillingDate 
    ? format(new Date(caseItem.fillingDate), 'PP')
    : 'Not specified'
    
  const clientNames = caseItem.clients?.map((client: Client) => client.name).join(', ')
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href={`/cases/${caseItem.id}`}
              className="text-xl font-semibold hover:text-emerald-600 transition-colors"
            >
              {caseItem.title}
            </Link>
            <div className="mt-1 text-sm text-muted-foreground">
              <span>Case #{caseItem.caseNumber || 'No number'}</span>
              <span className="mx-2">•</span>
              <span>Filed: {formattedDate}</span>
              {caseItem.court && (
                <>
                  <span className="mx-2">•</span>
                  <span>{caseItem.court}</span>
                </>
              )}
            </div>
          </div>
          <Badge className={statusColorMap[caseItem.status]}>
            {caseItem.status}
          </Badge>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
            <p>{clientNames || 'No clients assigned'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
            <p>{caseItem.lawyer?.name || 'Not assigned'}</p>
          </div>
        </div>
        
        {caseItem.description && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="line-clamp-2 text-sm">{caseItem.description}</p>
          </div>
        )}
        
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cases/${caseItem.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cases/${caseItem.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 