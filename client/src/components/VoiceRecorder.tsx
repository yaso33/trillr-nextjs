import { Button } from '@/components/ui/button'
import { ErrorLogger } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'
import { Mic, Pause, Play, Send, Square, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onCancel?: () => void
  maxDuration?: number
  className?: string
}

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  maxDuration = 60,
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const updateWaveform = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      const normalizedData = Array.from(dataArray.slice(0, 32)).map((v) => v / 255)
      setWaveformData(normalizedData)
      animationRef.current = requestAnimationFrame(updateWaveform)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      updateWaveform()
    } catch (error) {
      ErrorLogger.log('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleDelete = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setWaveformData([])
    onCancel?.()
  }

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration)
      handleDelete()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-card/80 backdrop-blur border border-border/50',
        className
      )}
    >
      {!audioBlob ? (
        <>
          {isRecording && (
            <div className="flex items-center gap-1 flex-1">
              {waveformData.map((value, index) => (
                <div
                  key={index}
                  className="w-1 bg-primary rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(4, value * 24)}px` }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {isRecording && (
              <>
                <span className="text-sm font-medium text-primary animate-pulse">
                  {formatTime(duration)}
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </>
            )}

            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'default'}
              className={cn(
                'rounded-full w-12 h-12 transition-all',
                isRecording ? 'neon-glow-strong' : 'bg-primary hover:bg-primary/90'
              )}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <Square className="h-5 w-5 fill-current" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} />

          <Button size="icon" variant="ghost" className="rounded-full" onClick={togglePlayback}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <div className="flex-1 flex items-center gap-2">
            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 neon-glow"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
