'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { PlusCircle, FileText, Search, ChevronRight, Filter } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth-guard'
import { toast } from 'sonner'

interface Document {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileType: string | null
  createdAt: string
  case: {
    id: string
    title: string
  } | null
  client: {
    id: string
    name: string
  } | null
  uploadedBy: {
    id: string
    name: string
  }
}

export default function DocumentsPage() {
  const { user } = useAuth()
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'cases', 'clients'
  
  // Fetch documents when component mounts
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch('/api/documents')
        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }
        
        const data = await response.json()
        setDocuments(data)
        setFilteredDocuments(data)
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast.error('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDocuments()
  }, [])
  
  // Filter documents based on search query and filter
  useEffect(() => {
    let filtered = documents
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) || 
        (doc.description && doc.description.toLowerCase().includes(query)) ||
        (doc.case && doc.case.title.toLowerCase().includes(query)) ||
        (doc.client && doc.client.name.toLowerCase().includes(query))
      )
    }
    
    // Filter by type
    if (filter === 'cases') {
      filtered = filtered.filter(doc => doc.case !== null)
    } else if (filter === 'clients') {
      filtered = filtered.filter(doc => doc.client !== null)
    }
    
    setFilteredDocuments(filtered)
  }, [searchQuery, filter, documents])
  
  // Get badge color based on file type
  const getFileTypeBadge = (fileType: string | null) => {
    if (!fileType) return 'bg-gray-100 text-gray-800'
    
    const type = fileType.toLowerCase()
    if (['pdf'].includes(type)) {
      return 'bg-red-100 text-red-800'
    } else if (['doc', 'docx'].includes(type)) {
      return 'bg-blue-100 text-blue-800'
    } else if (['xls', 'xlsx'].includes(type)) {
      return 'bg-green-100 text-green-800'
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return 'bg-purple-100 text-purple-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Documents</h1>
        </div>
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/documents/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        <Select 
          value={filter} 
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter documents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="cases">Case Documents</SelectItem>
            <SelectItem value="clients">Client Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/documents/${doc.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-medium hover:text-emerald-600 transition-colors">
                          {doc.title}
                        </h3>
                        {doc.fileType && (
                          <Badge className={getFileTypeBadge(doc.fileType)}>
                            {doc.fileType.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      {doc.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {doc.description}
                        </p>
                      )}
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Uploaded {format(new Date(doc.createdAt), 'MMM d, yyyy')}</p>
                        
                        {doc.case && (
                          <p className="mt-1">
                            Case: {doc.case.title}
                          </p>
                        )}
                        
                        {doc.client && (
                          <p className="mt-1">
                            Client: {doc.client.name}
                          </p>
                        )}
                      </div>
                    </div>
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
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No documents found</h3>
            <p className="mb-4 mt-2 text-center text-muted-foreground">
              {searchQuery 
                ? "No documents match your search criteria." 
                : filter !== 'all' 
                  ? `No documents found for ${filter}.`
                  : "Get started by uploading your first document."}
            </p>
            <Button asChild>
              <Link href="/documents/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 