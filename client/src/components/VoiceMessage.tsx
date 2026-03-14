import { cn } from '@/lib/utils'
import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface VoiceMessageProps {
  audioUrl: string
  duration: number
  isOwn?: boolean
  className?: string
}

export default function VoiceMessage({
  audioUrl,
  duration,
  isOwn = false,
  className,
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const bars = 24
    const data = Array.from({ length: bars }, () => Math.random() * 0.7 + 0.3)
    setWaveformData(data)
  }, [audioUrl])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-2xl min-w-[200px] max-w-[280px]',
        isOwn ? 'bg-gradient-to-r from-primary to-purple-600' : 'bg-card border border-border/50',
        className
      )}
    >
      <audio ref={audioRef} src={audioUrl} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />

      <button
        onClick={togglePlayback}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
          isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/10 hover:bg-primary/20'
        )}
      >
        {isPlaying ? (
          <Pause className={cn('h-5 w-5', isOwn ? 'text-white' : 'text-primary')} />
        ) : (
          <Play className={cn('h-5 w-5', isOwn ? 'text-white' : 'text-primary')} />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-end gap-0.5 h-6">
          {waveformData.map((value, index) => {
            const isActive = (index / waveformData.length) * 100 <= progress
            return (
              <div
                key={index}
                className={cn(
                  'w-1 rounded-full transition-all duration-100',
                  isOwn
                    ? isActive
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isActive
                      ? 'bg-primary'
                      : 'bg-muted'
                )}
                style={{ height: `${value * 24}px` }}
              />
            )
          })}
        </div>
        <span className={cn('text-xs', isOwn ? 'text-white/70' : 'text-muted-foreground')}>
          {formatTime(isPlaying ? currentTime : duration)}
        </span>
      </div>
    </div>
  )
}
