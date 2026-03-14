import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useChannelMessages, useSendChannelMessage } from '@/hooks/useCommunities'
import { Hash, Send } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'

interface ChatAreaProps {
  channelId: string | null
  channelName?: string
}

/**
 * ChatArea - The heart of the community experience.
 * Now accepts channelName to display contextually correct information.
 */
const ChatArea = ({ channelId, channelName = 'channel' }: ChatAreaProps) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const { data: messages = [], isLoading, error } = useChannelMessages(channelId ?? undefined)
  const sendMessageMutation = useSendChannelMessage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Automatically scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !channelId || !user) return
    sendMessageMutation.mutate({ channelId, senderId: user.id, content: message.trim() })
    setMessage('')
  }

  if (!channelId) {
    return (
      <div className="flex-1 bg-[#313439] flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
        <h2 className="text-xl font-medium">Welcome!</h2>
        <p>Select a channel on the left to start a conversation.</p>
      </div>
    )
  }

  if (isLoading) {
    return <ChatAreaSkeleton />
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#313439] flex items-center justify-center text-red-400">
        Failed to load messages.
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#313439] flex flex-col h-screen">
      {/* Channel Header */}
      <header className="flex-shrink-0 px-4 h-14 flex items-center border-b border-[#24272B] text-white font-semibold">
        <Hash className="text-neutral-500 mr-2" size={20} />
        {channelName}
      </header>

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: any) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="bg-[#3A3E45] rounded-lg flex items-center px-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={`Message #${channelName}`}
            className="bg-transparent border-none text-white placeholder-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
          >
            <Send className="text-neutral-400 hover:text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Sub-component for a single message
const Message = ({ message }: { message: any }) => {
  const sender = {
    name: `User ${message.sender_id.slice(0, 4)}`,
    avatar: `https://api.dicebear.com/8.x/pixel-art/svg?seed=${message.sender_id}`,
  }

  return (
    <div className="flex items-start space-x-3">
      <img
        src={sender.avatar}
        alt={sender.name}
        className="w-10 h-10 rounded-full bg-neutral-700"
      />
      <div>
        <p className="font-semibold text-white">{sender.name}</p>
        <p className="text-neutral-200">{message.content}</p>
      </div>
    </div>
  )
}

// Skeleton loader for the chat area
const ChatAreaSkeleton = () => {
  return (
    <div className="flex-1 bg-[#313439] flex flex-col h-screen">
      <div className="h-14 flex-shrink-0 px-4 flex items-center border-b border-[#24272B]">
        <Skeleton className="h-6 w-40 bg-[#3A3E45]" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="w-10 h-10 rounded-full bg-[#3A3E45]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-[#3A3E45]" />
              <Skeleton className="h-10 w-64 bg-[#3A3E45]" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <Skeleton className="h-12 w-full rounded-lg bg-[#3A3E45]" />
      </div>
    </div>
  )
}

export default ChatArea
