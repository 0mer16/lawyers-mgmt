"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, Calendar, UserPlus, Scale } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  caseNumber: z.string().optional(),
  court: z.string({ required_error: 'Please select a court' }),
  caseType: z.string({ required_error: 'Please select a case type' }),
  judge: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'WON', 'LOST', 'SETTLED'], {
    required_error: 'Please select a status',
  }),
  fillingDate: z.date().optional(),
  clientIds: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Client {
  id: string;
  name: string;
}

export default function EditCasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [caseData, setCaseData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Default values will be set after fetching case data
    defaultValues: {
      title: '',
      caseNumber: '',
      court: '',
      caseType: '',
      judge: '',
      description: '',
      status: 'ACTIVE',
      fillingDate: undefined,
      clientIds: [],
    },
  })

  // Fetch case data
  useEffect(() => {
    const fetchCaseData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cases/${caseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch case data')
        }
        const data = await response.json()
        setCaseData(data)
        
        // Set form values based on the fetched data
        form.reset({
          title: data.title,
          caseNumber: data.caseNumber || '',
          court: data.court || '',
          caseType: data.caseType || '',
          judge: data.judge || '',
          description: data.description || '',
          status: data.status,
          fillingDate: data.fillingDate ? new Date(data.fillingDate) : undefined,
          clientIds: data.clients?.map((client: any) => client.id) || [],
        })
      } catch (error) {
        console.error('Error fetching case:', error)
        setError('Failed to load case details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCaseData()
  }, [caseId, form])

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }
    
    fetchClients()
  }, [])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    
    try {
      // Ensure clientIds is an array (not undefined or null)
      const formData = {
        ...values,
        clientIds: values.clientIds || []
      };
      
      console.log('Submitting case update:', formData)
      
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      // Log the raw response for debugging
      console.log('Response status:', response.status);
      
      // Try to parse JSON response - wrap in try/catch in case it's not valid JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log('Full response data:', responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        // If we can't parse JSON, still throw an error with status code info
        if (!response.ok) {
          throw new Error(`Server error (${response.status})`);
        }
      }
      
      if (!response.ok) {
        console.error('Error response from server:', responseData)
        throw new Error(responseData?.error || responseData?.details || 'Failed to update case')
      }
      
      toast.success('Case updated successfully')
      router.push(`/cases/${caseId}`)
      router.refresh()
    } catch (error: any) {
      console.error('Error updating case:', error)
      toast.error(error.message || 'Failed to update case')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading case details...</h2>
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
            onClick={() => router.push(`/cases/${caseId}`)}
          >
            Back to Case
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/cases/${caseId}`}
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Case Details
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Case</h1>
            <p className="text-muted-foreground">Update the details for this case</p>
          </div>
          <Scale className="h-12 w-12 text-emerald-600" />
        </div>
      </div>
      
      <div className="mx-auto">
        <Card>
          <CardHeader className="text-center bg-emerald-50 border-b">
            <div className="flex items-center justify-center space-x-2">
              <Scale className="h-5 w-5" />
              <CardTitle className="text-xl">
                <span className="font-urdu mr-2">انصاف کے لیئے جدوجہد کریں</span>
                <span>| Advocate Notebook</span>
              </CardTitle>
            </div>
            <CardDescription>از دفتر | Office Record</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title and Case Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">عنوان کیس</span> | Case Title
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Smith v. Jones Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="caseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">کیس نمبر</span> | Case Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2023-CV-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Court and Judge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="court"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">عدالت</span> | Court
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select court" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                            <SelectItem value="Lahore High Court">Lahore High Court</SelectItem>
                            <SelectItem value="Islamabad High Court">Islamabad High Court</SelectItem>
                            <SelectItem value="Sindh High Court">Sindh High Court</SelectItem>
                            <SelectItem value="Peshawar High Court">Peshawar High Court</SelectItem>
                            <SelectItem value="Balochistan High Court">Balochistan High Court</SelectItem>
                            <SelectItem value="District Court">District Court</SelectItem>
                            <SelectItem value="Sessions Court">Sessions Court</SelectItem>
                            <SelectItem value="Civil Court">Civil Court</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="judge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">جج</span> | Judge
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Justice Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Case Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="caseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">قسم کیس</span> | Case Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Civil">Civil</SelectItem>
                            <SelectItem value="Criminal">Criminal</SelectItem>
                            <SelectItem value="Family">Family</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Tax">Tax</SelectItem>
                            <SelectItem value="Property">Property</SelectItem>
                            <SelectItem value="Immigration">Immigration</SelectItem>
                            <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                            <SelectItem value="Labor">Labor</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">کیفیت</span> | Status
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="WON">Won</SelectItem>
                            <SelectItem value="LOST">Lost</SelectItem>
                            <SelectItem value="SETTLED">Settled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Filing Date and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fillingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          <span className="font-urdu">تاریخ داخل</span> | Filing Date
                        </FormLabel>
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
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
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
                    name="clientIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            <span className="font-urdu">موکلین</span> | Clients
                          </FormLabel>
                          <FormDescription>
                            Select clients involved in this case
                          </FormDescription>
                        </div>
                        {clients.length > 0 ? (
                          <div className="space-y-2">
                            {clients.map((client) => (
                              <FormField
                                key={client.id}
                                control={form.control}
                                name="clientIds"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={client.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(client.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value || [], client.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== client.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {client.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            No clients available. <Link href="/clients/new" className="text-emerald-600 hover:underline">Create a client</Link> first.
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          asChild
                        >
                          <Link href="/clients/new">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New Client
                          </Link>
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="font-urdu">تفصیل</span> | Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the details of the case"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push(`/cases/${caseId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 