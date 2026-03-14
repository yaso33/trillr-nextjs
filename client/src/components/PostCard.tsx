
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useAddComment, useComments } from '@/hooks/useComments'
import { useLikePost, useSavePost } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import CommentsDialog from './CommentsDialog'
import DoubleTapLike from './DoubleTapLike'
import EditPostDialog from './EditPostDialog'
import OptimizedImage from './OptimizedImage'
import PostOptionsMenu from './PostOptionsMenu'
import { ProfileHoverCard } from './ProfileHoverCard'
import ShareDialog from './ShareDialog'
import UserAvatar from './UserAvatar'
import VerifiedBadge from './VerifiedBadge'

interface PostCardProps {
  id: string
  userId: string
  user: {
    name: string
    username: string
    avatar?: string
    isVerified?: boolean
    isPremium?: boolean
  }
  image?: string
  caption: string
  likes: number
  comments: number
  timestamp: string
  isLiked?: boolean
  isSaved?: boolean
}

export default function PostCard({
  id,
  userId,
  user,
  image,
  caption,
  likes: initialLikes,
  comments: initialComments,
  timestamp,
  isLiked = false,
  isSaved = false,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likes, setLikes] = useState(initialLikes)
  const [commentsCount, setCommentsCount] = useState(initialComments)

  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const likePostMutation = useLikePost()
  const savePostMutation = useSavePost()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const { data: commentsData = [] } = useComments(id)
  const addCommentMutation = useAddComment()

  useEffect(() => {
    setLiked(isLiked)
    setSaved(isSaved)
    setLikes(initialLikes)
    setCommentsCount(initialComments)
  }, [isLiked, isSaved, initialLikes, initialComments])

  const handleLike = useCallback(async () => {
    if (!currentUser || isLiking) return
    setIsLiking(true)
    const newLiked = !liked
    setLiked(newLiked)
    setLikes((p) => p + (newLiked ? 1 : -1))
    try {
      await likePostMutation.mutateAsync({ postId: id, isLiked: !newLiked })
    } catch (error) {
      setLiked(!newLiked)
      setLikes((p) => p - (newLiked ? 1 : -1))
      toast({ title: 'Error', description: 'Failed to update like', variant: 'destructive' })
    } finally {
      setIsLiking(false)
    }
  }, [currentUser, isLiking, liked, id, likePostMutation, toast])

  const handleDoubleTapLike = useCallback(() => {
    if (!liked) handleLike()
  }, [liked, handleLike])

  const handleSave = async () => {
    if (!currentUser || isSaving) return
    setIsSaving(true)
    const newSaved = !saved
    setSaved(newSaved)
    try {
      await savePostMutation.mutateAsync({ postId: id, isSaved: !newSaved })
      toast({ title: newSaved ? 'Post Saved' : 'Post Unsaved' })
    } catch (error) {
      setSaved(!newSaved)
      toast({ title: 'Error', description: 'Failed to save post', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComment = async (content: string) => {
    if (!currentUser) return
    await addCommentMutation.mutateAsync({ postId: id, content })
    setCommentsCount((p) => p + 1)
  }

  return (
    <motion.article
      className="bg-black/30 backdrop-blur-2xl border border-cyan-500/10 rounded-3xl w-full mb-8 shadow-2xl shadow-cyan-500/10 overflow-hidden"
      initial={{ opacity: 0, y: 50, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
    >
      <header className="px-5 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar userId={userId} src={user.avatar} name={user.name} size="md" />
          <div className="text-left">
            <ProfileHoverCard userId={userId}>
              <div className="flex items-center gap-1.5 cursor-pointer">
                <h3 className="font-semibold text-sm text-white hover:text-primary transition-colors">
                  {user.username}
                </h3>
                {user.isVerified && <VerifiedBadge size="sm" />}
              </div>
            </ProfileHoverCard>
            <p className="text-xs text-white/60">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
        <PostOptionsMenu
          postId={id}
          imageUrl={image}
          isOwnPost={currentUser?.id === userId}
          onEdit={() => setEditOpen(true)}
        />
      </header>

      {caption && <p className="px-5 pt-3 pb-1 text-white/90 leading-relaxed text-sm">{caption}</p>}

      {image && (
        <DoubleTapLike onDoubleTap={handleDoubleTapLike} disabled={!currentUser}>
          <div className="relative w-full aspect-[4/5] mt-3">
            <OptimizedImage
              src={image}
              alt={caption}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </DoubleTapLike>
      )}

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <ActionButton
              icon={Heart}
              label={likes.toLocaleString()}
              isActive={liked}
              onClick={handleLike}
              activeClass="text-primary fill-primary"
              style={liked ? { filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.8))' } : {}}
            />
            <ActionButton
              icon={MessageCircle}
              label={commentsCount.toLocaleString()}
              onClick={() => setCommentsDialogOpen(true)}
            />
            <ActionButton icon={Send} onClick={() => setShareDialogOpen(true)} />
          </div>
          <ActionButton
            icon={Bookmark}
            isActive={saved}
            onClick={handleSave}
            activeClass="text-primary fill-primary"
          />
        </div>

        {commentsCount > 0 && (
          <button
            className="text-sm text-white/50 hover:text-white transition-colors mt-3"
            onClick={() => setCommentsDialogOpen(true)}
          >
            View all {commentsCount} comments
          </button>
        )}
      </div>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} postId={id} />
      <CommentsDialog
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        postId={id}
        comments={commentsData.map((c) => ({ ...c, user: { ...c.user } }))}
        onAddComment={handleAddComment}
      />
      <EditPostDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        postId={id}
        initialContent={caption}
        initialImage={image}
      />
    </motion.article>
  )
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  isActive,
  activeClass,
  style,
}: {
  icon: React.ElementType
  label?: string
  onClick: () => void
  isActive?: boolean
  activeClass?: string
  style?: React.CSSProperties
}) => (
  <motion.button
    onClick={onClick}
    className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
    whileTap={{ scale: 0.9 }}
  >
    <Icon
      className={cn('h-6 w-6 transition-all', isActive && activeClass)}
      style={style}
      strokeWidth={2}
    />
    {label && <span className={cn('text-sm font-medium', isActive && 'text-white')}>{label}</span>}
  </motion.button>
)
