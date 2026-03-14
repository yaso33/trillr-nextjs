import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'

export default function VerifyOTP() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const { verifyOTP, resendOTP } = useAuth()
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await verifyOTP(otp)
      toast({
        title: 'Email Verified!',
        description: 'Your email has been verified successfully.',
      })
      setLocation('/')
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP code. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendOTP()
      toast({
        title: 'OTP Sent',
        description: 'A new verification code has been sent to your email.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend OTP.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-primary/30 neon-glow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center neon-glow">
            <Mail className="h-8 w-8 text-primary" strokeWidth={2} />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to your email address. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="border-primary/30 focus:border-primary text-center text-2xl tracking-widest font-mono"
                autoComplete="one-time-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full neon-glow-strong"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p className="text-muted-foreground mb-2">Didn't receive the code?</p>
            <button type="button" onClick={handleResend} className="text-primary hover:underline">
              Resend verification code
            </button>
          </div>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setLocation('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
