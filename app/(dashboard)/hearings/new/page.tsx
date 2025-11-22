'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { CalendarIcon, ArrowLeft, Building } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function NewHearingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCaseId = searchParams.get('caseId')
  
  const [cases, setCases] = useState<{id: string, title: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingCases, setIsLoadingCases] = useState(true)
  
  const form = useForm<HearingFormValues>({
    resolver: zodResolver(hearingFormSchema),
    defaultValues: {
      title: '',
      date: undefined,
      time: '',
      location: '',
      notes: '',
      status: 'SCHEDULED',
      caseId: preselectedCaseId || '',
    },
  })
  
  // Fetch cases when component mounts
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
      } finally {
        setIsLoadingCases(false)
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
      
      console.log('Submitting hearing data:', hearingData);
      
      // Call API to create hearing
      const response = await fetch('/api/hearings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hearingData),
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to schedule hearing');
      }
      
      const result = await response.json()
      
      toast.success('Hearing scheduled successfully')
      
      // Redirect to the case details or hearing details
      if (preselectedCaseId) {
        router.push(`/cases/${preselectedCaseId}`)
      } else {
        router.push(`/hearings/${result.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
      console.error('Error scheduling hearing:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href={preselectedCaseId ? `/cases/${preselectedCaseId}` : "/cases"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Schedule Hearing</h1>
        <p className="text-muted-foreground mt-1">
          Create a new hearing for a case
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Hearing Information</CardTitle>
          <CardDescription>
            Enter the details for the new hearing
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
                      disabled={!!preselectedCaseId || isLoadingCases}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCases ? "Loading cases..." : "Select a case"} />
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
              
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Hearing"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 