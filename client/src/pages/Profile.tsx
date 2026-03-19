
import FollowersDialog from '@/components/FollowersDialog'
import ImageLightbox from '@/components/ImageLightbox'
import OptimizedImage from '@/components/OptimizedImage'
import UserAvatar from '@/components/UserAvatar'
import VerifiedBadge from '@/components/VerifiedBadge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useGetOrCreateConversation } from '@/hooks/useMessages'
import { usePosts, useSavedPosts } from '@/hooks/usePosts'
import {
  useFollowUser,
  useIsFollowing,
  useProfile,
  useProfileByUsername,
} from '@/hooks/useProfiles'
import { useVideos } from '@/hooks/useVideos'
import type { Post } from '@shared/schema'
import { isVerifiedUser } from '@/lib/verifiedUsers'
import {
  Bookmark,
  Grid3X3,
  Heart,
  Link,
  MessageCircle,
  Play,
  Settings,
  Share2,
  Users,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation, useParams } from 'wouter'

export default function Profile() {
  const params = useParams()
  const username = params.username
  const { user } = useAuth()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const getOrCreateConversationMutation = useGetOrCreateConversation()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  const { data: profileByUsername, isLoading: loadingByUsername } = useProfileByUsername(username)
  const { data: currentUserProfile, isLoading: loadingCurrentUser } = useProfile(
    !username ? user?.id : undefined
  )

  const profile = username ? profileByUsername : currentUserProfile
  const profileLoading = username ? loadingByUsername : loadingCurrentUser
  const { data: allPostsData } = usePosts()
  const { data: savedPostsData } = useSavedPosts()
  const savedPosts: Post[] = (savedPostsData ?? []).flat().filter((p): p is Post => !!p)
  const { data: isFollowing = false } = useIsFollowing(profile?.id || '')
  const followMutation = useFollowUser()

  const isOwnProfile = !username || user?.id === profile?.id

  const allPosts = allPostsData?.pages ? allPostsData.pages.flat() : []
  const userPosts = allPosts?.filter((post) => post.user_id === profile?.id) || []
  const { data: allVideos } = useVideos()
  const userVideos = allVideos?.filter((video) => video.user_id === profile?.id) || []

  const handleFollowToggle = () => {
    if (!profile) return
    followMutation.mutate({ userId: profile.id, isFollowing })
  }

  const handleStartChat = async () => {
    if (!profile || !user) return
    try {
      await getOrCreateConversationMutation.mutateAsync(profile.id)
      setLocation('/messages')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      })
    }
  }

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${profile?.username}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied!' })
  }

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-foreground/70 animate-pulse">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return <EmptyState icon="👤" title="User not found" description="This profile may not exist." />
  }

  return (
    <div className="h-full bg-background text-foreground relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-96 bg-primary/20 blur-3xl rounded-full -z-0 opacity-50" />

      <ScrollArea className="h-full z-10">
        <div className="w-full max-w-4xl mx-auto pb-24 md:pb-8 pt-8">
          <div className="bg-card/20 backdrop-blur-lg border border-card-border rounded-3xl mx-4 p-6 sm:p-8 shadow-2xl shadow-primary/10">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <UserAvatar
                src={profile.avatar_url}
                name={profile.username || 'New User'}
                size="2xl"
                clickToView
                className="shadow-[0_0_30px_theme(colors.primary)] sm:w-40 sm:h-40 w-32 h-32"
              />
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">@{profile.username || 'new_user'}</h1>
                  {profile.username && isVerifiedUser(profile.username) && <VerifiedBadge />}
                </div>
                {profile.full_name && (
                  <p className="text-foreground/70 font-medium text-base">{profile.full_name}</p>
                )}
                {profile.bio && (
                  <p className="text-sm text-foreground/70 max-w-md mx-auto sm:mx-0 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Link className="h-3.5 w-3.5" />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
              <StatCard
                icon={Grid3X3}
                value={profile.posts_count || 0}
                label="Posts"
                onClick={() => {
                  const postsButton = document.querySelector<HTMLButtonElement>('button[value="posts"]')
                  postsButton?.click()
                }}
              />
              <StatCard
                icon={Users}
                value={profile.followers_count || 0}
                label="Followers"
                onClick={() => setShowFollowers(true)}
              />
              <StatCard
                icon={Users}
                value={profile.following_count || 0}
                label="Following"
                onClick={() => setShowFollowing(true)}
              />
            </div>

            <div className="flex flex-col xs:flex-row gap-3 mt-6">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation('/edit-profile')}
                  >
                    Edit Profile
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full xs:w-auto aspect-square xs:aspect-auto"
                      onClick={handleShareProfile}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-full xs:w-auto aspect-square xs:aspect-auto"
                      onClick={() => setLocation('/settings')}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    className={`flex-1 transition-all duration-300 ${
                      isFollowing
                        ? 'bg-white/10 text-foreground hover:bg-white/20'
                        : 'gradient-primary'
                    }`}
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleStartChat}
                    disabled={getOrCreateConversationMutation.isPending}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs defaultValue="posts" className="w-full mt-8">
            <TabsList className="w-full grid grid-cols-3 bg-transparent p-0 rounded-none border-b border-white/10">
              <TabsTrigger value="posts">
                <Grid3X3 className="h-5 w-5 mr-2" /> Posts
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-5 w-5 mr-2" /> Videos
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="saved">
                  <Bookmark className="h-5 w-5 mr-2" /> Saved
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="posts">
              <PostGrid
                posts={userPosts}
                onImageClick={setSelectedImage}
                emptyState={
                  <EmptyState
                    icon="📷"
                    title="No posts yet"
                    description={isOwnProfile ? 'Share your first post!' : 'User has no posts.'}
                  />
                }
              />
            </TabsContent>
            <TabsContent value="videos">
              {userVideos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 mt-1">
                  {userVideos.map((video) => (
                    <button
                      key={video.id}
                      className="relative aspect-[9/16] group cursor-pointer overflow-hidden rounded-lg bg-white/5 ring-primary/0 hover:ring-2 transition-all duration-300"
                      onClick={() => setLocation('/videos')}
                    >
                      <OptimizedImage
                        src={video.thumbnail_url || ''}
                        alt={video.title || 'Video'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-card/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <div className="flex items-center gap-1.5 text-foreground text-xs font-medium">
                          <Play className="h-3 w-3" fill="white" />
                          <span>{formatCount(video.views_count || 0)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🎬" title="No videos" description="This user has no videos." />
              )}
            </TabsContent>
            <TabsContent value="saved">
              <PostGrid
                posts={savedPosts}
                onImageClick={setSelectedImage}
                emptyState={<EmptyState icon="🔖" title="No saved posts" description="Your saved posts appear here."/>}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {selectedImage && (
        <ImageLightbox
          src={selectedImage}
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <FollowersDialog
        open={showFollowers}
        onOpenChange={setShowFollowers}
        userId={profile.id}
        type="followers"
      />
      <FollowersDialog
        open={showFollowing}
        onOpenChange={setShowFollowing}
        userId={profile.id}
        type="following"
      />
    </div>
  )
}

// Helper Components

const StatCard = ({ icon: Icon, value, label, onClick }: {
  icon: React.ElementType
  value: number
  label: string
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className="bg-card/10 backdrop-blur-sm border border-card-border rounded-xl p-3 sm:p-4 text-center hover:bg-card/20 transition-colors duration-300 space-y-1"
  >
    <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary" strokeWidth={1.5} />
    <p className="text-base sm:text-xl font-bold tracking-tighter">{formatCount(value)}</p>
    <p className="text-xs sm:text-sm text-foreground/50 font-medium">{label}</p>
  </button>
)

const PostGrid = ({ posts, onImageClick, emptyState }: {
  posts: Post[]
  onImageClick: (src: string) => void
  emptyState: React.ReactNode
}) => {
  if (posts.length === 0) return emptyState

  return (
    <div className="grid grid-cols-3 gap-1 mt-1">
      {posts.map((post) => (
        <button
          key={post.id}
          className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-card/10 ring-primary/0 hover:ring-2 transition-all duration-300"
          onClick={() => post.image_url && onImageClick(post.image_url)}
        >
          <OptimizedImage
            src={post.image_url || ''}
            alt={post.content || 'Post'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 text-foreground text-sm font-medium">
              <Heart className="h-4 w-4" fill="currentColor" />
              <span>{formatCount(post.likes_count || 0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground text-sm font-medium">
              <MessageCircle className="h-4 w-4" fill="currentColor" />
              <span>{formatCount(post.comments_count || 0)}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

const EmptyState = ({ icon, title, description }: {
  icon: string
  title: string
  description: string
}) => (
  <div className="flex items-center justify-center py-20 px-4">
    <div className="text-center space-y-3 max-w-xs animate-fade-in">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      <p className="text-sm text-foreground/70">{description}</p>
    </div>
  </div>
)

const formatCount = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}
