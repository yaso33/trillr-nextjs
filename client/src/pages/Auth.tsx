
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'
import { FormEvent, useState } from 'react'

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAuthAction = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!supabase) throw new Error('Supabase client is not available.')

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, full_name: username } },
        })
        if (error) throw error
        if (data.user?.identities?.length === 0) throw new Error('User already exists.')
        setSuccess('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/' // Redirect to home
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-black/40 backdrop-blur-xl border border-primary/20 rounded-3xl shadow-2xl shadow-primary/10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">{
          isSignUp ? 'Create Your Account' : 'Welcome Back'
        }</h1>
        <p className="text-white/60 mt-2">{
          isSignUp ? 'Join the new era of social media.' : 'Log in to continue your journey.'
        }</p>
      </div>

      <div className="flex bg-white/5 rounded-lg p-1">
        <button
          className={cn(
            'w-1/2 p-2 rounded-md font-bold transition-all duration-300 text-sm',
            isSignUp ? 'bg-primary text-black' : 'text-white/50'
          )}
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </button>
        <button
          className={cn(
            'w-1/2 p-2 rounded-md font-bold transition-all duration-300 text-sm',
            !isSignUp ? 'bg-primary text-black' : 'text-white/50'
          )}
          onClick={() => setIsSignUp(false)}
        >
          Log In
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md text-center text-sm">{error}</p>}
      {success && <p className="text-green-500 bg-green-500/10 p-3 rounded-md text-center text-sm">{success}</p>}

      <form onSubmit={handleAuthAction} className="space-y-6">
        {isSignUp && (
          <AuthInput type="text" placeholder="Username" icon={User} value={username} onChange={e => setUsername(e.target.value)} />
        )}
        <AuthInput type="email" placeholder="Email" icon={Mail} value={email} onChange={e => setEmail(e.target.value)} />
        <AuthInput type="password" placeholder="Password" icon={Lock} value={password} onChange={e => setPassword(e.target.value)} />
        
        <Button type="submit" className="w-full group" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : 
            isSignUp ? 'Create Account' : 'Log In'
          }
          {!loading && <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />}
        </Button>
      </form>

      <p className="text-center text-xs text-white/40">
        By {isSignUp ? 'signing up' : 'logging in'}, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

const AuthInput = ({ type, placeholder, icon: Icon, value, onChange }) => (
  <div className="relative">
    <Icon className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-primary/70" />
    <Input 
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      className="pl-12"
    />
  </div>
)

export default function Auth() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans text-foreground antialiased relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-20 bg-background" />
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute bottom-0 left-[5%] w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-[5%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[20%] right-[20%] w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-blob animation-delay-4000" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      >
        <header className="absolute top-6 left-6">
          <Logo className="w-24 h-24" />
        </header>
        <AuthForm />
      </motion.div>
    </div>
  )
}
