import Link from "next/link"
import { PlusCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Client } from "@/types"

export async function generateMetadata() {
  const session = await auth()
  
  if (!session) {
    redirect("/signin")
  }
  
  return {
    title: "Clients - Pakistan Legal Manager",
  }
}

export default async function ClientsPage() {
  const session = await auth()
  
  if (!session) {
    return null // middleware will handle the redirect
  }
  
  const isAdmin = session.user.role === 'ADMIN'
  
  // Get all clients
  const clients = await prisma.client.findMany({
    where: {
      userId: isAdmin ? undefined : session.user.id
    },
    orderBy: {
      name: 'asc'
    },
    include: {
      cases: true
    }
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="w-full pl-8"
            />
          </div>
          <Link href="/clients/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      {clients.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>{client.email || 'No email'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{client.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-right">{client.address || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cases:</span>
                      <span>{client.cases.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <PlusCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No clients found</h3>
            <p className="mb-4 mt-2 text-center text-muted-foreground">
              Get started by adding your first client.
            </p>
            <Link href="/clients/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 