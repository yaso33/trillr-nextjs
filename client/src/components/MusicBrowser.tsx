import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  type MusicGenre,
  type MusicMood,
  type MusicTrack,
  categoryLabels,
  genreLabels,
  moodLabels,
  musicLibrary,
  musicLibraryManager,
} from '@/lib/musicLibrary'
import {
  Check,
  Heart,
  Music,
  Pause,
  Play,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface MusicBrowserProps {
  onSelect: (track: MusicTrack) => void
  onClose: () => void
  selectedTrack?: MusicTrack | null
}

export default function MusicBrowser({ onSelect, onClose, selectedTrack }: MusicBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('trending')
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre | null>(null)
  const [selectedMood, setSelectedMood] = useState<MusicMood | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.7)
  const [, forceUpdate] = useState({})

  const { isRTL } = useLanguage()

  useEffect(() => {
    return () => {
      musicLibraryManager.cleanup()
    }
  }, [])

  const getDisplayTracks = (): MusicTrack[] => {
    if (searchQuery.trim()) {
      return musicLibraryManager.searchTracks(searchQuery)
    }

    if (selectedGenre) {
      return musicLibraryManager.getTracksByGenre(selectedGenre)
    }

    if (selectedMood) {
      return musicLibraryManager.getTracksByMood(selectedMood)
    }

    switch (activeTab) {
      case 'trending':
        return musicLibraryManager.getTrendingTracks()
      case 'new':
        return musicLibraryManager.getNewReleases()
      case 'foryou':
        return musicLibraryManager.getForYouTracks()
      case 'saved':
        return musicLibraryManager.getSavedTracks()
      default:
        return musicLibrary
    }
  }

  const handlePlayTrack = (track: MusicTrack) => {
    musicLibraryManager.playTrack(track)
    setPlayingTrackId(musicLibraryManager.isPlaying(track.id) ? track.id : null)
    forceUpdate({})
  }

  const handleToggleSave = (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    musicLibraryManager.toggleSaveTrack(track.id)
    forceUpdate({})
  }

  const handleSelectTrack = (track: MusicTrack) => {
    musicLibraryManager.stopCurrentTrack()
    onSelect(track)
  }

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0]
    setVolume(vol)
    musicLibraryManager.setVolume(vol)
  }

  const clearFilters = () => {
    setSelectedGenre(null)
    setSelectedMood(null)
    setSearchQuery('')
  }

  const genres: MusicGenre[] = [
    'pop',
    'hiphop',
    'electronic',
    'rock',
    'rnb',
    'arabic',
    'classical',
    'jazz',
    'ambient',
  ]
  const moods: MusicMood[] = [
    'happy',
    'sad',
    'energetic',
    'calm',
    'romantic',
    'dramatic',
    'funny',
    'inspirational',
  ]
  const displayTracks = getDisplayTracks()

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          {isRTL ? 'مكتبة الموسيقى' : 'Music Library'}
        </h2>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'ابحث عن موسيقى...' : 'Search music...'}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="flex-1"
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v)
          clearFilters()
        }}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-4 mx-4 bg-muted/50">
          <TabsTrigger value="trending" className="gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            {isRTL ? 'رائج' : 'Trending'}
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            {isRTL ? 'جديد' : 'New'}
          </TabsTrigger>
          <TabsTrigger value="foryou" className="gap-1 text-xs">
            <Star className="h-3 w-3" />
            {isRTL ? 'لك' : 'For You'}
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-1 text-xs">
            <Heart className="h-3 w-3" />
            {isRTL ? 'محفوظة' : 'Saved'}
          </TabsTrigger>
        </TabsList>

        <div className="p-4 space-y-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? 'default' : 'outline'}
                  size="sm"
                  className="flex-shrink-0 text-xs"
                  onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                >
                  {isRTL ? genreLabels[genre].ar : genreLabels[genre].en}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {moods.map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMood === mood ? 'default' : 'outline'}
                  size="sm"
                  className="flex-shrink-0 text-xs"
                  onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                >
                  {isRTL ? moodLabels[mood].ar : moodLabels[mood].en}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {(selectedGenre || selectedMood || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground"
            >
              {isRTL ? 'مسح الفلاتر' : 'Clear filters'}
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {displayTracks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isRTL ? 'لا توجد موسيقى' : 'No music found'}
              </div>
            ) : (
              displayTracks.map((track) => {
                const isCurrentlyPlaying = musicLibraryManager.isPlaying(track.id)
                const isSaved = musicLibraryManager.isTrackSaved(track.id)
                const isSelected = selectedTrack?.id === track.id

                return (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectTrack(track)}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayTrack(track)
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="h-6 w-6 text-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white" />
                        )}
                      </button>
                      {isCurrentlyPlaying && (
                        <div className="absolute bottom-1 left-1 right-1 h-1 bg-black/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse w-1/2" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {isRTL ? track.titleAr : track.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {isRTL ? track.artistAr : track.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {musicLibraryManager.formatDuration(track.duration)}
                        </span>
                        {track.usageCount && (
                          <span className="text-xs text-muted-foreground">
                            • {musicLibraryManager.formatUsageCount(track.usageCount)}{' '}
                            {isRTL ? 'استخدام' : 'uses'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleSave(track, e)}
                        className={`p-2 rounded-full transition-colors ${
                          isSaved ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      {isSelected && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
