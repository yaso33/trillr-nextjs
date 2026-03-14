import MediaEditor from '@/components/MediaEditor'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import type { MusicTrack } from '@/lib/musicLibrary'
import { supabase } from '@/lib/supabase'
import { Film, Upload, Video, Wand2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocation } from 'wouter'

export default function CreateVideo() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [processedFile, setProcessedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const { isRTL } = useLanguage()

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({
        title: isRTL ? 'نوع ملف غير صالح' : 'Invalid file type',
        description: isRTL ? 'يرجى اختيار ملف فيديو' : 'Please select a video file.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: isRTL ? 'الملف كبير جداً' : 'File too large',
        description: isRTL
          ? 'الفيديو يجب أن يكون أقل من 100 ميجابايت'
          : 'Video must be less than 100MB.',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowEditor(true)
  }

  const handleRemoveMedia = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setProcessedFile(null)
    setShowEditor(false)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleEditorSave = (file: File, selectedMusic?: MusicTrack) => {
    setProcessedFile(file)
    setShowEditor(false)
    toast({
      title: isRTL ? 'تم التعديل!' : 'Edited!',
      description: isRTL ? 'تم تطبيق التعديلات بنجاح' : 'Your edits have been applied',
    })
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
  }

  const handlePost = async () => {
    if (!title.trim()) {
      toast({
        title: isRTL ? 'العنوان مطلوب' : 'Title required',
        description: isRTL ? 'يرجى إضافة عنوان للفيديو' : 'Please add a title to your video.',
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      toast({
        title: isRTL ? 'غير مسجل الدخول' : 'Not logged in',
        description: isRTL
          ? 'يجب تسجيل الدخول لنشر فيديو'
          : 'You must be logged in to post a video.',
        variant: 'destructive',
      })
      return
    }

    const fileToUpload = processedFile || selectedFile
    if (!fileToUpload) {
      toast({
        title: isRTL ? 'لا يوجد فيديو' : 'No video',
        description: isRTL ? 'يرجى اختيار فيديو للنشر' : 'Please select a video to post.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('video', fileToUpload)

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadResult = await response.json()

      if (!response.ok) {
        throw new Error(uploadResult.error || 'Failed to upload video')
      }

      const publicUrl = uploadResult.url

      const { error: insertError } = await supabase.from('videos').insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          video_url: publicUrl,
        },
      ])

      if (insertError) throw insertError

      toast({
        title: isRTL ? 'تم النشر!' : 'Posted!',
        description: isRTL ? 'تم نشر الفيديو بنجاح' : 'Your video has been shared successfully.',
      })

      setTimeout(() => {
        setLocation('/videos')
      }, 500)
    } catch (error) {
      logger.error('Error creating video post:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في نشر الفيديو' : 'Failed to post video. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (showEditor && selectedFile) {
    return (
      <div className="h-full">
        <MediaEditor
          file={selectedFile}
          mediaType="video"
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto p-4 pb-24 md:pb-8">
          <div className="flex items-center gap-2 mb-6">
            <Film className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">{isRTL ? 'نشر فيديو' : 'Create Video'}</h1>
          </div>

          <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-border/50">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
                    {user?.email?.slice(0, 2).toUpperCase() || 'ME'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Your Account'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? 'شارك فيديو مع الفلاتر والموسيقى'
                      : 'Share a video with filters and music'}
                  </p>
                </div>
              </div>

              {previewUrl && (
                <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden animate-scale-in">
                  <button
                    onClick={handleRemoveMedia}
                    className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm rounded-full p-2 hover:bg-black/90 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <video src={previewUrl} className="w-full h-full object-cover" controls />
                  {processedFile && (
                    <div className="absolute bottom-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Wand2 className="h-3 w-3" />
                      {isRTL ? 'تم التعديل' : 'Edited'}
                    </div>
                  )}
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />

              {!previewUrl && (
                <button
                  className="w-full h-40 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium block">
                      {isRTL ? 'اختر فيديو' : 'Select Video'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isRTL ? 'حتى 100 ميجابايت' : 'Up to 100MB'}
                    </span>
                  </div>
                </button>
              )}

              {previewUrl && !processedFile && (
                <Button
                  variant="outline"
                  onClick={() => setShowEditor(true)}
                  className="w-full h-11 gap-2 rounded-xl"
                >
                  <Wand2 className="h-4 w-4" />
                  {isRTL ? 'إضافة فلاتر وموسيقى' : 'Add Filters & Music'}
                </Button>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isRTL ? 'العنوان' : 'Title'}</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isRTL ? 'أدخل عنوان الفيديو...' : 'Enter video title...'}
                    className="bg-muted/50 border-border/50 focus:border-primary rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRTL ? 'أضف وصفاً للفيديو...' : 'Add a description...'}
                    className="min-h-24 bg-muted/50 border-border/50 focus:border-primary rounded-xl resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handlePost}
                  className="flex-1 h-11 gradient-primary hover:opacity-90 rounded-xl font-semibold"
                  disabled={!previewUrl || !title.trim() || isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isRTL ? 'جاري الرفع...' : 'Uploading...'}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {isRTL ? 'نشر الفيديو' : 'Post Video'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-xl"
                  onClick={() => {
                    handleRemoveMedia()
                    setTitle('')
                    setDescription('')
                    setLocation('/')
                  }}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
