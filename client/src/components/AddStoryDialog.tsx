import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { useCreateStory } from '@/hooks/useStories'
import { logger } from '@/lib/logger'
import type { MusicTrack } from '@/lib/musicLibrary'
import { Image, Video, Wand2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import MediaEditor from './MediaEditor'

interface AddStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddStoryDialog({ open, onOpenChange }: AddStoryDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const createStoryMutation = useCreateStory()
  const { isRTL } = useLanguage()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB.',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setMediaType('image')
    setPreviewUrl(URL.createObjectURL(file))
    setShowEditor(true)
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Video must be less than 50MB.',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setMediaType('video')
    setPreviewUrl(URL.createObjectURL(file))
    setShowEditor(true)
  }

  const handleRemoveMedia = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setMediaType(null)
    setShowEditor(false)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleEditorSave = async (processedFile: File, selectedMusic?: MusicTrack) => {
    if (!mediaType || !user) return

    try {
      await createStoryMutation.mutateAsync({
        file: processedFile,
        mediaType,
      })
      handleRemoveMedia()
      onOpenChange(false)
      toast({
        title: isRTL ? 'تم نشر الستوري!' : 'Story shared!',
        description: isRTL ? 'تم مشاركة قصتك بنجاح' : 'Your story has been shared successfully',
      })
    } catch (error) {
      logger.error('Error creating story:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في نشر الستوري' : 'Failed to share story',
        variant: 'destructive',
      })
    }
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
  }

  if (showEditor && selectedFile && mediaType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-lg sm:h-[90vh] border-primary/30 neon-glow p-0 rounded-none sm:rounded-lg overflow-hidden">
          <DialogTitle className="sr-only">{isRTL ? 'محرر الوسائط' : 'Media Editor'}</DialogTitle>
          <MediaEditor
            file={selectedFile}
            mediaType={mediaType}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none sm:w-auto sm:h-auto sm:max-w-md sm:max-h-[90vh] border-primary/30 neon-glow p-0 sm:p-0 rounded-none sm:rounded-lg flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-3 sm:p-4 border-b border-border/20">
          <DialogTitle className="neon-text flex items-center gap-2 text-lg sm:text-xl">
            <Wand2 className="h-4 sm:h-5 w-4 sm:w-5" />
            {isRTL ? 'إضافة ستوري' : 'Add Story'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm mt-1">
            {isRTL
              ? 'شارك صورة أو فيديو مع فلاتر وموسيقى'
              : 'Share a photo or video with filters and music'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {previewUrl ? (
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 z-10 bg-black/80 rounded-full p-1.5 hover-elevate"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2} />
              </button>
              {mediaType === 'image' ? (
                <img
                  src={previewUrl}
                  loading="eager"
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  preload="metadata"
                  className="max-w-full max-h-full object-contain"
                  controls
                >
                  <track kind="captions" />
                </video>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-xs">
                <Button
                  variant="outline"
                  className="h-24 sm:h-28 flex flex-col gap-1.5 sm:gap-2 neon-glow hover-elevate text-xs sm:text-sm"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Image className="h-6 sm:h-7 w-6 sm:w-7 text-primary" strokeWidth={2} />
                  <span>{isRTL ? 'صورة' : 'Photo'}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 sm:h-28 flex flex-col gap-1.5 sm:gap-2 neon-glow hover-elevate text-xs sm:text-sm"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="h-6 sm:h-7 w-6 sm:w-7 text-primary" strokeWidth={2} />
                  <span>{isRTL ? 'فيديو' : 'Video'}</span>
                </Button>
              </div>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />

          {previewUrl && (
            <div className="flex gap-2 flex-shrink-0 p-3 sm:p-4 border-t border-border/20">
              <Button
                onClick={() => setShowEditor(true)}
                className="flex-1 h-10 sm:h-10 neon-glow-strong hover-elevate gap-2 text-sm"
                disabled={createStoryMutation.isPending}
              >
                <Wand2 className="h-4 w-4" />
                {isRTL ? 'تعديل ونشر' : 'Edit & Share'}
              </Button>
              <Button
                variant="outline"
                className="h-10 sm:h-10 text-sm"
                onClick={() => {
                  handleRemoveMedia()
                  onOpenChange(false)
                }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
