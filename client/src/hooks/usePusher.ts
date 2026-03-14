import PusherClient from 'pusher-js'
import { useEffect, useRef } from 'react'

const pusherInstance = new PusherClient('b899008fb2257ea055b9', {
  cluster: 'eu',
})

export function usePusher(
  conversationIdOrChannelName: string | null,
  onNewMessage: (message: any) => void,
  options?: { isConversation?: boolean; eventName?: string }
) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const eventName = options?.eventName || 'new-message'
    if (!conversationIdOrChannelName) {
      if (channelRef.current) {
        if (options?.isConversation ?? true) {
          pusherInstance.unsubscribe(`conversation-${conversationIdOrChannelName}`)
        } else {
          pusherInstance.unsubscribe(conversationIdOrChannelName as string)
        }
        channelRef.current = null
      }
      return
    }

    const channelName =
      (options?.isConversation ?? true)
        ? `conversation-${conversationIdOrChannelName}`
        : (conversationIdOrChannelName as string)

    const channel = pusherInstance.subscribe(channelName)
    channelRef.current = channel

    channel.bind(eventName, (data: any) => {
      onNewMessage(data.message)
    })

    return () => {
      pusherInstance.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [conversationIdOrChannelName, onNewMessage, options?.eventName, options?.isConversation])

  return pusherInstance
}
