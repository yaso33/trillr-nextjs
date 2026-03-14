import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { useUpdatePost } from '@/hooks/usePosts'
import { logger } from '@/lib/logger'
import { X } from 'lucide-react'
import { useRef, useState } from 'react'

interface EditPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  initialContent?: string
  initialImage?: string | null
  /** Optional override used in tests/harness to bypass network and perform save locally */
  onSaveOverride?: (postId: string, content?: string, image_url?: string | null) => Promise<void>
}

export default function EditPostDialog({
  open,
  onOpenChange,
  postId,
  initialContent = '',
  initialImage = null,
  onSaveOverride,
}: EditPostDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const updatePost = useUpdatePost()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Optimistic preview
    setImageUrl(URL.createObjectURL(file))
    // For now we don't upload here; assume the app provides upload elsewhere.
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    try {
      setIsUploading(true)
      if (onSaveOverride) {
        await onSaveOverride(postId, content, imageUrl)
      } else {
        await updatePost.mutateAsync({ postId, content, image_url: imageUrl })
      }
      onOpenChange(false)
    } catch (error) {
      logger.error('Error updating post:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-md sm:w-auto sm:rounded-lg border-primary/30 neon-glow p-0 sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/20 relative">
          <DialogTitle className="neon-text">{isRTL ? 'تعديل المنشور' : 'Edit Post'}</DialogTitle>
          <DialogDescription className="text-xs mt-1">
            {isRTL ? 'قم بتحديث المحتوى أو الصورة' : 'Update the content or image of your post'}
          </DialogDescription>
          <button
            aria-label={isRTL ? 'إغلاق' : 'Close'}
            className="absolute top-3 right-3 p-1 rounded hover-elevate"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="p-4 space-y-3 overflow-auto">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isRTL ? 'اكتب شيئاً رائعاً...' : 'Write something amazing...'}
          />

          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden">
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover-elevate"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <img
                loading="eager"
                src={imageUrl}
                alt="preview"
                className="w-full h-48 object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                ref={fileRef as any}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={isUploading || updatePost.isPending}
            >
              {updatePost.isPending || isUploading
                ? isRTL
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : isRTL
                  ? 'حفظ'
                  : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
