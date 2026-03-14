import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow'
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  animate?: boolean
}

const gradients = {
  primary: 'from-purple-400 via-violet-400 to-fuchsia-400',
  secondary: 'from-pink-400 via-purple-400 to-indigo-400',
  accent: 'from-cyan-400 via-purple-400 to-pink-400',
  rainbow: 'from-red-400 via-yellow-400 to-green-400',
}

export default function GradientText({
  children,
  variant = 'primary',
  as: Component = 'span',
  className,
  animate = false,
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradients[variant],
        animate && 'animate-gradient bg-[length:200%_auto]',
        className
      )}
    >
      {children}
    </Component>
  )
}
