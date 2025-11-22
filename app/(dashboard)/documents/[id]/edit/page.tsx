'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  category: z.string().optional(),
  tags: z.string().optional(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

export default function EditDocumentPage() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [documentData, setDocumentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
    },
  })
  
  // Fetch document data
  useEffect(() => {
    async function fetchDocumentData() {
      setIsLoadingData(true)
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch document data')
        }
        
        const data = await response.json()
        setDocumentData(data)
        
        // Set form values
        form.reset({
          title: data.title,
          description: data.description || '',
          category: data.category || '',
          tags: data.tags || '',
        })
      } catch (error) {
        console.error('Error fetching document:', error)
        setError('Failed to load document details')
      } finally {
        setIsLoadingData(false)
      }
    }
    
    fetchDocumentData()
  }, [documentId, form])
  
  // Handle form submission
  async function onSubmit(data: DocumentFormValues) {
    setLoading(true)
    
    try {
      console.log('Submitting document update:', data)
      
      // Call API to update document
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('Error response from server:', responseData)
        throw new Error(responseData.error || 'Failed to update document')
      }
      
      toast.success('Document updated successfully')
      router.push(`/documents/${documentId}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
      console.error('Error updating document:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading document details...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p>{error}</p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/documents/${documentId}`)}
          >
            Back to Document
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={`/documents/${documentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Document
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Document</h1>
        <p className="text-muted-foreground mt-1">
          Update document details
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <CardTitle>Document Information</CardTitle>
          </div>
          <CardDescription>
            Edit the details for this document
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
                      <Input placeholder="Document Title" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the document
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
                        placeholder="Brief description of this document"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Evidence">Evidence</SelectItem>
                        <SelectItem value="Court">Court</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Comma-separated tags (e.g. important, confidential)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter comma-separated tags to categorize this document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/documents/${documentId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 