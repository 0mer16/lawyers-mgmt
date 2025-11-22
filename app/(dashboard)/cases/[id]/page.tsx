"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, Calendar, Users, FileText, Pencil, 
  MoreVertical, Clock, Trash2, Send 
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Client, Hearing, Document as DocumentType } from "@/types"

interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
  }
}

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  
  const [caseDetail, setCaseDetail] = useState<any>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [isDeletingNote, setIsDeletingNote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch case data
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch case data')
        }
        const data = await response.json()
        setCaseDetail(data)
      } catch (error) {
        console.error('Error fetching case:', error)
        setError('Failed to load case details')
      }
    }
    
    fetchCaseData()
  }, [caseId])
  
  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoadingNotes(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/cases/${caseId}/notes`)
        
        // If the API returns an error (likely due to missing table)
        if (!response.ok) {
          console.warn('Notes feature not available - database may need migration')
          setNotes([])
          setError(null)
          setIsLoadingNotes(false)
          return
        }
        
        const data = await response.json()
        setNotes(data)
      } catch (error) {
        console.error('Error fetching notes:', error)
        setError('Notes feature is not available. Database may need to be migrated.')
      } finally {
        setIsLoadingNotes(false)
      }
    }
    
    fetchNotes()
  }, [caseId])
  
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    setIsSubmittingNote(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/cases/${caseId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add note')
      }
      
      const addedNote = await response.json()
      setNotes(prevNotes => [addedNote, ...prevNotes])
      setNewNote('')
      toast.success('Note added successfully')
    } catch (error) {
      console.error('Error adding note:', error)
      setError('Failed to add note. Note feature may not be available until database migrations are applied.')
      toast.error('Failed to add note')
    } finally {
      setIsSubmittingNote(false)
    }
  }
  
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    setIsDeletingNote(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/cases/${caseId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete note')
      }
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
      toast.success('Note deleted successfully')
    } catch (error) {
      console.error('Error deleting note:', error)
      setError('Failed to delete note')
      toast.error('Failed to delete note')
    } finally {
      setIsDeletingNote(false)
    }
  }
  
  if (!caseDetail) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading case details...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  const statusColorMap: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    PENDING: "bg-amber-100 text-amber-800",
    CLOSED: "bg-gray-100 text-gray-800",
    WON: "bg-sky-100 text-sky-800",
    LOST: "bg-red-100 text-red-800",
    SETTLED: "bg-purple-100 text-purple-800",
  }

  const formattedDate = caseDetail.fillingDate
    ? format(new Date(caseDetail.fillingDate), 'PPP')
    : 'Not specified'
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/cases"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Cases
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold">{caseDetail.title}</h1>
            <Badge className={statusColorMap[caseDetail.status]}>
              {caseDetail.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Case #{caseDetail.caseNumber || 'No number'} • Filed: {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/cases/${caseId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Case
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Delete Case</DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/clients/new?caseId=${caseId}`} className="flex w-full">
                  Add Client
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/hearings/new?caseId=${caseId}`} className="flex w-full">
                  Add Hearing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/documents/new?caseId=${caseId}`} className="flex w-full">
                  Upload Document
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent>
            {caseDetail.description ? (
              <div className="whitespace-pre-wrap">{caseDetail.description}</div>
            ) : (
              <p className="text-muted-foreground">No description provided</p>
            )}
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Court</h3>
                <p className="mt-1 text-muted-foreground">
                  {caseDetail.court || 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Case Type</h3>
                <p className="mt-1 text-muted-foreground">
                  {caseDetail.caseType || 'Not specified'}
                </p>
              </div>
              {caseDetail.counselFor && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Counsel For</h3>
                  <p className="mt-1 text-muted-foreground">
                    {caseDetail.counselFor}
                  </p>
                </div>
              )}
              
              {caseDetail.opposingParty && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Opposing Party</h3>
                  <p className="mt-1 text-muted-foreground">
                    {caseDetail.opposingParty}
                  </p>
                </div>
              )}
              
              {/* Only show these fields for Criminal cases */}
              {caseDetail.caseType === 'Criminal' && (
                <>
                  {caseDetail.fir && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">FIR Number</h3>
                      <p className="mt-1 text-muted-foreground">
                        {caseDetail.fir}
                      </p>
                    </div>
                  )}
                  
                  {caseDetail.policeStation && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Police Station</h3>
                      <p className="mt-1 text-muted-foreground">
                        {caseDetail.policeStation}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Judge</h3>
                <p className="mt-1 text-muted-foreground">
                  {caseDetail.judge || 'Not assigned'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Case Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Assigned Lawyer</h3>
              <p className="mt-1">{caseDetail.lawyer.name}</p>
              <p className="text-sm text-muted-foreground">{caseDetail.lawyer.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge className={`mt-1 ${statusColorMap[caseDetail.status]}`}>
                {caseDetail.status}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Clients</h3>
              {caseDetail.clients && caseDetail.clients.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {caseDetail.clients.map((client: Client) => (
                    <li key={client.id}>
                      <Link 
                        href={`/clients/${client.id}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {client.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground">No clients assigned</p>
              )}
              <Button 
                variant="link" 
                className="mt-1 h-auto p-0 text-emerald-600"
                asChild
              >
                <Link href={`/clients/new?caseId=${caseId}`}>
                  <Users className="mr-1 h-3 w-3" />
                  Add Client
                </Link>
              </Button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Case Created</h3>
              <p className="mt-1">
                {format(new Date(caseDetail.createdAt), 'PPP')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="mt-1">
                {format(new Date(caseDetail.updatedAt), 'PPP')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Filing Date</h3>
              <p className="mt-1 text-muted-foreground">
                {caseDetail.fillingDate ? format(new Date(caseDetail.fillingDate), 'PPP') : 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="hearings" className="mt-6">
        <TabsList>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hearings" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Hearings</h2>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/hearings/new?caseId=${caseId}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Hearing
              </Link>
            </Button>
          </div>
          
          {caseDetail.hearings && caseDetail.hearings.length > 0 ? (
            <div className="space-y-4">
              {caseDetail.hearings.map((hearing: Hearing) => (
                <Card key={hearing.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/hearings/${hearing.id}`}
                          className="text-lg font-medium hover:text-emerald-600 transition-colors"
                        >
                          {hearing.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(hearing.date), 'PPP')}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(new Date(hearing.date), 'p')}</span>
                        </div>
                        {hearing.location && (
                          <div className="mt-1 text-sm">
                            Location: {hearing.location}
                          </div>
                        )}
                      </div>
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
                    
                    {hearing.notes && (
                      <div className="mt-3 border-t pt-3">
                        <h4 className="text-sm font-medium">Notes</h4>
                        <p className="mt-1 text-sm">{hearing.notes}</p>
                      </div>
                    )}
                    
                    {hearing.outcome && (
                      <div className="mt-3 border-t pt-3">
                        <h4 className="text-sm font-medium">Outcome</h4>
                        <p className="mt-1 text-sm">{hearing.outcome}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hearings/${hearing.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No hearings scheduled</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  This case doesn't have any hearings scheduled yet.
                </p>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href={`/hearings/new?caseId=${caseId}`}>
                    Schedule Hearing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Documents</h2>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/documents/new?caseId=${caseId}`}>
                <FileText className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </div>
          
          {caseDetail.documents && caseDetail.documents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {caseDetail.documents.map((document: DocumentType) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/documents/${document.id}`}
                          className="font-medium hover:text-emerald-600 transition-colors"
                        >
                          {document.title}
                        </Link>
                        {document.description && (
                          <p className="mt-1 text-sm line-clamp-2">{document.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Uploaded {format(new Date(document.createdAt), 'PP')}
                          </span>
                          {document.fileType && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{document.fileType}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2">
                          <Button variant="link" className="h-auto p-0 text-sm" asChild>
                            <a 
                              href={document.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              View Document
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No documents uploaded</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  This case doesn't have any documents attached yet.
                </p>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href={`/documents/new?caseId=${caseId}`}>
                    Upload Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="notes" className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <div className="flex gap-2">
              <Textarea 
                placeholder="Add a note about this case..." 
                className="flex-1"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 self-end"
                onClick={handleAddNote}
                disabled={isSubmittingNote || !newNote.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoadingNotes ? (
            <div className="flex justify-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground">Loading notes...</p>
              </div>
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {note.createdBy?.name} • {format(new Date(note.createdAt), 'PPP p')}
                        </p>
                        <div className="mt-2 whitespace-pre-wrap">{note.content}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={isDeletingNote}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No notes yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Add notes to keep track of important information about this case.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}