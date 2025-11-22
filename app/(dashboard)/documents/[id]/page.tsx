import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, Download, ExternalLink, FileText, Pencil, Trash } from "lucide-react"

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

interface DocumentDetailProps {
  params: {
    id: string
  }
}

export default async function DocumentDetail({ params }: DocumentDetailProps) {
  const session = await auth()
  
  if (!session) {
    return null // middleware will handle the redirect
  }
  
  const isAdmin = session.user.role === 'ADMIN'
  
  const document = await prisma.document.findUnique({
    where: {
      id: params.id,
    },
    include: {
      case: {
        select: {
          id: true,
          title: true,
          caseNumber: true,
          userId: true
        }
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
  
  if (!document) {
    notFound()
  }
  
  // Check if user has access to this document
  const hasAccess = isAdmin || document.userId === session.user.id || (document.case && document.case.userId === session.user.id)
  
  if (!hasAccess) {
    notFound() // Or return an access denied page
  }
  
  // Format dates
  const formattedCreatedDate = format(new Date(document.createdAt), 'EEEE, MMMM d, yyyy')
  const formattedCreatedTime = format(new Date(document.createdAt), 'h:mm a')
  
  // Get file type for display
  const fileType = document.fileType ? document.fileType.toUpperCase() : 'Unknown'
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={document.case ? `/cases/${document.case.id}` : "/documents"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            {fileType}
          </Badge>
          <span className="text-muted-foreground">
            Uploaded on {formattedCreatedDate}
          </span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>
                Preview or download the document
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 min-h-60">
              {/* For images, show a preview */}
              {['jpg', 'jpeg', 'png', 'gif'].includes(document.fileType || '') ? (
                <div className="mb-4">
                  <img 
                    src={document.fileUrl} 
                    alt={document.title} 
                    className="max-w-full max-h-80 object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-100 mb-3">
                    <FileText className="h-10 w-10 text-emerald-600" />
                  </div>
                  <p className="text-lg font-medium">{document.title}</p>
                  <p className="text-sm text-muted-foreground">{fileType} File</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button asChild>
                  <a href={document.fileUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {document.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{document.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Uploaded By</span>
                <span>{document.uploadedBy.name}</span>
                <span className="text-sm text-muted-foreground">{document.uploadedBy.email}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Upload Date</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formattedCreatedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formattedCreatedTime}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">File Type</span>
                <span>{fileType}</span>
              </div>
            </CardContent>
          </Card>
          
          {document.case && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Case</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/cases/${document.case.id}`}
                  className="font-medium hover:text-emerald-600 transition-colors"
                >
                  {document.case.title}
                </Link>
                {document.case.caseNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Case Number: {document.case.caseNumber}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {document.client && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Client</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/clients/${document.client.id}`}
                  className="font-medium hover:text-emerald-600 transition-colors"
                >
                  {document.client.name}
                </Link>
                {document.client.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {document.client.email}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {(isAdmin || document.userId === session.user.id) && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="destructive" className="w-full" asChild>
                  <Link href={`/documents/${document.id}/delete`}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 