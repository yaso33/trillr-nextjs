import CommentsDialog from '@/components/CommentsDialog'
import ShareDialog from '@/components/ShareDialog'
import VideoCard from '@/components/VideoCard'
import { useVideos } from '@/hooks/useVideos'
import { logger } from '@/lib/logger'
import { AlertCircle, Play } from 'lucide-react'
import { useState } from 'react'

export default function Videos() {
  const { data: videos, isLoading, error } = useVideos()
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const selectedVideo = videos?.find((v) => v.id === selectedVideoId)

  const handleOpenComments = (videoId: string) => {
    setSelectedVideoId(videoId)
    setShowComments(true)
  }

  const handleOpenShare = (videoId: string) => {
    setSelectedVideoId(videoId)
    setShowShare(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4 p-2 sm:p-4">
        <div className="relative">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">Loading videos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-2 sm:p-4">
        <div className="text-center space-y-3 sm:space-y-4 max-w-xs sm:max-w-sm animate-fade-in">
          <div className="w-14 sm:w-16 h-14 sm:h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 sm:w-8 h-6 sm:h-8 text-destructive" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">Unable to load videos</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-2 sm:p-4">
        <div className="text-center space-y-3 sm:space-y-4 max-w-xs sm:max-w-sm animate-fade-in">
          <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Play className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">No videos yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Be the first to upload a video and share your story!
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            videoUrl={video.video_url}
            thumbnailUrl={video.thumbnail_url || undefined}
            creator={{
              name: video.profiles.full_name || video.profiles.username,
              username: video.profiles.username,
              avatar: video.profiles.avatar_url || undefined,
            }}
            caption={video.description || ''}
            likes={video.likes_count || 0}
            comments={video.comments_count || 0}
            isLiked={video.is_liked}
            onLike={() => logger.debug(`Video ${video.id} liked`)}
            onComment={() => handleOpenComments(video.id)}
            onShare={() => handleOpenShare(video.id)}
          />
        ))}
      </div>

      <CommentsDialog
        open={showComments}
        onOpenChange={setShowComments}
        postId={selectedVideoId || ''}
        comments={[]}
        onAddComment={async (content, isVoice) => {
          logger.debug(`Adding comment to video ${selectedVideoId}: ${content}`)
        }}
      />

      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        postId={selectedVideoId || ''}
        postType="video"
      />
    </>
  )
}
