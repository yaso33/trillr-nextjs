import { useAuth } from '@/contexts/AuthContext'
import { useCommunity, useCommunityMembers, useJoinCommunity, useLeaveCommunity, useChannelsForCommunity } from '@/hooks/useCommunities'
import { useCommunityRole } from '@/hooks/useCommunityRole'
import React, { useState, useEffect, useMemo } from 'react'
import { useRoute, useLocation } from 'wouter'
import ChannelList from './ChannelList'
import CommunityChannel from './CommunityChannel'

const MemberList = ({ communityId }: { communityId: string }) => {
  const { user } = useAuth()
  const { data: members = [], isLoading } = useCommunityMembers(communityId)

  const membersWithoutCurrent = useMemo(
    () => members.filter((m: any) => m.user_id !== user?.id),
    [members, user]
  )

  return (
    <div className="w-72 bg-card/40 backdrop-blur-xl p-3 border-l border-white/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Members</h2>
        <span className="text-xs text-foreground/50">{members.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-10 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-foreground/60">No members yet.</p>
        ) : (
          membersWithoutCurrent.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-white/5"
            >
              <img
                src={member.profiles?.avatar_url || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${member.user_id}`}
                alt={member.profiles?.username || 'Member'}
                className="w-10 h-10 rounded-full bg-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {member.profiles?.username || 'Unknown'}
                </p>
                <p className="text-xs text-foreground/50 truncate">
                  {member.profiles?.full_name || 'Member'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function CommunityPage() {
  const [, params] = useRoute('/communities/:id')
  const communityId = params?.id
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const { user } = useAuth()
  const [, setLocation] = useLocation()

  const { data: community, isLoading: loadingCommunity } = useCommunity(communityId)
  const { data: channels = [], isLoading: loadingChannels } = useChannelsForCommunity(communityId)
  const { data: role, isLoading: loadingRole } = useCommunityRole(communityId || null)
  const joinCommunity = useJoinCommunity()
  const leaveCommunity = useLeaveCommunity()

  const isMember = Boolean(role)

  const isLoading = loadingCommunity || loadingChannels || loadingRole

  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0].id)
    }
  }, [channels, selectedChannel])

  if (!communityId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        Community not found.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="text-lg text-foreground/70">Loading community…</div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        Community not found.
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <div className="w-full flex flex-col md:flex-row">
        <ChannelList
          communityId={communityId}
          communityName={community.name}
          isMember={isMember}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
        />

        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-card/30">
            <div>
              <h1 className="text-xl font-semibold">{community.name}</h1>
              {community.description && (
                <p className="text-sm text-foreground/60">{community.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isMember ? (
              user ? (
                <button
                  className="rounded-full bg-primary/30 px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/50 transition"
                  onClick={() => joinCommunity.mutate({ communityId })}
                >
                  Join
                </button>
              ) : (
                <button
                  className="rounded-full bg-primary/30 px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary/50 transition"
                  onClick={() => setLocation('/auth')}
                >
                  Sign in to join
                </button>
              )
            ) : (
              <button
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/20 transition"
                onClick={() => leaveCommunity.mutate({ communityId })}
              >
                Leave
              </button>
            )}
              {role === 'owner' && (
              <button
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/20 transition"
                onClick={() => {
                  // Placeholder for future community management
                }}
              >
                Settings
              </button>
            )}
            </div>
          </header>

          <div className="flex flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <CommunityChannel
                communityId={communityId}
                channelId={selectedChannel}
                userId={user?.id}
              />
            </div>
            <MemberList communityId={communityId} />
          </div>
        </main>
      </div>
    </div>
  )
}
