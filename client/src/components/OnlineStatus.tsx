import { useProfile } from '@/hooks/useProfiles'
import { cn } from '@/lib/utils'

interface OnlineStatusProps {
  userId: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showOffline?: boolean
}

export default function OnlineStatus({
  userId,
  showText = false,
  size = 'md',
  className,
  showOffline = true,
}: OnlineStatusProps) {
  const { data: profile } = useProfile(userId)

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  const status = profile?.status || 'offline'
  const isOnline = status !== 'offline'

  if (!isOnline && !showOffline) return null

  const statusColors: { [key: string]: string } = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-muted-foreground/50',
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative">
        <div
          className={cn('rounded-full transition-colors', sizeClasses[size], statusColors[status])}
        />
        {isOnline && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-75',
              sizeClasses[size],
              statusColors[status]
            )}
          />
        )}
      </div>

      {showText && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {profile?.status_message || status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
    </div>
  )
}
