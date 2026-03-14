import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ErrorLogger } from '@/lib/errorHandler'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  created_at: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface StoryViewerProps {
  stories: Story[]
  initialIndex: number
  onClose: () => void
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)

  const currentStory = stories[currentIndex]
  const isFirstStory = currentIndex === 0
  const isLastStory = currentIndex === stories.length - 1

  useEffect(() => {
    setProgress(0)
    const duration = currentStory.media_type === 'video' ? 15000 : 5000
    const interval = 50
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isLastStory) {
            setCurrentIndex((i) => i + 1)
          } else {
            onClose()
          }
          return 0
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [currentIndex, currentStory.media_type, isLastStory, onClose])

  const goToNext = () => {
    if (!isLastStory) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const goToPrevious = () => {
    if (!isFirstStory) {
      setCurrentIndex((i) => i - 1)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md h-screen sm:h-[90vh] max-h-screen sm:max-h-[90vh] p-0 bg-black border-none rounded-none sm:rounded-lg">
        <VisuallyHidden>
          <DialogTitle>Story by {currentStory.profiles.username}</DialogTitle>
        </VisuallyHidden>
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: `${index < currentIndex ? 100 : index === currentIndex ? progress : 0}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-2 sm:top-4 left-0 right-0 z-50 flex items-center justify-between px-2 sm:px-4 pt-4 sm:pt-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage
                src={currentStory.profiles.avatar_url || undefined}
                alt={currentStory.profiles.username}
              />
              <AvatarFallback className="bg-primary text-white">
                {currentStory.profiles.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="font-semibold text-sm">{currentStory.profiles.username}</p>
              <p className="text-xs opacity-80">
                {(() => {
                  try {
                    const d = new Date(currentStory.created_at)
                    if (!currentStory.created_at || Number.isNaN(d.getTime()))
                      return 'تاريخ غير معروف'
                    return formatDistanceToNow(d, { addSuffix: true })
                  } catch {
                    return 'تاريخ غير معروف'
                  }
                })()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </Button>
        </div>

        {/* Story content */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-auto">
          {currentStory.media_type === 'image' ? (
            <img
              src={currentStory.media_url}
              loading="eager"
              alt="Story"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                ErrorLogger.log('Failed to load story image:', currentStory.media_url)
                e.currentTarget.src =
                  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 600%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22600%22/%3E%3Ctext x=%22200%22 y=%22300%22 fill=%22%23999%22 text-anchor=%22middle%22 font-size=%2220%22%3EImage not available%3C/text%3E%3C/svg%3E'
              }}
            />
          ) : (
            <video
              src={currentStory.media_url}
              preload="metadata"
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              playsInline
              onError={(e) =>
                ErrorLogger.log('Failed to load story video:', currentStory.media_url)
              }
            />
          )}

          {/* Navigation areas */}
          <div className="absolute inset-0 flex">
            <button
              className="flex-1 cursor-pointer"
              onClick={goToPrevious}
              disabled={isFirstStory}
            />
            <button className="flex-1 cursor-pointer" onClick={goToNext} disabled={isLastStory} />
          </div>

          {/* Navigation buttons */}
          {!isFirstStory && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 p-0"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 sm:h-8 w-6 sm:w-8" strokeWidth={2} />
            </Button>
          )}
          {!isLastStory && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 p-0"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 sm:h-8 w-6 sm:w-8" strokeWidth={2} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
