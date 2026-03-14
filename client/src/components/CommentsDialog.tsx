
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import { uploadVoiceComment } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { Heart, MessageCircle, Mic, Send, Smile, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'
import EmojiPicker from './EmojiPicker'
import { ProfileHoverCard } from './ProfileHoverCard'
import UserAvatar from './UserAvatar'
import VoiceMessage from './VoiceMessage'
import VoiceRecorder from './VoiceRecorder'

interface Comment {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar?: string
    isVerified?: boolean
  }
  content: string
  timestamp: string
  isVoice?: boolean
  voiceUrl?: string
  voiceDuration?: number
  reactions?: { emoji: string; count: number }[]
}

interface CommentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  comments: Comment[]
  onAddComment?: (content: string, isVoice?: boolean, audioBlob?: Blob) => Promise<void> | void
}

export default function CommentsDialog({
  open,
  onOpenChange,
  postId,
  comments,
  onAddComment,
}: CommentsDialogProps) {
  const [newComment, setNewComment] = useState('')
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const handleSubmit = async () => {
    if (!newComment.trim() || !onAddComment) return

    try {
      await onAddComment(newComment, false)
      setNewComment('')
    } catch (error) {
      logger.error('Failed to post comment:', error)
      toast({ title: 'Error', description: 'Failed to post comment', variant: 'destructive' })
    }
  }

  const handleVoiceComment = async (audioBlob: Blob, duration: number) => {
    if (!user || !onAddComment) {
      toast({ title: 'Error', description: 'Please sign in to comment', variant: 'destructive' })
      return
    }

    try {
      // The upload can happen in the background, but the comment is added optimistically
      onAddComment(URL.createObjectURL(audioBlob), true, audioBlob)
      setShowVoiceRecorder(false)
      toast({ title: 'Voice comment added!', description: 'Your voice comment is being uploaded.' })
    } catch (error) {
      logger.error('Failed to handle voice comment:', error)
      toast({ title: 'Error', description: 'Could not process voice comment', variant: 'destructive' })
    }
  }

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev)
      newSet.has(commentId) ? newSet.delete(commentId) : newSet.add(commentId)
      return newSet
    })
    // Here you would typically call a mutation to like the comment on the backend
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/80 backdrop-blur-xl border-card-border sm:max-w-md max-h-[90vh] flex flex-col p-0 shadow-2xl shadow-black/50 rounded-2xl">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="text-lg font-bold text-foreground">Comments</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 transition-all duration-200 hover:bg-card/20 rounded-2xl p-2 -mx-2 group"
                >
                  <ProfileHoverCard userId={comment.user.id}>
                    <UserAvatar
                      userId={comment.user.id}
                      src={comment.user.avatar}
                      name={comment.user.name}
                      size="sm"
                      isVerified={comment.user.isVerified}
                    />
                  </ProfileHoverCard>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ProfileHoverCard userId={comment.user.id}>
                        <button
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                          onClick={() => setLocation(`/profile/${comment.user.username}`)}
                        >
                          {comment.user.username}
                        </button>
                      </ProfileHoverCard>
                      <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>

                    {comment.isVoice && (comment.voiceUrl || comment.content) ? (
                      <VoiceMessage
                        audioUrl={comment.voiceUrl || comment.content}
                        duration={comment.voiceDuration || 0}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <button
                        className={cn(
                          'flex items-center gap-1.5 transition-colors font-medium',
                          likedComments.has(comment.id)
                            ? 'text-primary'
                            : 'hover:text-foreground'
                        )}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart
                          className={cn(
                            'h-3.5 w-3.5',
                            likedComments.has(comment.id) && 'fill-primary'
                          )}
                          style={{
                            filter: likedComments.has(comment.id)
                              ? 'drop-shadow(0 0 5px hsl(var(--primary) / 0.7))'
                              : 'none',
                          }}
                        />
                        Like
                      </button>

                      <button
                        className="hover:text-foreground transition-colors flex items-center gap-1.5 font-medium"
                        onClick={() => {
                          setNewComment((prev) => `@${comment.user.username} ${prev}`)
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Reply
                      </button>
                    </div>

                    {comment.reactions && comment.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {comment.reactions.map((reaction, index) => (
                          <span
                            key={index}
                            className="text-xs bg-muted/50 px-1.5 py-0.5 rounded-full border border-border"
                          >
                            {reaction.emoji} {reaction.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-5xl mb-4">💬</div>
                <p className="font-semibold text-base text-foreground">No comments yet</p>
                <p className="text-sm mt-1">Be the first one to share your thoughts.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-4 py-3 border-t border-card-border bg-card/80 backdrop-blur-xl">
          {showVoiceRecorder ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Recording voice comment</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setShowVoiceRecorder(false)}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <VoiceRecorder
                onRecordingComplete={handleVoiceComment}
                onCancel={() => setShowVoiceRecorder(false)}
                maxDuration={60}
              />
            </div>
          ) : (
            <div className="flex gap-2 items-start">
              {user && (
                <UserAvatar
                  userId={user.id}
                  src={user.avatar}
                  name={user.name || ''}
                  size="sm"
                  isPremium={user.isPremium}
                  className="ring-primary/20 ring-1"
                />
              )}
              <div className="relative flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={1}
                  className="bg-transparent border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-xl resize-none pr-20 transition-all duration-300 min-h-[40px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                  <EmojiPicker
                    onSelect={(emoji) => setNewComment((prev) => prev + emoji)}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setShowVoiceRecorder(true)}
                  >
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                size="icon"
                className="h-10 w-10 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
