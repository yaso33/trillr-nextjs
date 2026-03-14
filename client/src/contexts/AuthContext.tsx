import { useToast } from '@/hooks/use-toast'
import { ErrorLogger } from '@/lib/errorHandler'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  verifyOTP: (token: string) => Promise<void>
  resendOTP: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if Supabase is configured
    if (!supabase) {
      ErrorLogger.log('Supabase is not configured - auth features will be limited')
      setLoading(false)
      return
    }

    // First, try to get the current session and handle any potential errors
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((error) => {
        ErrorLogger.log('Error getting auth session:', error)
        setLoading(false) // Always stop loading, even if there's an error
      })

    // Then, set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Cleanup function to unsubscribe safely
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    toast({
      title: 'Welcome back!',
      description: 'Successfully signed in.',
    })
  }

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${window.location.origin}/verify-otp`,
      },
    })

    if (error) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    toast({
      title: 'Account created!',
      description: 'Please check your email to verify your account.',
      duration: 10000,
    })
  }

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    toast({
      title: 'Signed out',
      description: 'Successfully signed out.',
    })
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }
  }

  const verifyOTP = async (token: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    if (!user?.email) {
      throw new Error('No email found')
    }

    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token,
      type: 'email',
    })

    if (error) {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    toast({
      title: 'Email verified!',
      description: 'Your email has been verified successfully.',
    })
  }

  const resendOTP = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    if (!user?.email) {
      throw new Error('No email found')
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    })

    if (error) {
      toast({
        title: 'Error resending code',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    toast({
      title: 'Code sent!',
      description: 'A new verification code has been sent to your email.',
    })
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast({
        title: 'Error sending reset email',
        description: error.message,
        variant: 'destructive',
      })
      throw error
    }

    toast({
      title: 'Reset email sent!',
      description: 'Check your email for password reset instructions.',
    })
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    verifyOTP,
    resendOTP,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
