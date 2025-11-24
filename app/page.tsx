import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, FileText, Users, Calendar, Shield, TrendingUp } from "lucide-react"

export default async function Home() {
  const session = await auth()
  
  // If logged in, show a different view with a dashboard link
  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Scale className="h-16 w-16 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            You're signed in and ready to manage your cases.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Scale className="h-16 w-16 text-emerald-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Lawyers Management System
          </h1>
          
          <p className="text-lg text-slate-600 mb-8">
            Streamline your legal practice with comprehensive case management, 
            client tracking, and hearing scheduling in one powerful platform.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signin">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-emerald-600" />}
            title="Case Management"
            description="Organize and track all your cases with detailed information, status updates, and documentation in one place."
          />
          
          <FeatureCard
            icon={<Users className="h-8 w-8 text-emerald-600" />}
            title="Client Portal"
            description="Maintain comprehensive client profiles with contact information, case history, and important documents."
          />
          
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-emerald-600" />}
            title="Hearing Scheduler"
            description="Never miss a court date with our integrated calendar and hearing management system."
          />
          
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-emerald-600" />}
            title="Secure & Private"
            description="Enterprise-grade security with JWT authentication and encrypted data storage for client confidentiality."
          />
          
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-emerald-600" />}
            title="Document Management"
            description="Upload, organize, and access case documents and evidence with ease."
          />
          
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-emerald-600" />}
            title="Analytics Dashboard"
            description="Track your success rate, case statistics, and performance metrics at a glance."
          />
        </div>
        
        {/* CTA Section */}
        <div className="mt-24 bg-emerald-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to modernize your practice?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Join hundreds of lawyers who trust our platform for their daily operations.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="bg-emerald-50 w-fit p-3 rounded-lg mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

