import { Skeleton } from '@/components/ui/skeleton'
import { useChannelsForCommunity } from '@/hooks/useCommunities'
import CreateChannelDialog from './CreateChannelDialog'
import { Hash, Mic, Settings } from 'lucide-react'
import React from 'react'

interface ChannelListProps {
  communityId: string
  communityName?: string
  isMember?: boolean
  selectedChannel: string | null
  onSelectChannel: (channelId: string) => void
}

/**
 * ChannelList - The second pillar of our three-column layout.
 * Displays text and voice channels for a community with a clean, minimalist design.
 * Designed for clarity and immediate interaction, reflecting our "Calm" and "Speed" principles.
 */
const ChannelList = ({ communityId, selectedChannel, onSelectChannel }: ChannelListProps) => {
  const { data: channels, isLoading, error } = useChannelsForCommunity(communityId)

  if (isLoading) {
    return <ChannelListSkeleton />
  }

  if (error) {
    return <div className="w-60 bg-[#24272B] p-2 text-neutral-400">Error loading channels.</div>
  }

  const textChannels = channels?.filter((ch: any) => ch.type === 'text') || []
  const voiceChannels = channels?.filter((ch: any) => ch.type === 'voice') || []

  return (
    <div className="w-60 bg-card/40 backdrop-blur-xl h-full flex flex-col p-2 border-r border-white/10">
      <div className="flex items-center justify-between p-2 mb-2">
        <div>
          <h1 className="text-lg font-bold text-foreground truncate">
            {communityName || 'Community'}
          </h1>
          {communityName && (
            <p className="text-xs text-foreground/60 truncate">{communityName}</p>
          )}
        </div>
        {isMember && (
          <div className="flex items-center gap-2">
            <CreateChannelDialog
              communityId={communityId}
              onCreated={(channel) => onSelectChannel(channel.id)}
            />
            <Settings className="text-foreground/40 hover:text-foreground" size={18} />
          </div>
        )}
      </div>

      {/* Channel Categories */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Text Channels */}
        <ChannelCategory
          title="Text Channels"
          channels={textChannels}
          selectedChannel={selectedChannel}
          onSelectChannel={onSelectChannel}
        />

        {/* Voice Channels */}
        <div className="mt-4">
          <ChannelCategory
            title="Voice Channels"
            channels={voiceChannels}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
          />
        </div>
      </div>

      {/* Member summary */}
      <div className="p-2 mt-auto bg-card/50 rounded-lg">
        <p className="text-xs text-foreground/60">Tip: Join the discussion by selecting a channel.</p>
      </div>
    </div>
  )
}

const ChannelCategory = ({ title, channels, selectedChannel, onSelectChannel }: any) => {
  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{title}</h2>
        <button className="text-neutral-400 hover:text-white">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-col space-y-0.5">
        {channels.map((channel: any) => (
          <ChannelLink
            key={channel.id}
            channel={channel}
            isSelected={channel.id === selectedChannel}
            onClick={() => onSelectChannel(channel.id)}
          />
        ))}
      </div>
    </div>
  )
}

const ChannelLink = ({ channel, isSelected, onClick }: any) => {
  const Icon = channel.type === 'text' ? Hash : Mic
  const isActive = isSelected // For future glowing/notification effects

  return (
    <button
      onClick={onClick}
      className={`
                group flex items-center w-full p-2 text-left rounded-md transition-colors duration-150
                ${isActive ? 'bg-[#3C45A0] text-white' : 'text-neutral-400 hover:bg-[#313439] hover:text-neutral-200'}
            `}
    >
      <Icon
        size={16}
        className={`mr-2 ${isActive ? 'text-neutral-200' : 'text-neutral-500 group-hover:text-neutral-400'}`}
      />
      <span className="flex-1 font-medium text-sm truncate">{channel.name}</span>
      {/* Future notification indicator */}
      {/* {channel.hasNotification && <div className='w-2 h-2 bg-white rounded-full ml-auto'></div>} */}
    </button>
  )
}

const ChannelListSkeleton = () => {
  return (
    <div className="w-60 bg-[#24272B] h-full p-2">
      <Skeleton className="h-10 w-4/5 mb-4 bg-[#313439]" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-3/5 mb-2 bg-[#313439]" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full bg-[#313439]" />
            <Skeleton className="h-8 w-full bg-[#313439]" />
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-3/5 mb-2 bg-[#313439]" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full bg-[#313439]" />
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Skeleton className="h-12 w-full bg-[#313439]" />
      </div>
    </div>
  )
}

export default ChannelList
