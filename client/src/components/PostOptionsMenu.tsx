import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useDeletePost } from '@/hooks/usePosts'
import { logger } from '@/lib/logger'
import { Bookmark, Edit, Flag, Link, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface PostOptionsMenuProps {
  postId: string
  imageUrl?: string | null
  isOwnPost?: boolean
  onEdit?: () => void
  onReport?: () => void
}

export default function PostOptionsMenu({
  postId,
  imageUrl,
  isOwnPost = false,
  onEdit,
  onReport,
}: PostOptionsMenuProps) {
  const { toast } = useToast()
  const deletePostMutation = useDeletePost()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const copyLink = () => {
    const url = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copied!',
      description: 'Post link has been copied to clipboard.',
    })
  }

  const handleReport = () => {
    if (onReport) {
      onReport()
    } else {
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync({ postId, imageUrl })
      setShowDeleteDialog(false)
    } catch (error) {
      logger.error('Error deleting post:', error)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      toast({
        title: 'Edit post',
        description: 'Post editing feature coming soon!',
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="text-xs hover-elevate">
            •••
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-primary/30 neon-glow">
          {isOwnPost && (
            <>
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" strokeWidth={2} />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" strokeWidth={2} />
                Delete post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
            <Link className="h-4 w-4 mr-2" strokeWidth={2} />
            Copy link to post
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Bookmark className="h-4 w-4 mr-2" strokeWidth={2} />
            Add to collection
          </DropdownMenuItem>

          {!isOwnPost && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleReport}
                className="cursor-pointer text-yellow-600 focus:text-yellow-600"
              >
                <Flag className="h-4 w-4 mr-2" strokeWidth={2} />
                Report post
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-primary/30 neon-glow">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
