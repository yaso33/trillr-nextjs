import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { tables } from '@shared/database.types'
import { Link } from 'react-router-dom'
import { UserAvatar } from './UserAvatar'
import { Button } from './ui/button'

interface UserProfileCardProps {
  user: tables<'profiles'>
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <UserAvatar user={user} size="lg" />
          <div className="flex flex-col">
            <span className="font-bold text-lg">{user.full_name}</span>
            <span className="text-sm text-gray-500">@{user.username}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{user.bio || 'لا يوجد نبذة تعريفية.'}</p>
        <Button asChild className="w-full">
          <Link to={`/profile/${user.username}`}>عرض الملف الشخصي</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
