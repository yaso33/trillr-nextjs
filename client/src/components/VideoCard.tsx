import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLikeVideo } from '@/hooks/useVideos'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { isVerifiedUser } from '@/lib/verifiedUsers'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Repeat,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import VerifiedBadge from './VerifiedBadge'

interface VideoCardProps {
  id: string
  videoUrl?: string
  thumbnailUrl?: string
  creator: {
    name: string
    avatar?: string
    username: string
  }
  caption: string
  likes: number
  comments: number
  isLiked?: boolean
  musicName?: string
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}

export default function VideoCard({
  id,
  videoUrl,
  thumbnailUrl,
  creator,
  caption,
  likes: initialLikes,
  comments,
  isLiked = false,
  musicName,
  onLike,
  onComment,
  onShare,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Start muted by default
  const [localLiked, setLocalLiked] = useState(isLiked)
  const [localLikes, setLocalLikes] = useState(initialLikes)
  const [isLiking, setIsLiking] = useState(false)
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<number>(0)
  const likeVideoMutation = useLikeVideo()
  const [, setLocation] = useLocation()

  useEffect(() => {
    setLocalLiked(isLiked)
  }, [isLiked])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            video.play().catch(() => {})
            setIsPlaying(true)
          } else {
            video.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: [0.7] }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [videoUrl])

  const handleDoubleTap = useCallback(() => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!localLiked) {
        handleLike()
      }
      setShowDoubleTapHeart(true)
      setTimeout(() => setShowDoubleTapHeart(false), 1000)
    }
    lastTapRef.current = now
  }, [localLiked])

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const previousLiked = localLiked
    const previousLikes = localLikes

    setLocalLiked(!previousLiked)
    setLocalLikes(previousLiked ? previousLikes - 1 : previousLikes + 1)

    try {
      await likeVideoMutation.mutateAsync({ videoId: id, isLiked: previousLiked })
      onLike?.()
    } catch (error) {
      setLocalLiked(previousLiked)
      setLocalLikes(previousLikes)
    } finally {
      setIsLiking(false)
    }
  }

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(currentProgress)
    }
  }

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center bg-black snap-start snap-always"
      data-testid={`video-card-${creator.username}`}
    >
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={() => {
          handleDoubleTap()
          handleVideoClick()
        }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
            autoPlay
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            loading="lazy"
            alt={caption}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-background">
            <div className="text-center space-y-2 sm:space-y-4 px-4">
              <div className="text-6xl">🎬</div>
              <p className="text-base text-muted-foreground">Video Preview</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        <AnimatePresence>
          {showDoubleTapHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart
                className="h-24 w-24 text-primary/90 fill-primary/90"
                style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="rounded-full bg-card/50 p-6 backdrop-blur-xl border border-card-border">
                <Play className="h-12 w-12 text-foreground fill-foreground" strokeWidth={1.5} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-input/80">
          <motion.div
            className="h-full bg-primary shadow-lg shadow-primary/40"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={toggleMute}
          className="absolute top-5 right-4 p-2 rounded-full bg-card/50 border border-card-border backdrop-blur-xl hover:bg-card/70 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-foreground" />
          ) : (
            <Volume2 className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 sm:p-6 sm:pb-24 text-foreground">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-3"
                onClick={(e) => {
                  e.stopPropagation()
                  setLocation(`/profile/${creator.username}`)
                }}
              >
                <Avatar className="h-12 w-12 border-2 border-primary/80">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className="bg-primary/80 text-primary-foreground">
                    {creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base hover:underline">{creator.name}</h3>
                    {isVerifiedUser(creator.username) && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-sm text-muted-foreground">@{creator.username}</p>
                </div>
              </button>
            </div>
            <p className="text-sm leading-relaxed line-clamp-2 text-foreground/90">{caption}</p>

            {musicName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-card/70 flex items-center justify-center animate-spin-slow">
                  <Music2 className="h-3 w-3" />
                </div>
                <span className="text-xs truncate">{musicName}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                handleLike()
              }}
              className="flex flex-col items-center gap-1 group"
              data-testid="button-like-video"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={cn(
                  'rounded-full p-3 transition-all flex-shrink-0 backdrop-blur-xl border',
                  localLiked
                    ? 'bg-primary/80 border-primary/90'
                    : 'bg-card/50 border-card-border group-hover:bg-card/70'
                )}
                animate={localLiked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={cn(
                    'h-6 w-6 text-foreground transition-all',
                    localLiked && 'fill-current text-primary-foreground'
                  )}
                  style={{
                    filter: localLiked
                      ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.8))'
                      : 'none',
                  }}
                  strokeWidth={2}
                />
              </motion.div>
              <span className="text-xs font-semibold">{formatCount(localLikes)}</span>
            </motion.button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onComment?.()
                logger.debug('Comment clicked')
              }}
              className="flex flex-col items-center gap-1 group"
              data-testid="button-comment-video"
            >
              <div className="rounded-full bg-card/50 border-card-border p-3 backdrop-blur-xl transition-colors group-hover:bg-card/70">
                <MessageCircle className="h-6 w-6 text-foreground" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold">{formatCount(comments)}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                logger.debug('Remix clicked')
              }}
              className="flex flex-col items-center gap-1 group"
              data-testid="button-remix-video"
            >
              <div className="rounded-full bg-card/50 border-card-border p-3 backdrop-blur-xl transition-colors group-hover:bg-card/70">
                <Repeat className="h-6 w-6 text-foreground" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold">Remix</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onShare?.()
                logger.debug('Share clicked')
              }}
              className="flex flex-col items-center gap-1 group"
              data-testid="button-share-video"
            >
              <div className="rounded-full bg-card/50 border-card-border p-3 backdrop-blur-xl transition-colors group-hover:bg-card/70">
                <Share2 className="h-6 w-6 text-foreground" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
