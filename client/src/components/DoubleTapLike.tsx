import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface DoubleTapLikeProps {
  children: React.ReactNode
  onDoubleTap: () => void
  disabled?: boolean
  className?: string
}

export default function DoubleTapLike({
  children,
  onDoubleTap,
  disabled = false,
  className,
}: DoubleTapLikeProps) {
  const [showHeart, setShowHeart] = useState(false)
  const lastTapRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleClick = useCallback(() => {
    if (disabled) return

    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setShowHeart(true)
      onDoubleTap()

      timeoutRef.current = setTimeout(() => {
        setShowHeart(false)
      }, 800)
    }

    lastTapRef.current = now
  }, [onDoubleTap, disabled])

  return (
    <div
      className={cn('relative select-none', className)}
      onClick={handleClick}
      onTouchEnd={handleClick}
    >
      {children}

      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200',
          showHeart ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Heart
          className={cn(
            'text-white fill-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300',
            showHeart ? 'scale-100 animate-like-pop' : 'scale-0'
          )}
          style={{ width: '80px', height: '80px' }}
        />
      </div>
    </div>
  )
}
