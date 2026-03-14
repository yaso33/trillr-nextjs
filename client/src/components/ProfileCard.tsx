import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useProfile } from '@/hooks/useProfiles'
import { supabase } from '@/lib/supabase'
import { useLocation } from 'wouter'
import { cn } from '@/lib/utils'
import OnlineStatus from './OnlineStatus'
import VerifiedBadge from './VerifiedBadge'

interface ProfileCardProps {
  userId: string
  onClose: () => void
}

export const ProfileCard = ({ userId, onClose }: ProfileCardProps) => {
  const { data: profile, isLoading, error } = useProfile(userId)
  const [, navigate] = useLocation()
  const { t, language } = useLanguage()
  const { user } = useAuth()

  const handleViewProfile = () => {
    if (profile?.username) {
      navigate(`/profile/${profile.username}`)
    }
    onClose()
  }

  const updateStatus = async (status: string) => {
    if (!user) return
    try {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', user.id)
      if (error) throw error
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (error || !profile) {
    return <div className="p-4 text-red-500">Could not load profile.</div>
  }

  const isOwnProfile = user?.id === userId
  const locale = language === 'ar' ? 'ar-EG' : 'en-US'

  return (
    <Card className="w-80 shadow-2xl shadow-black/40 bg-card backdrop-blur-xl border border-card-border rounded-2xl">
      <div className="h-20 bg-card/60 backdrop-blur-lg" />
      <CardContent className="p-4 pt-0">
        <div className="relative -mt-10 flex items-end">
          <div className="relative">
            <Avatar className={cn("h-20 w-20 border-4", profile.isPremium ? "border-primary/60 shadow-primary/40" : "border-primary/30 shadow-primary/20")}>
              <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
              <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {profile.isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-black rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/></svg>
              </div>
            )}
          </div>
          <div className="ml-2 flex items-center">
            <h3 className="text-lg font-bold">{profile.full_name || profile.username}</h3>
            {profile.is_verified && <VerifiedBadge className="ml-1 h-5 w-5" />}
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <OnlineStatus userId={profile.id} showOffline={false} />
        </div>
        {/* contact links */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={profile.email}
            >
              📧
            </a>
          )}
          {profile.twitter && (
            <a
              href={profile.twitter.startsWith('@') ? `https://twitter.com/${profile.twitter.slice(1)}` : profile.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={profile.twitter}
            >
              🐦
            </a>
          )}
          {profile.instagram && (
            <a
              href={profile.instagram.startsWith('@') ? `https://instagram.com/${profile.instagram.slice(1)}` : profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={profile.instagram}
            >
              📸
            </a>
          )}
        </div>

        {isOwnProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full mt-4">
                Set Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => updateStatus('online')}>Online</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('away')}>Away</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('busy')}>Busy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {profile.bio && (
          <p className="mt-4 text-sm text-muted-foreground" dir="auto">
            {profile.bio}
          </p>
        )}

        <div className="mt-4 flex justify-around text-center">
          <div>
            <p className="font-bold">{profile.followers_count}</p>
            <p className="text-sm text-muted-foreground">{t('followers')}</p>
          </div>
          <div>
            <p className="font-bold">{profile.following_count}</p>
            <p className="text-sm text-muted-foreground">{t('following')}</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t('joined')}:{' '}
            {new Date(profile.created_at).toLocaleDateString(locale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t border-card-border">
        <Button className="w-full bg-primary text-black hover:bg-primary/90" onClick={handleViewProfile}>
          {t('viewProfile')}
        </Button>
      </CardFooter>
    </Card>
  )
}
