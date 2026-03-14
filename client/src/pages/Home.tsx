
import { LoadingState } from '@/components/LoadingState'
import PostCard from '@/components/PostCard'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { usePosts } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'wouter'

function HomeFeed() {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePosts()

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error: Could not load the feed. Check connection.
      </div>
    )
  }

  const posts = data?.pages.flat() ?? []

  return (
    <div className="w-full max-w-lg mx-auto md:py-8">
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            userId={post.user_id}
            user={{
              name: post.profiles.full_name || post.profiles.username,
              username: post.profiles.username,
              avatar: post.profiles.avatar_url,
              isVerified: post.profiles.is_verified,
            }}
            image={post.image_url}
            caption={post.content}
            likes={post.likes_count || 0}
            comments={post.comments_count || 0}
            timestamp={post.created_at}
            isLiked={post.is_liked}
            isSaved={post.is_saved}
          />
        ))}
      </div>

      {posts.length === 0 && !isLoading && (
        <div className="text-center py-24 px-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="text-5xl">🧐</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Your Feed is Quiet</h2>
          <p className="text-white/60 mt-2 mb-6 max-w-sm mx-auto">
            It looks like you're not following anyone yet. Start by finding people to follow.
          </p>
          <Link href="/search">
            <Button variant="outline">Find People & Communities</Button>
          </Link>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center py-10">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="ghost">
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </Button>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-white/50 py-10 font-medium">You've reached the end of the line.</p>
      )}
    </div>
  )
}

function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full text-center p-8 text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-background -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.15)_0,_transparent_40%)] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Logo className="w-28 h-28 mx-auto mb-4 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
          Welcome to Trillr
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 text-white/60">
          A new era of social connection. Share your moments, discover digital worlds, and connect.
        </p>
        <Link href="/auth">
          <Button size="lg" className="group">
            Join the Network
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

function Home() {
  const { user, loading } = useAuth()

  return (
    <div className={cn('h-full', 'bg-background')}>
      <Helmet>
        <title>Home - Trillr</title>
      </Helmet>
      {loading ? <LoadingState /> : user ? <HomeFeed /> : <LandingPage />}
    </div>
  )
}

export default Home
