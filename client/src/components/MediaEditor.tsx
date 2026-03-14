import MusicBrowser from '@/components/MusicBrowser'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { ErrorLogger } from '@/lib/errorHandler'
import { type MusicTrack, musicLibraryManager } from '@/lib/musicLibrary'
import { type VideoFilter, videoFilters, videoProcessor } from '@/lib/videoProcessor'
import {
  Check,
  Library,
  Loader2,
  Music,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface MediaEditorProps {
  file: File
  mediaType: 'image' | 'video'
  onSave: (processedFile: File, selectedMusic?: MusicTrack) => void
  onCancel: () => void
}

export default function MediaEditor({ file, mediaType, onSave, onCancel }: MediaEditorProps) {
  const [selectedFilter, setSelectedFilter] = useState<VideoFilter>(videoFilters[0])
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null)
  const [musicVolume, setMusicVolume] = useState(0.7)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false)
  const [showMusicBrowser, setShowMusicBrowser] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    return () => {
      musicLibraryManager.cleanup()
    }
  }, [])

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegLoaded || loadingFFmpeg) return

    setLoadingFFmpeg(true)
    try {
      await videoProcessor.load()
      setFfmpegLoaded(true)
    } catch (error) {
      ErrorLogger.log('Failed to load FFmpeg:', error)
      toast({
        title: isRTL ? 'خطأ في تحميل معالج الفيديو' : 'Failed to load video processor',
        description: isRTL ? 'يرجى المحاولة مرة أخرى' : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoadingFFmpeg(false)
    }
  }, [ffmpegLoaded, loadingFFmpeg, toast, isRTL])

  const handleFilterSelect = (filter: VideoFilter) => {
    setSelectedFilter(filter)
  }

  const handleMusicSelect = (track: MusicTrack) => {
    setSelectedMusic(track)
    setShowMusicBrowser(false)
    musicLibraryManager.setVolume(musicVolume)
    musicLibraryManager.playTrack(track)
    setIsPlaying(true)
  }

  const handleRemoveMusic = () => {
    musicLibraryManager.stopCurrentTrack()
    setSelectedMusic(null)
    setIsPlaying(false)
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      musicLibraryManager.pauseCurrentTrack()
      if (videoRef.current) videoRef.current.pause()
    } else {
      if (selectedMusic) {
        musicLibraryManager.resumeCurrentTrack()
      }
      if (videoRef.current) videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0]
    setMusicVolume(vol)
    musicLibraryManager.setVolume(vol)
  }

  const processImageWithFilter = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.filter = selectedFilter.preview
        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          file.type || 'image/jpeg',
          0.9
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = previewUrl
    })
  }

  const handleSave = async () => {
    setIsProcessing(true)
    musicLibraryManager.stopCurrentTrack()

    try {
      let processedFile: File = file

      if (mediaType === 'image' && selectedFilter.id !== 'none') {
        const processedBlob = await processImageWithFilter()
        processedFile = new File([processedBlob], file.name, { type: file.type || 'image/jpeg' })
      } else if (mediaType === 'video' && (selectedFilter.id !== 'none' || selectedMusic)) {
        await loadFFmpeg()

        const processedBlob = await videoProcessor.processVideo(file, {
          filterId: selectedFilter.id,
          audioUrl: selectedMusic?.audioUrl,
          audioVolume: musicVolume,
          replaceAudio: false,
        })

        processedFile = new File([processedBlob], file.name, { type: 'video/mp4' })
      }

      onSave(processedFile, selectedMusic || undefined)
    } catch (error) {
      ErrorLogger.log('Error processing media:', error)
      toast({
        title: isRTL ? 'خطأ في المعالجة' : 'Processing Error',
        description: isRTL ? 'فشل في معالجة الوسائط' : 'Failed to process media',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (showMusicBrowser) {
    return (
      <MusicBrowser
        onSelect={handleMusicSelect}
        onClose={() => setShowMusicBrowser(false)}
        selectedTrack={selectedMusic}
      />
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border/50 flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 sm:h-10 sm:w-10">
          <X className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
        <h2 className="text-base sm:text-lg font-semibold">
          {isRTL ? 'تحرير الوسائط' : 'Edit Media'}
        </h2>
        <Button
          onClick={handleSave}
          disabled={isProcessing}
          className="bg-primary hover:bg-primary/90 h-8 w-8 sm:h-10 sm:w-10"
          size="icon"
        >
          {isProcessing ? (
            <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
          ) : (
            <Check className="h-4 sm:h-5 w-4 sm:w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {mediaType === 'image' ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{ filter: selectedFilter.preview }}
            />
          ) : (
            <video
              ref={videoRef}
              src={previewUrl}
              className="max-w-full max-h-full object-contain"
              style={{ filter: selectedFilter.preview }}
              loop
              playsInline
              muted={!selectedMusic}
              onClick={togglePlayPause}
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {mediaType === 'video' && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-16 w-16 text-white drop-shadow-lg" />
              ) : (
                <Play className="h-16 w-16 text-white drop-shadow-lg" />
              )}
            </button>
          )}
        </div>

        <div className="border-t border-border/50 flex-shrink-0 overflow-hidden">
          <Tabs defaultValue="filters" className="w-full h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-2 bg-muted/50 rounded-none h-10 sm:h-12 flex-shrink-0">
              <TabsTrigger
                value="filters"
                className="gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary/20"
              >
                <Wand2 className="h-3 sm:h-4 w-3 sm:w-4" />
                {isRTL ? 'فلاتر' : 'Filters'}
              </TabsTrigger>
              <TabsTrigger
                value="music"
                className="gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary/20"
              >
                <Music className="h-3 sm:h-4 w-3 sm:w-4" />
                {isRTL ? 'موسيقى' : 'Music'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="m-0 p-2 sm:p-4 overflow-y-auto flex-1">
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {videoFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterSelect(filter)}
                      className={`flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                        selectedFilter.id === filter.id
                          ? 'bg-primary/20 ring-2 ring-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div
                        className="w-16 h-16 rounded-lg overflow-hidden bg-muted"
                        style={{ filter: filter.preview }}
                      >
                        {mediaType === 'image' ? (
                          <img
                            src={previewUrl}
                            alt={filter.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video src={previewUrl} className="w-full h-full object-cover" muted />
                        )}
                      </div>
                      <span className="text-xs font-medium">
                        {isRTL ? filter.nameAr : filter.name}
                      </span>
                      {selectedFilter.id === filter.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="music" className="m-0 p-4 space-y-4">
              {selectedMusic ? (
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl">
                  <img
                    src={selectedMusic.coverUrl}
                    alt={selectedMusic.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {isRTL ? selectedMusic.titleAr : selectedMusic.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isRTL ? selectedMusic.artistAr : selectedMusic.artist}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 rounded-full bg-primary/20 hover:bg-primary/30"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <Button variant="ghost" size="icon" onClick={handleRemoveMusic}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {selectedMusic && (
                <div className="flex items-center gap-3">
                  {musicVolume === 0 ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Slider
                    value={[musicVolume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round(musicVolume * 100)}%
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-14 gap-3 rounded-xl"
                onClick={() => setShowMusicBrowser(true)}
              >
                <Library className="h-5 w-5 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {isRTL ? 'تصفح مكتبة الموسيقى' : 'Browse Music Library'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? 'رائج • أنواع • حالات مزاجية' : 'Trending • Genres • Moods'}
                  </span>
                </div>
                <Sparkles className="h-4 w-4 text-primary ml-auto" />
              </Button>

              {loadingFFmpeg && (
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'جاري تحميل معالج الفيديو...' : 'Loading video processor...'}
                  </span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
