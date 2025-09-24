import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { trpc } from '@/lib/trpc'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // tRPC mutation to add user to team members
  const addNewUserMutation = trpc.teamMembers.addNewUser.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      setLoading(true)
      setError('')

      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setVerifying(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      setLoading(true)
      setError('')

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })

        // Add user to team members table
        try {
          if (completeSignUp.createdUserId) {
            await addNewUserMutation.mutateAsync({
              firstName,
              lastName,
              email,
              clerkUserId: completeSignUp.createdUserId,
            })
          }
        } catch (teamMemberError) {
          // Log error but don't prevent signup completion
          console.error('Failed to add user to team members:', teamMemberError)
        }

        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TwinView</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-gray-600">We sent a verification code to {email}</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TwinView</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Join the digital twin intelligence platform</p>
        </div>

        {/* Sign Up Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-green-600 hover:text-green-700 font-medium">
              Sign in here
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}