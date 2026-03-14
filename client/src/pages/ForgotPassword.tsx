import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Key } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await resetPassword(email)
      setEmailSent(true)
      toast({
        title: 'Email Sent!',
        description: 'Check your email for password reset instructions.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-primary/30 neon-glow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
            <Key className="h-8 w-8 text-primary" strokeWidth={2} />
          </div>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {emailSent
              ? "We've sent you a password reset link"
              : 'Enter your email to receive a password reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <Button type="submit" className="w-full neon-glow-strong" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                <p className="text-sm text-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Check your inbox and click the link to reset your password.
                </p>
              </div>

              <Button onClick={() => setLocation('/auth')} className="w-full neon-glow-strong">
                Back to Sign In
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="text-primary hover:underline"
                >
                  Try another email
                </button>
              </div>
            </div>
          )}

          {!emailSent && (
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setLocation('/auth')}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
