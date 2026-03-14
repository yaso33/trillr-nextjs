import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

const REACTIONS = [
  { emoji: '❤️', name: 'love', color: 'text-red-500' },
  { emoji: '😂', name: 'haha', color: 'text-yellow-500' },
  { emoji: '😮', name: 'wow', color: 'text-yellow-400' },
  { emoji: '😢', name: 'sad', color: 'text-blue-400' },
  { emoji: '😡', name: 'angry', color: 'text-orange-500' },
  { emoji: '👍', name: 'like', color: 'text-primary' },
  { emoji: '🔥', name: 'fire', color: 'text-orange-400' },
  { emoji: '💯', name: 'hundred', color: 'text-red-400' },
]

interface ReactionPickerProps {
  isOpen: boolean
  onReaction: (reaction: string) => void
  onClose: () => void
  selectedReaction?: string
  className?: string
}

export default function ReactionPicker({
  isOpen,
  onReaction,
  onClose,
  selectedReaction,
  className,
}: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
          className={cn(
            'absolute bottom-full mb-2 left-0 z-50',
            'bg-card/95 backdrop-blur-lg border border-border/50 rounded-full',
            'shadow-xl shadow-black/20 p-2',
            className
          )}
          onMouseLeave={onClose}
        >
          <div className="flex items-center gap-1">
            {REACTIONS.map((reaction) => (
              <motion.button
                key={reaction.name}
                className={cn(
                  'relative p-2 rounded-full transition-all',
                  selectedReaction === reaction.emoji && 'bg-primary/20',
                  'hover:bg-muted'
                )}
                whileHover={{ scale: 1.4, y: -8 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setHoveredReaction(reaction.name)}
                onHoverEnd={() => setHoveredReaction(null)}
                onClick={() => {
                  onReaction(reaction.emoji)
                  onClose()
                }}
              >
                <span className="text-2xl">{reaction.emoji}</span>

                <AnimatePresence>
                  {hoveredReaction === reaction.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 
                        bg-background/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-medium
                        border border-border/50 whitespace-nowrap capitalize"
                    >
                      {reaction.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
