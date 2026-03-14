import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Mic, Send, Smile } from 'lucide-react'
import { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface StoryReplyProps {
  storyId: string
  storyOwner: string
  onSendReply: (message: string, type: 'text' | 'voice', audioBlob?: Blob) => void
  className?: string
}

const QUICK_REACTIONS = ['❤️', '🔥', '👏', '😂', '😮', '😢']

export default function StoryReply({
  storyId,
  storyOwner,
  onSendReply,
  className,
}: StoryReplyProps) {
  const [message, setMessage] = useState('')
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)

  const handleSendText = () => {
    if (message.trim()) {
      onSendReply(message, 'text')
      setMessage('')
    }
  }

  const handleQuickReaction = (emoji: string) => {
    onSendReply(emoji, 'text')
  }

  const handleVoiceRecording = (audioBlob: Blob, duration: number) => {
    onSendReply(`Voice message (${Math.floor(duration)}s)`, 'voice', audioBlob)
    setShowVoiceRecorder(false)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-center gap-3">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleQuickReaction(emoji)}
            className="text-2xl hover:scale-125 transition-transform active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      {showVoiceRecorder ? (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecording}
          onCancel={() => setShowVoiceRecorder(false)}
          maxDuration={30}
        />
      ) : (
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Reply to ${storyOwner}...`}
              className="pr-20 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setShowVoiceRecorder(true)}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 neon-glow"
            onClick={handleSendText}
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
