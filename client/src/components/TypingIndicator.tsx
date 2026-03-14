import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  username?: string
  className?: string
}

export default function TypingIndicator({ username, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {username && (
        <span className="text-xs">
          <span className="font-medium text-foreground">{username}</span> is typing...
        </span>
      )}
    </div>
  )
}
