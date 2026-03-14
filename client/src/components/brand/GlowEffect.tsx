import { cn } from '@/lib/utils'

interface GlowEffectProps {
  children: React.ReactNode
  color?: 'purple' | 'pink' | 'cyan' | 'emerald'
  intensity?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}

const colors = {
  purple: 'before:bg-purple-500/30 after:bg-purple-500/20',
  pink: 'before:bg-pink-500/30 after:bg-pink-500/20',
  cyan: 'before:bg-cyan-500/30 after:bg-cyan-500/20',
  emerald: 'before:bg-emerald-500/30 after:bg-emerald-500/20',
}

const intensities = {
  sm: 'before:blur-xl after:blur-2xl',
  md: 'before:blur-2xl after:blur-3xl',
  lg: 'before:blur-3xl after:blur-[4rem]',
}

export default function GlowEffect({
  children,
  color = 'purple',
  intensity = 'md',
  animate = false,
  className,
}: GlowEffectProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 -z-10',
          'before:absolute before:inset-0 before:rounded-full before:opacity-60',
          'after:absolute after:inset-0 after:rounded-full after:opacity-40',
          colors[color],
          intensities[intensity],
          animate && 'before:animate-pulse after:animate-pulse'
        )}
      />
      {children}
    </div>
  )
}
