import MessageBubble from '@/components/MessageBubble'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChannelMessages, useSendChannelMessage } from '@/hooks/useCommunities'
import { usePusher } from '@/hooks/usePusher'
import { ErrorLogger } from '@/lib/errorHandler'
import React, { useState, useEffect, useCallback } from 'react'

export default function CommunityChannel({
  communityId,
  channelId,
  userId,
}: { communityId: string; channelId: string; userId?: string | null }) {
  const { data: messages = [] } = useChannelMessages(channelId)
  const [localMessages, setLocalMessages] = useState<any[]>([])
  const sendChannelMessage = useSendChannelMessage()
  const handleNewMessage = useCallback((msg: any) => {
    setLocalMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
  }, [])

  usePusher(`community-${communityId}-channel-${channelId}`, handleNewMessage, {
    isConversation: false,
    eventName: 'new-channel-message',
  })

  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  const [text, setText] = useState('')
  const handleSend = async () => {
    if (!text || !userId) return
    try {
      await sendChannelMessage.mutateAsync({ channelId, senderId: userId, content: text })
      setText('')
    } catch (err) {
      ErrorLogger.log('Failed to send channel message', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        {localMessages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <MessageBubble
              id={msg.id}
              text={msg.content}
              isSent={msg.sender_id === userId}
              timestamp={msg.created_at}
              senderName={msg.sender?.username}
              senderAvatar={msg.sender?.avatar_url}
            />
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message to the channel"
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  )
}
