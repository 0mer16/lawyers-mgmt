'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { CalendarIcon, ArrowLeft } from 'lucide-react'
import { format, parse } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const hearingFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().min(1, { message: 'Please select a time' }),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED']).default('SCHEDULED'),
  caseId: z.string().min(1, { message: 'Case is required' }),
})

type HearingFormValues = z.infer<typeof hearingFormSchema>

export default function EditHearingPage() {
  const router = useRouter()
  const params = useParams()
  const hearingId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [cases, setCases] = useState<{id: string, title: string}[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hearingData, setHearingData] = useState<any>(null)
  
  const form = useForm<HearingFormValues>({
    resolver: zodResolver(hearingFormSchema),
    defaultValues: {
      title: '',
      date: undefined,
      time: '',
      location: '',
      notes: '',
      status: 'SCHEDULED',
      caseId: '',
    },
  })
  
  // Fetch hearing data
  useEffect(() => {
    async function fetchHearingData() {
      setIsLoadingData(true)
      try {
        const response = await fetch(`/api/hearings/${hearingId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch hearing data')
        }
        
        const data = await response.json()
        setHearingData(data)
        
        // Extract time from date
        const hearingDate = new Date(data.date)
        const timeString = format(hearingDate, 'HH:mm')
        
        // Set form values
        form.reset({
          title: data.title,
          date: hearingDate,
          time: timeString,
          location: data.location || '',
          notes: data.notes || '',
          status: data.status,
          caseId: data.caseId,
        })
      } catch (error) {
        console.error('Error fetching hearing:', error)
        setError('Failed to load hearing details')
      } finally {
        setIsLoadingData(false)
      }
    }
    
    fetchHearingData()
  }, [hearingId, form])
  
  // Fetch cases
  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch('/api/cases')
        if (!response.ok) {
          throw new Error('Failed to fetch cases')
        }
        const data = await response.json()
        setCases(data.map((c: any) => ({ id: c.id, title: c.title })))
      } catch (error) {
        console.error('Error fetching cases:', error)
        toast.error('Failed to load cases')
      }
    }
    
    fetchCases()
  }, [])
  
  // Handle form submission
  async function onSubmit(data: HearingFormValues) {
    setLoading(true)
    
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(':').map(Number)
      const combinedDate = new Date(data.date)
      combinedDate.setHours(hours, minutes)
      
      // Prepare data for API
      const hearingData = {
        title: data.title,
        date: combinedDate.toISOString(),
        location: data.location,
        notes: data.notes,
        status: data.status,
        caseId: data.caseId,
      }
      
      console.log('Submitting hearing update:', hearingData)
      
      // Call API to update hearing
      const response = await fetch(`/api/hearings/${hearingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hearingData),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        console.error('Error response from server:', responseData)
        throw new Error(responseData.error || 'Failed to update hearing')
      }
      
      toast.success('Hearing updated successfully')
      router.push(`/hearings/${hearingId}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
      console.error('Error updating hearing:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading hearing details...</h2>
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
            onClick={() => router.push(`/hearings/${hearingId}`)}
          >
            Back to Hearing
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={`/hearings/${hearingId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hearing
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Hearing</h1>
        <p className="text-muted-foreground mt-1">
          Update the details for this hearing
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Hearing Information</CardTitle>
          <CardDescription>
            Edit the details for the hearing
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
                      <Input placeholder="Initial Hearing" {...field} />
                    </FormControl>
                    <FormDescription>
                      The title of the hearing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? 'text-muted-foreground' : ''}`}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Lahore High Court, Room 304" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information about the hearing"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="POSTPONED">Postponed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
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
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/hearings/${hearingId}`)}
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