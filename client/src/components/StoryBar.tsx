import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfiles'
import { useStories } from '@/hooks/useStories'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import AddStoryDialog from './AddStoryDialog'
import StoryViewer from './StoryViewer'
import UserAvatar from './UserAvatar'

export default function StoryBar() {
  const { data: stories = [], isLoading } = useStories()
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null)
  const [addStoryOpen, setAddStoryOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="w-full border-b border-border/30 bg-background py-4">
        <div className="flex gap-4 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="h-[68px] w-[68px] rounded-full bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-b border-border/30 bg-background py-4">
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4">
          <button
            className="flex flex-col items-center gap-2 min-w-fit group"
            onClick={() => setAddStoryOpen(true)}
            data-testid="story-add"
          >
            <div className="relative">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.username || user?.email || 'Me'}
                size="xl"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-primary border-[3px] border-background flex items-center justify-center shadow-lg">
                <Plus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Add Story
            </span>
          </button>

          {stories.map((story, index) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-2 min-w-fit group"
              onClick={() => setViewingStoryIndex(index)}
              data-testid={`story-${story.profiles.username.toLowerCase().replace(/\s/g, '-')}`}
            >
              <UserAvatar
                src={story.profiles.avatar_url}
                name={story.profiles.username}
                size="xl"
                hasStory
              />
              <span className="text-xs font-medium truncate max-w-[68px] text-muted-foreground group-hover:text-foreground transition-colors">
                {story.profiles.username}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-0" />
      </ScrollArea>

      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
        />
      )}

      <AddStoryDialog open={addStoryOpen} onOpenChange={setAddStoryOpen} />
    </div>
  )
}
