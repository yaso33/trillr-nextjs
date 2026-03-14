import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Calendar, Diamond, Edit, MapPin, MessageCircle, Users, Video } from 'lucide-react'

// New: A dedicated badge for premium users for reusability.
const PremiumBadge = ({ className }: { className?: string }) => (
  <Diamond
    className={cn('h-5 w-5 text-cyan-400 fill-cyan-500/20', className)}
    style={{
      filter:
        'drop-shadow(0 0 6px hsl(180 100% 50% / 0.7)) drop-shadow(0 0 12px hsl(180 100% 50% / 0.4))',
    }}
  />
)

interface ProfilePageProps {
  user: {
    name: string
    username: string
    avatar?: string
    bio: string
    location: string
    joinDate: string
    followersCount: number
    followingCount: number
    videosCount: number
    isOnline: boolean
    isPremium?: boolean // Added for Premium feature
    isVerified?: boolean // Added for consistency
    email?: string
    twitter?: string
    instagram?: string
  }
  onEditProfile?: () => void
}

export default function ProfilePage({ user, onEditProfile }: ProfilePageProps) {
  // For demonstration, let's assume the user is premium.
  const isPremium = user.isPremium ?? true

  return (
    <div className="min-h-screen bg-[#101012] text-gray-50">
      {/* --- 1. The Banner --- */}
      {/* Increased height and added a subtle gradient overlay for depth. */}
      <div className="relative h-60 w-full bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-t from-[#101012] via-[#101012]/80 to-transparent" />
      </div>

      {/* --- 2. The Main Content Area --- */}
      {/* Using a negative margin to pull the content up, creating the floating effect. */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-32">
        {/* --- 2a. The Floating Info Card --- */}
        {/* This is the core of the new design. A semi-transparent, blurred card that feels like a layer of glass. */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* The Avatar with the Premium "Aura" effect */}
            <div className="relative -mt-24">
              <div
                className={cn(
                  'rounded-full',
                  isPremium &&
                    'p-1 bg-gradient-to-tr from-cyan-400 to-purple-500 animate-pulse-slow'
                )}
              >
                <Avatar
                  className={cn(
                    'h-32 w-32 border-4',
                    isPremium ? 'border-[#101012]' : 'border-gray-800'
                  )}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gray-700 text-white text-3xl">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {user.isOnline && (
                <div className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-green-500 border-4 border-[#101012]" />
              )}
            </div>

            {/* User Info & Actions */}
            <div className="flex-1 space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                    {isPremium && <PremiumBadge />}
                  </div>
                  <p className="text-gray-400">@{user.username}</p>
                </div>
                <Button
                  onClick={onEditProfile}
                  variant="outline"
                  className="bg-transparent border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 transition-all duration-300 group"
                >
                  <Edit className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Edit Profile
                </Button>
              </div>

              <p className="text-sm max-w-2xl text-gray-300">{user.bio}</p>

              {/* contact info */}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {user.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors"
                  >
                    📧 {user.email}
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={user.twitter.startsWith('@') ? `https://twitter.com/${user.twitter.slice(1)}` : user.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors"
                  >
                    🐦 {user.twitter}
                  </a>
                )}
                {user.instagram && (
                  <a
                    href={user.instagram.startsWith('@') ? `https://instagram.com/${user.instagram.slice(1)}` : user.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors"
                  >
                    📸 {user.instagram}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {user.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Joined {user.joinDate}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8 pt-6 pl-4">
            <div>
              <span className="font-semibold text-lg text-white">{user.followersCount}</span>{' '}
              <span className="text-gray-400">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-lg text-white">{user.followingCount}</span>{' '}
              <span className="text-gray-400">Following</span>
            </div>
            <div>
              <span className="font-semibold text-lg text-white">{user.videosCount}</span>{' '}
              <span className="text-gray-400">Videos</span>
            </div>
          </div>
        </div>

        {/* --- 2b. The Tabs and Content --- */}
        <div className="mt-8">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent p-0">
              {['Videos', 'Chats', 'Connections'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="data-[state=active]:bg-white/5 data-[state=active]:text-white rounded-t-md border-b-2 border-transparent data-[state=active]:border-cyan-400 pb-2.5 text-gray-400 transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="videos" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[9/16] rounded-lg bg-gray-900 border border-white/10 cursor-pointer group relative overflow-hidden hover:border-cyan-400/50 transition-all"
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white font-semibold">Video Title {i + 1}</p>
                      <p className="text-xs text-gray-300">
                        {Math.floor(Math.random() * 500 + 100)}K views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chats" className="mt-6">
              <p className="text-center text-gray-500 py-8">Recent chats will appear here.</p>
            </TabsContent>
            <TabsContent value="connections" className="mt-6">
              <p className="text-center text-gray-500 py-8">Connections will appear here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
