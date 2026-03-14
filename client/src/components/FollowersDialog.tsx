import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { useFollowUser, useFollowers, useFollowing, useIsFollowing } from '@/hooks/useProfiles'
import { useLocation } from 'wouter'
import UserAvatar from './UserAvatar'

interface FollowersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  type: 'followers' | 'following'
  title?: string
}

interface UserItemProps {
  user: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  onClose: () => void
}

function UserItem({ user, onClose }: UserItemProps) {
  const [, setLocation] = useLocation()
  const { user: currentUser } = useAuth()
  const { data: isFollowing = false } = useIsFollowing(user.id)
  const followMutation = useFollowUser()

  const isOwnProfile = currentUser?.id === user.id

  const handleProfileClick = () => {
    setLocation(`/profile/${user.username}`)
    onClose()
  }

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    followMutation.mutate({ userId: user.id, isFollowing })
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-card/50 hover:bg-card/70 rounded-2xl transition-colors">
      <button onClick={handleProfileClick} className="flex items-center gap-3 flex-1">
        <UserAvatar src={user.avatar_url} name={user.username} size="md" />
        <div className="text-left">
          <p className="font-medium text-sm">{user.full_name || user.username}</p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </button>

      {!isOwnProfile && (
        <Button
          size="sm"
          variant={isFollowing ? 'outline' : 'default'}
          className="rounded-full text-xs h-8"
          onClick={handleFollowToggle}
          disabled={followMutation.isPending}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  )
}

export default function FollowersDialog({
  open,
  onOpenChange,
  userId,
  type,
  title,
}: FollowersDialogProps) {
  const { data: followers = [], isLoading: loadingFollowers } = useFollowers(
    type === 'followers' ? userId : undefined
  )
  const { data: following = [], isLoading: loadingFollowing } = useFollowing(
    type === 'following' ? userId : undefined
  )

  const users = type === 'followers' ? followers : following
  const isLoading = type === 'followers' ? loadingFollowers : loadingFollowing
  const dialogTitle = title || (type === 'followers' ? 'Followers' : 'Following')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 bg-card/80 backdrop-blur-xl border-card-border rounded-2xl">
        <DialogHeader className="px-4 py-3 border-b border-card-border">
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : users.length > 0 ? (
              users.map((user: any) => (
                <UserItem key={user.id} user={user} onClose={() => onOpenChange(false)} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-3">👥</div>
                <p className="font-medium">
                  {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
