'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get error from URL query parameters
  const errorType = searchParams.get('error') || 'Unknown error'
  let errorMessage = 'An error occurred during authentication'
  
  console.log("Auth error:", errorType)
  
  // Map error codes to user-friendly messages
  switch (errorType) {
    case 'CredentialsSignin':
      errorMessage = 'Invalid email or password. Please try again.'
      break
    case 'AccessDenied':
      errorMessage = 'You do not have permission to access this resource.'
      break
    case 'SessionRequired':
      errorMessage = 'You need to be signed in to access this page.'
      break
    case 'OAuthSignin':
      errorMessage = 'Error starting the OAuth sign-in flow.'
      break
    case 'OAuthCallback':
      errorMessage = 'Error in the OAuth callback process.'
      break
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration.'
      break
    case 'Verification':
      errorMessage = 'The verification token is invalid or has expired.'
      break
    default:
      errorMessage = 'An error occurred while signing in. Please try again.'
  }
  
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
        </div>
        <CardDescription>There was a problem with your sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">{errorMessage}</p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => router.push('/signin')} 
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Return to Sign In
        </Button>
      </CardFooter>
    </Card>
  )
} 