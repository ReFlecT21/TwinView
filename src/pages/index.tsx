import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, BarChart3, Zap, Shield, Users, TrendingUp } from 'lucide-react'

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  if (isSignedIn) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">TwinView</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Digital Twin Partner
            <span className="text-blue-600 block">Intelligence Platform</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track and analyze partner digital twin strategies, identify opportunities, and drive Dell partnership success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to track digital twin partnerships
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive partner intelligence platform designed for Dell&apos;s digital twin ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Building2 className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Partner Management</CardTitle>
              <CardDescription>
                Track partner companies, their digital twin initiatives, and Dell opportunity scores.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Get detailed analytics on partner performance, market trends, and revenue opportunities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-600 mb-4" />
              <CardTitle>Opportunity Detection</CardTitle>
              <CardDescription>
                AI-powered opportunity assessment to identify high-value partnership potential.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Secure & Compliant</CardTitle>
              <CardDescription>
                Enterprise-grade security with role-based access control and data protection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-red-600 mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Share insights and collaborate across teams with real-time updates and notifications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-indigo-600 mb-4" />
              <CardTitle>Growth Tracking</CardTitle>
              <CardDescription>
                Monitor partnership growth, track deal progress, and measure success metrics.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Dell&apos;s digital twin partner intelligence platform and unlock new opportunities.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-lg font-semibold">TwinView</span>
          </div>
          <p className="text-gray-400">
            &copy; 2024 Dell Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}