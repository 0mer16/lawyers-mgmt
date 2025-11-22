"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  otherCaseType: z.string().optional(),
  judge: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'WON', 'LOST', 'SETTLED'], {
    required_error: 'Please select a status',
  }),
  fillingDate: z.date().optional(),
  clientIds: z.array(z.string()).optional(),
  counselFor: z.string().optional(),
  opposingParty: z.string().optional(),
  policeStation: z.string().optional(),
  fir: z.string().optional(),
  hearingDate: z.date().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Client {
  id: string;
  name: string;
}

export default function NewCasePage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedCaseType, setSelectedCaseType] = useState<string>("")
  const [showOtherCaseType, setShowOtherCaseType] = useState<boolean>(false)
  const [customCounselFor, setCustomCounselFor] = useState<boolean>(false)

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      caseNumber: '',
      court: '',
      caseType: '',
      otherCaseType: '',
      judge: '',
      description: '',
      status: 'ACTIVE',
      fillingDate: new Date(),
      clientIds: [],
      counselFor: '',
      opposingParty: '',
      policeStation: '',
      fir: '',
      hearingDate: new Date(),
    },
  })

  // Watch case type to conditionally display fields
  const watchCaseType = form.watch("caseType")
  
  // Update the case type state when it changes
  useEffect(() => {
    setSelectedCaseType(watchCaseType)
    setShowOtherCaseType(watchCaseType === "Other")
  }, [watchCaseType])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    
    try {
      // If case type is "Other", use the otherCaseType field value
      const submissionValues = {
        ...values,
        caseType: values.caseType === "Other" ? values.otherCaseType : values.caseType,
      }
      
      // Remove fields that don't exist in the schema
      delete submissionValues.otherCaseType
      
      // Only include FIR and police station for criminal cases
      if (values.caseType !== "Criminal") {
        delete submissionValues.fir
        delete submissionValues.policeStation
      }
      
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionValues),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create case')
      }
      
      const data = await response.json()
      toast.success('Case created successfully')
      router.push(`/cases/${data.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error creating case:', error)
      toast.error('Failed to create case')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/cases"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Cases
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Case</h1>
            <p className="text-muted-foreground">Enter the details for the new case</p>
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
                          <Input placeholder="e.g. Justice Khan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Updated Case Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="caseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">قسم مقدمہ</span> | Case Type
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value)
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Criminal">Criminal</SelectItem>
                            <SelectItem value="Civil">Civil</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  {/* Other Case Type Input - only shown when "Other" is selected */}
                  {showOtherCaseType && (
                    <FormField
                      control={form.control}
                      name="otherCaseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="font-urdu">دیگر قسم مقدمہ</span> | Other Case Type
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Specify case type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                {/* Filing and Hearing Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fillingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          <span className="font-urdu">تاریخ فائلنگ</span> | Filing Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
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
                    name="hearingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          <span className="font-urdu">تاریخ سماعت</span> | Hearing Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
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
                </div>
                
                {/* Status and Counsel For */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">حالت</span> | Status
                        </FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="counselFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">وکیل برائے</span> | Counsel For
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setCustomCounselFor(true)
                              field.onChange("")
                            } else {
                              setCustomCounselFor(false)
                              field.onChange(value)
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select counsel for" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Petitioner">Petitioner</SelectItem>
                            <SelectItem value="Petitioners">Petitioners</SelectItem>
                            <SelectItem value="Respondent">Respondent</SelectItem>
                            <SelectItem value="Respondents">Respondents</SelectItem>
                            <SelectItem value="custom">Enter Custom Value</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Custom Counsel For Input */}
                {customCounselFor && (
                  <FormField
                    control={form.control}
                    name="counselFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">وکیل برائے</span> | Custom Counsel For
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter custom counsel type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Opposing Party */}
                <FormField
                  control={form.control}
                  name="opposingParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="font-urdu">مد مقابل</span> | Opposing Party
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. State of Punjab" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Police Station and FIR - only shown for Criminal cases */}
                {selectedCaseType === "Criminal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="policeStation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="font-urdu">تھانہ</span> | Police Station
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Cantt Police Station" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="font-urdu">ایف آئی آر نمبر</span> | FIR Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 123/2023" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Client Selection */}
                <div>
                  <h3 className="text-md font-medium mb-2">
                    <span className="font-urdu">موکل منتخب کریں</span> | Select Clients
                  </h3>
                  <div className="border rounded-md p-4">
                    {clients.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clients.map(client => (
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
                                        const currentValue = field.value || []
                                        return checked
                                          ? field.onChange([...currentValue, client.id])
                                          : field.onChange(
                                              currentValue.filter((value) => value !== client.id)
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
                      <div className="flex items-center justify-center p-4">
                        <Link href="/clients/new">
                          <Button variant="outline" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New Client First
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="font-urdu">تفصیلات</span> | Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter case description and additional details..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Link href="/cases">
                    <Button variant="outline" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Case'}
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