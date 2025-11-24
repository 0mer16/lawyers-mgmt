'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Scale, Mail, Lock, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// Simple validation schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' })
})

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    setError('')
    
    try {
      // Call our custom signin API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || 'Invalid email or password')
        toast.error(result.error || 'Invalid email or password')
      } else {
        toast.success('Signed in successfully')
        // Small delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 100)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4">
      <Card className="mx-auto w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto bg-emerald-100 p-3 rounded-full w-fit">
            <Scale className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to access your legal practice dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <div className="mt-0.5">⚠️</div>
              <div>{error}</div>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="lawyer@example.com" 
                          type="email" 
                          disabled={loading}
                          className="pl-10 h-11"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          disabled={loading}
                          className="pl-10 h-11"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-medium" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6 border-t">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 w-full">
            <p className="text-sm text-emerald-800 text-center font-medium">
              Demo: lawyer@example.com / lawyer123
            </p>
          </div>
          <p className="text-sm text-slate-600 text-center">
            Don't have an account?{' '}
            <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
              Create one now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 