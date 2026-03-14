import { cn } from '@/lib/utils'

interface BrandAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  verified?: boolean
  ring?: boolean
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
}

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
}

const statusSizes = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
}

export default function BrandAvatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  status,
  verified = false,
  ring = false,
  className,
}: BrandAvatarProps) {
  const initials = fallback?.slice(0, 2).toUpperCase() || '?'

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center font-semibold text-white',
          sizes[size],
          ring && 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-background'
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-background',
            statusColors[status],
            statusSizes[size],
            status === 'online' && 'animate-pulse'
          )}
        />
      )}

      {verified && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 flex items-center justify-center',
            size === 'xs' && 'w-3 h-3',
            size === 'sm' && 'w-3.5 h-3.5',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5',
            size === 'xl' && 'w-6 h-6',
            size === '2xl' && 'w-7 h-7'
          )}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  )
}
