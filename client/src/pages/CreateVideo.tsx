import MediaEditor from '@/components/MediaEditor'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useCreateVideo } from '@/hooks/useVideos' // <-- 1. Import the correct hook
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
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const { user } = useAuth()

  // 2. Instantiate the mutation hook
  const createVideoMutation = useCreateVideo()

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({ title: 'Invalid file type', description: 'Please select a video file.', variant: 'destructive' })
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({ title: 'File too large', description: 'Video must be less than 100MB.', variant: 'destructive' })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowEditor(false) // Reset editor state when a new file is chosen
    setProcessedFile(null)
  }

  const handleRemoveMedia = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setProcessedFile(null)
    setShowEditor(false)
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleEditorSave = (file: File) => {
    setProcessedFile(file)
    setShowEditor(false)
    toast({ title: 'Edited!', description: 'Your edits have been applied' })
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
  }

  const handlePost = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please add a title to your video.', variant: 'destructive' })
      return
    }

    const fileToUpload = processedFile || selectedFile
    if (!fileToUpload || !user) {
      toast({ title: 'Cannot post', description: 'A user and video file are required.', variant: 'destructive' })
      return
    }

    // 3. Use the mutation to handle everything
    createVideoMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        videoFile: fileToUpload,
      },
      {
        onSuccess: () => {
          toast({ title: 'Posted!', description: 'Your video has been shared successfully.' })
          setTimeout(() => setLocation('/videos'), 500)
        },
        onError: (error) => {
          toast({ title: 'Error', description: error.message || 'Failed to post video.', variant: 'destructive' })
        },
      }
    )
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
            <h1 className="text-2xl font-bold">Create Video</h1>
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
                  <p className="text-sm text-muted-foreground">Share a video with the world</p>
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
                      Edited
                    </div>
                  )}
                </div>
              )}

              {!previewUrl && (
                <button
                  className="w-full h-40 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium block">Select Video</span>
                    <span className="text-xs text-muted-foreground">Up to 100MB</span>
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
                  Add Filters & Music
                </Button>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title..."
                    className="bg-muted/50 border-border/50 focus:border-primary rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-24 bg-muted/50 border-border/50 focus:border-primary rounded-xl resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handlePost}
                  className="flex-1 h-11 gradient-primary hover:opacity-90 rounded-xl font-semibold"
                  disabled={!previewUrl || !title.trim() || createVideoMutation.isPending}
                >
                  {createVideoMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Post Video
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
                  disabled={createVideoMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
