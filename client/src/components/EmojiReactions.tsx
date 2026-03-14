import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { SmilePlus } from 'lucide-react'
import { useState } from 'react'

interface EmojiReactionsProps {
  reactions?: { emoji: string; count: number; hasReacted: boolean }[]
  onReact: (emoji: string) => void
  compact?: boolean
}

const defaultEmojis = ['❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯']

export default function EmojiReactions({
  reactions = [],
  onReact,
  compact = false,
}: EmojiReactionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReact = (emoji: string) => {
    onReact(emoji)
    setIsOpen(false)
  }

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', compact && 'gap-1')}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReact(reaction.emoji)}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all',
            reaction.hasReacted
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted/50 hover:bg-muted border border-transparent'
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs font-medium">{reaction.count}</span>
        </button>
      ))}

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center justify-center rounded-full transition-all hover:bg-muted/80',
              compact ? 'h-7 w-7' : 'h-8 w-8',
              'bg-muted/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <SmilePlus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-auto p-2 bg-card/95 backdrop-blur-xl border-border/50 min-w-0"
          side="top"
          align="start"
        >
          <div className="flex gap-1">
            {defaultEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="p-1.5 text-xl hover:bg-muted rounded-lg transition-all hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
