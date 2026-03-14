import { Howl } from 'howler'

export interface MusicTrack {
  id: string
  title: string
  titleAr: string
  artist: string
  artistAr: string
  duration: number
  coverUrl: string
  audioUrl: string
  category: MusicCategory
  mood: MusicMood[]
  genre: MusicGenre
  isPopular?: boolean
  usageCount?: number
}

export type MusicCategory = 'trending' | 'newReleases' | 'forYou' | 'saved'
export type MusicMood =
  | 'happy'
  | 'sad'
  | 'energetic'
  | 'calm'
  | 'romantic'
  | 'dramatic'
  | 'funny'
  | 'inspirational'
export type MusicGenre =
  | 'pop'
  | 'hiphop'
  | 'electronic'
  | 'rock'
  | 'rnb'
  | 'arabic'
  | 'classical'
  | 'jazz'
  | 'ambient'

export const moodLabels: Record<MusicMood, { en: string; ar: string }> = {
  happy: { en: 'Happy', ar: 'سعيد' },
  sad: { en: 'Sad', ar: 'حزين' },
  energetic: { en: 'Energetic', ar: 'حماسي' },
  calm: { en: 'Calm', ar: 'هادئ' },
  romantic: { en: 'Romantic', ar: 'رومانسي' },
  dramatic: { en: 'Dramatic', ar: 'درامي' },
  funny: { en: 'Funny', ar: 'مضحك' },
  inspirational: { en: 'Inspirational', ar: 'ملهم' },
}

export const genreLabels: Record<MusicGenre, { en: string; ar: string }> = {
  pop: { en: 'Pop', ar: 'بوب' },
  hiphop: { en: 'Hip Hop', ar: 'هيب هوب' },
  electronic: { en: 'Electronic', ar: 'إلكتروني' },
  rock: { en: 'Rock', ar: 'روك' },
  rnb: { en: 'R&B', ar: 'آر أند بي' },
  arabic: { en: 'Arabic', ar: 'عربي' },
  classical: { en: 'Classical', ar: 'كلاسيكي' },
  jazz: { en: 'Jazz', ar: 'جاز' },
  ambient: { en: 'Ambient', ar: 'محيط' },
}

export const categoryLabels: Record<MusicCategory, { en: string; ar: string; icon: string }> = {
  trending: { en: 'Trending', ar: 'رائج', icon: '🔥' },
  newReleases: { en: 'New Releases', ar: 'جديد', icon: '✨' },
  forYou: { en: 'For You', ar: 'لك', icon: '💫' },
  saved: { en: 'Saved', ar: 'المحفوظة', icon: '❤️' },
}

// Generate gradient covers for each track - reliable and works everywhere
const generateGradientCover = (trackId: string): string => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink Red
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue Cyan
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan Purple
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pink Teal
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Orange Red
    'linear-gradient(135deg, #2e2e78 0%, #662d91 100%)', // Dark Purple
    'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)', // Orange Yellow
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Red Blue
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Purple Blue
  ]

  const colors_hex = colors.map(
    (c) =>
      `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><style>${c
          .replace(/linear-gradient\(135deg, /, '')
          .replace(/ \d+%/g, '')
          .split(',')
          .map((c, i) => `stop${i}{stop-color:${c}}`)
          .join(';')}</style></defs><rect width="200" height="200" style="background:${c}"/></svg>`
      )}`
  )

  // Use a simple solid color SVG instead
  const solidColors = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#30cfd0',
    '#a8edea',
    '#ff9a56',
    '#2e2e78',
    '#ffa751',
    '#ff6e7f',
    '#e0c3fc',
  ]
  const hashCode = trackId.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0)
  const color = solidColors[hashCode % solidColors.length]

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='${color.replace('#', '%23')}'/%3E%3Ctext x='100' y='100' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3E♪%3C/text%3E%3C/svg%3E`
}

export const musicLibrary: MusicTrack[] = [
  {
    id: 'beat-drop-1',
    title: 'Summer Vibes',
    titleAr: 'أجواء صيفية',
    artist: 'Chill Beats',
    artistAr: 'إيقاعات هادئة',
    duration: 30,
    coverUrl: generateGradientCover('beat-drop-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    category: 'trending',
    mood: ['happy', 'energetic'],
    genre: 'pop',
    isPopular: true,
    usageCount: 1250000,
  },
  {
    id: 'beat-drop-2',
    title: 'Night Drive',
    titleAr: 'قيادة ليلية',
    artist: 'Synthwave Dreams',
    artistAr: 'أحلام سينث ويف',
    duration: 25,
    coverUrl: generateGradientCover('beat-drop-2'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d484.mp3',
    category: 'trending',
    mood: ['calm', 'dramatic'],
    genre: 'electronic',
    isPopular: true,
    usageCount: 980000,
  },
  {
    id: 'beat-drop-3',
    title: 'Hip Hop Flow',
    titleAr: 'تدفق هيب هوب',
    artist: 'Urban Beats',
    artistAr: 'إيقاعات حضرية',
    duration: 28,
    coverUrl: generateGradientCover('beat-drop-3'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
    category: 'trending',
    mood: ['energetic'],
    genre: 'hiphop',
    isPopular: true,
    usageCount: 750000,
  },
  {
    id: 'chill-1',
    title: 'Peaceful Morning',
    titleAr: 'صباح هادئ',
    artist: 'Ambient Sounds',
    artistAr: 'أصوات محيطة',
    duration: 35,
    coverUrl: generateGradientCover('chill-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3',
    category: 'forYou',
    mood: ['calm', 'inspirational'],
    genre: 'ambient',
    usageCount: 450000,
  },
  {
    id: 'arabic-1',
    title: 'Oriental Nights',
    titleAr: 'ليالي شرقية',
    artist: 'Arabic Fusion',
    artistAr: 'فيوجن عربي',
    duration: 32,
    coverUrl: generateGradientCover('arabic-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3',
    category: 'trending',
    mood: ['romantic', 'dramatic'],
    genre: 'arabic',
    isPopular: true,
    usageCount: 620000,
  },
  {
    id: 'pop-1',
    title: 'Dance Floor',
    titleAr: 'حلبة الرقص',
    artist: 'Pop Stars',
    artistAr: 'نجوم البوب',
    duration: 27,
    coverUrl: generateGradientCover('pop-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
    category: 'newReleases',
    mood: ['happy', 'energetic'],
    genre: 'pop',
    usageCount: 380000,
  },
  {
    id: 'rock-1',
    title: 'Electric Storm',
    titleAr: 'عاصفة كهربائية',
    artist: 'Rock Legends',
    artistAr: 'أساطير الروك',
    duration: 30,
    coverUrl: generateGradientCover('rock-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c8.mp3',
    category: 'forYou',
    mood: ['energetic', 'dramatic'],
    genre: 'rock',
    usageCount: 290000,
  },
  {
    id: 'jazz-1',
    title: 'Smooth Jazz Cafe',
    titleAr: 'مقهى الجاز',
    artist: 'Jazz Masters',
    artistAr: 'أساتذة الجاز',
    duration: 40,
    coverUrl: generateGradientCover('jazz-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_270f49a38d.mp3',
    category: 'forYou',
    mood: ['calm', 'romantic'],
    genre: 'jazz',
    usageCount: 210000,
  },
  {
    id: 'rnb-1',
    title: 'Late Night Love',
    titleAr: 'حب متأخر',
    artist: 'R&B Soul',
    artistAr: 'روح آر أند بي',
    duration: 33,
    coverUrl: generateGradientCover('rnb-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_1333dfb16e.mp3',
    category: 'newReleases',
    mood: ['romantic', 'calm'],
    genre: 'rnb',
    usageCount: 340000,
  },
  {
    id: 'electronic-1',
    title: 'Future Bass Drop',
    titleAr: 'دروب المستقبل',
    artist: 'EDM Producer',
    artistAr: 'منتج إلكتروني',
    duration: 26,
    coverUrl: generateGradientCover('electronic-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_d16737dc28.mp3',
    category: 'trending',
    mood: ['energetic', 'happy'],
    genre: 'electronic',
    isPopular: true,
    usageCount: 890000,
  },
  {
    id: 'classical-1',
    title: 'Piano Dreams',
    titleAr: 'أحلام البيانو',
    artist: 'Classical Ensemble',
    artistAr: 'فرقة كلاسيكية',
    duration: 45,
    coverUrl: generateGradientCover('classical-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_b9e44e3642.mp3',
    category: 'forYou',
    mood: ['calm', 'sad', 'inspirational'],
    genre: 'classical',
    usageCount: 180000,
  },
  {
    id: 'funny-1',
    title: 'Comedy Time',
    titleAr: 'وقت الكوميديا',
    artist: 'Fun Sounds',
    artistAr: 'أصوات مرحة',
    duration: 15,
    coverUrl: generateGradientCover('funny-1'),
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
    category: 'newReleases',
    mood: ['funny', 'happy'],
    genre: 'pop',
    usageCount: 520000,
  },
]

class MusicLibraryManager {
  private currentSound: Howl | null = null
  private currentTrackId: string | null = null
  private savedTracks: Set<string> = new Set()
  private volume = 0.7

  constructor() {
    const saved = localStorage.getItem('buzly_saved_tracks')
    if (saved) {
      this.savedTracks = new Set(JSON.parse(saved))
    }
  }

  getTrendingTracks(): MusicTrack[] {
    return musicLibrary
      .filter((track) => track.category === 'trending' || track.isPopular)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  }

  getNewReleases(): MusicTrack[] {
    return musicLibrary.filter((track) => track.category === 'newReleases')
  }

  getForYouTracks(): MusicTrack[] {
    return musicLibrary.filter((track) => track.category === 'forYou')
  }

  getSavedTracks(): MusicTrack[] {
    return musicLibrary.filter((track) => this.savedTracks.has(track.id))
  }

  getTracksByGenre(genre: MusicGenre): MusicTrack[] {
    return musicLibrary.filter((track) => track.genre === genre)
  }

  getTracksByMood(mood: MusicMood): MusicTrack[] {
    return musicLibrary.filter((track) => track.mood.includes(mood))
  }

  searchTracks(query: string): MusicTrack[] {
    const lowerQuery = query.toLowerCase()
    return musicLibrary.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.titleAr.includes(query) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.artistAr.includes(query)
    )
  }

  isTrackSaved(trackId: string): boolean {
    return this.savedTracks.has(trackId)
  }

  toggleSaveTrack(trackId: string): boolean {
    if (this.savedTracks.has(trackId)) {
      this.savedTracks.delete(trackId)
    } else {
      this.savedTracks.add(trackId)
    }
    localStorage.setItem('buzly_saved_tracks', JSON.stringify(Array.from(this.savedTracks)))
    return this.savedTracks.has(trackId)
  }

  playTrack(track: MusicTrack): void {
    if (this.currentTrackId === track.id && this.currentSound) {
      if (this.currentSound.playing()) {
        this.currentSound.pause()
      } else {
        this.currentSound.play()
      }
      return
    }

    this.stopCurrentTrack()

    this.currentSound = new Howl({
      src: [track.audioUrl],
      html5: true,
      volume: this.volume,
      onend: () => {
        this.currentTrackId = null
      },
    })

    this.currentTrackId = track.id
    this.currentSound.play()
  }

  stopCurrentTrack(): void {
    if (this.currentSound) {
      this.currentSound.stop()
      this.currentSound.unload()
      this.currentSound = null
      this.currentTrackId = null
    }
  }

  pauseCurrentTrack(): void {
    if (this.currentSound?.playing()) {
      this.currentSound.pause()
    }
  }

  resumeCurrentTrack(): void {
    if (this.currentSound && !this.currentSound.playing()) {
      this.currentSound.play()
    }
  }

  isPlaying(trackId?: string): boolean {
    if (trackId) {
      return this.currentTrackId === trackId && this.currentSound?.playing() === true
    }
    return this.currentSound?.playing() === true
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.currentSound) {
      this.currentSound.volume(this.volume)
    }
  }

  getVolume(): number {
    return this.volume
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  formatUsageCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`
    }
    return count.toString()
  }

  cleanup(): void {
    this.stopCurrentTrack()
  }
}

export const musicLibraryManager = new MusicLibraryManager()
export default musicLibraryManager
