"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, UserPlus, Scale, AlertTriangle } from 'lucide-react'

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  cnic: z.string().optional().or(z.literal(''))
})

type FormValues = z.infer<typeof formSchema>

export default function NewClientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [needsMigration, setNeedsMigration] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      cnic: ''
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setNeedsMigration(false)
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create client')
      }
      
      const data = await response.json()
      toast.success('Client created successfully')
      router.push(`/clients/${data.id}`)
      router.refresh()
    } catch (error: any) {
      console.error('Error creating client:', error)
      
      // Check for session/auth issues
      if (error.message && (
        error.message.includes('User reference is invalid') ||
        error.message.includes('User not found') ||
        error.message.includes('Invalid user session')
      )) {
        toast.error('Session error. Please try logging out and back in')
        return
      }
      
      // Check if this is a database schema error
      if (error.message && (
          error.message.includes('column') || 
          error.message.includes('table') || 
          error.message.includes('relation') ||
          error.message.includes('database') ||
          error.message.includes('migration')
        )) {
        setNeedsMigration(true)
        toast.error('Database error. Please run the migration scripts')
      } else {
        toast.error(error.message || 'Failed to create client')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Clients
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Client</h1>
            <p className="text-muted-foreground">Enter the details for the new client</p>
          </div>
          <UserPlus className="h-12 w-12 text-emerald-600" />
        </div>
      </div>
      
      {needsMigration && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Migration Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              The application schema has been updated and requires database migration. Please follow
              the instructions in the MIGRATION-README.md file to update your database.
            </p>
            <Button variant="outline" size="sm" className="w-fit" asChild>
              <Link href="/migration-instructions">View Migration Instructions</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center bg-emerald-50 border-b">
            <div className="flex items-center justify-center space-x-2">
              <Scale className="h-5 w-5" />
              <CardTitle className="text-xl">
                <span className="font-urdu mr-2">موکل کے تفصیلات</span>
                <span>| Client Details</span>
              </CardTitle>
            </div>
            <CardDescription>کلائنٹ فارم | Client Form</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="font-urdu">نام</span> | Full Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">ای میل</span> | Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="client@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="font-urdu">فون</span> | Phone
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+92 303 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="font-urdu">شناختی کارڈ نمبر</span> | CNIC Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="12345-1234567-1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Format: XXXXX-XXXXXXX-X
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="font-urdu">پتہ</span> | Address
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter client's address"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-4">
                  <Link href="/clients">
                    <Button variant="outline" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Client'}
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