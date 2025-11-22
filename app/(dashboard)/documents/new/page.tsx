'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { FileText, ArrowLeft, UploadCloud } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const documentFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  file: z.instanceof(File, { message: 'Please upload a file' }).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    { message: 'File size must be less than 5MB' }
  ),
  caseId: z.string().min(1, { message: 'Please select a case' }),
  clientId: z.string().optional(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

export default function NewDocumentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCaseId = searchParams.get('caseId')
  const preselectedClientId = searchParams.get('clientId')
  
  const [cases, setCases] = useState<{id: string, title: string}[]>([])
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      caseId: preselectedCaseId || '',
      clientId: preselectedClientId || '',
    },
  })
  
  // Fetch cases and clients when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch cases
        const casesResponse = await fetch('/api/cases')
        if (!casesResponse.ok) {
          throw new Error('Failed to fetch cases')
        }
        const casesData = await casesResponse.json()
        setCases(casesData.map((c: any) => ({ id: c.id, title: c.title })))
        
        // Fetch clients
        const clientsResponse = await fetch('/api/clients')
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients')
        }
        const clientsData = await clientsResponse.json()
        setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name })))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load required data')
      } finally {
        setIsLoadingData(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('file', file, { shouldValidate: true })
    }
  }
  
  // Handle form submission
  async function onSubmit(data: DocumentFormValues) {
    setLoading(true)
    
    try {
      console.log('Submitting form with data:', {
        title: data.title,
        caseId: data.caseId,
        file: data.file ? {
          name: data.file.name,
          size: data.file.size,
          type: data.file.type
        } : 'No file'
      });
      
      if (!data.file) {
        toast.error('Please select a file to upload');
        setLoading(false);
        return;
      }
      
      // Create FormData object for file upload
      const formData = new FormData()
      formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      formData.append('file', data.file)
      formData.append('caseId', data.caseId)
      if (data.clientId) formData.append('clientId', data.clientId)
      
      // Call API to upload document
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type header when sending FormData
      })
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server error response:', responseData);
        throw new Error(responseData.error || 'Failed to upload document')
      }
      
      toast.success('Document uploaded successfully')
      
      // Redirect to appropriate page
      if (preselectedCaseId) {
        router.push(`/cases/${preselectedCaseId}`)
      } else if (preselectedClientId) {
        router.push(`/clients/${preselectedClientId}`)
      } else {
        router.push(`/documents/${responseData.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
      console.error('Error uploading document:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={
            preselectedCaseId ? `/cases/${preselectedCaseId}` : 
            preselectedClientId ? `/clients/${preselectedClientId}` : 
            "/cases"
          }>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground mt-1">
          Add a new document to the system
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
          <CardDescription>
            Upload a file and enter document details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Contract Agreement" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of this document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief description of this document"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {field.value instanceof File ? (
                            <div className="flex flex-col items-center justify-center text-center">
                              <FileText className="w-8 h-8 text-emerald-600 mb-2" />
                              <p className="text-sm font-medium">
                                {field.value.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(field.value.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PDF, DOCX, JPG up to 5MB
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                                console.log("File selected:", file.name, file.size);
                              }
                            }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          />
                        </div>
                        
                        {field.value instanceof File && (
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-emerald-600 mr-2" />
                              <span className="text-sm truncate">{field.value.name}</span>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => field.onChange(null)}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!preselectedCaseId || isLoadingData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingData ? "Loading cases..." : "Select a case"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cases.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!preselectedClientId || isLoadingData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingData ? "Loading clients..." : "Select a client (optional)"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      If this document is specific to a client, select them here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 