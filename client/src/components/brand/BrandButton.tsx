import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'

interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variants = {
  primary:
    'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/25',
  secondary:
    'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:opacity-90 shadow-lg shadow-pink-500/25',
  outline:
    'border-2 border-purple-500 text-purple-500 hover:bg-purple-500/10 dark:border-purple-400 dark:text-purple-400',
  ghost: 'text-purple-500 hover:bg-purple-500/10 dark:text-purple-400',
  glow: 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]',
}

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-base rounded-xl gap-2',
  lg: 'h-12 px-6 text-lg rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-xl rounded-2xl gap-3',
}

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)

BrandButton.displayName = 'BrandButton'

export default BrandButton
