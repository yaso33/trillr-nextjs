import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useState } from 'react'
import { ProfileCard } from './ProfileCard'

interface ProfileHoverCardProps {
  children: React.ReactNode
  userId: string
}

export function ProfileHoverCard({ children, userId }: ProfileHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <ProfileCard userId={userId} onClose={() => setIsOpen(false)} />
      </HoverCardContent>
    </HoverCard>
  )
}
