import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProfileHoverCard } from './ProfileHoverCard'
import React from 'react'

interface ChatListItemProps {
  id: string
  userId: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  isOnline?: boolean
  isActive?: boolean
  onClick?: () => void
}

export default function ChatListItem({
  userId,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  isActive = false,
  onClick,
}: ChatListItemProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }
  const content = (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-testid={`chat-item-${name.toLowerCase().replace(/\s/g, '-')}`}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200',
        'hover-elevate active-elevate-2',
        isActive && 'bg-sidebar-accent'
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary/20 text-primary neon-text">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-status-online border-2 border-sidebar neon-glow" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>

      {unreadCount > 0 && (
        <Badge
          variant="default"
          className="h-5 min-w-5 px-1.5 text-xs neon-glow"
          data-testid={`badge-unread-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          {unreadCount}
        </Badge>
      )}
    </div>
  )

  return <ProfileHoverCard userId={userId}>{content}</ProfileHoverCard>
}
