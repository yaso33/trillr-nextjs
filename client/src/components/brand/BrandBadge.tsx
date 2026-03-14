import { cn } from '@/lib/utils'

interface BrandBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

const variants = {
  primary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  secondary: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  outline: 'bg-transparent text-purple-400 border-purple-500/50',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export default function BrandBadge({
  children,
  variant = 'primary',
  size = 'md',
  pulse = false,
  className,
}: BrandBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              variant === 'success' && 'bg-emerald-400',
              variant === 'primary' && 'bg-purple-400',
              variant === 'error' && 'bg-red-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              variant === 'success' && 'bg-emerald-500',
              variant === 'primary' && 'bg-purple-500',
              variant === 'error' && 'bg-red-500'
            )}
          />
        </span>
      )}
      {children}
    </span>
  )
}
