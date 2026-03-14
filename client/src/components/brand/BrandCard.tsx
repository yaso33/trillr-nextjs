import { cn } from '@/lib/utils'

interface BrandCardProps {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'gradient' | 'glow'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  hover?: boolean
}

const variants = {
  default: 'bg-card border border-border/50',
  glass: 'bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10',
  gradient:
    'bg-gradient-to-br from-purple-500/10 via-transparent to-fuchsia-500/10 border border-purple-500/20',
  glow: 'bg-card border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export default function BrandCard({
  children,
  variant = 'default',
  padding = 'md',
  className,
  hover = false,
}: BrandCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        paddings[padding],
        hover && 'hover:scale-[1.02] hover:shadow-xl hover:border-purple-500/50 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
