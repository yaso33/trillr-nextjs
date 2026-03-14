import { useChannelMessages, useSendChannelMessage } from '@/hooks/useCommunities'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import React, { useState } from 'react'

interface Channel {
  id: string
  name: string
}

interface User {
  id: string
  email?: string
}

interface ChatEngineProps {
  channel: Channel
  user: User | null
}

export default function ChatEngine({ channel, user }: ChatEngineProps) {
  const { data: messages = [] } = useChannelMessages(channel.id)
  const sendMessageMutation = useSendChannelMessage()
  const [messageInput, setMessageInput] = useState('')

  const handleSendMessage = () => {
    if (!user || !messageInput.trim()) return
    sendMessageMutation.mutate({
      channelId: channel.id,
      senderId: user.id,
      content: messageInput.trim(),
    })
    setMessageInput('')
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">#{channel.name}</h1>
        <div className="space-y-4">
          {messages.map((message: any) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 p-3 rounded hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">
                    {message.profiles?.username?.slice(0, 1).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="font-medium">{message.profiles?.username || 'Unknown'}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center bg-white/5 rounded-lg p-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="ml-2 p-2 bg-primary rounded hover:bg-primary/80 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
