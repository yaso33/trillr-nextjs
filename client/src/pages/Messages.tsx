
import ChatListItem from '@/components/ChatListItem'
import ChatWindow from '@/components/ChatWindow'
import UserAvatar from '@/components/UserAvatar'
import VideoCall from '@/components/agora/VideoCall'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useConversations, useGetOrCreateConversation, useMessages, useSendMessage } from '@/hooks/useMessages'
import { useSearchProfiles } from '@/hooks/useProfiles'
import { usePusher } from '@/hooks/usePusher'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, MessageSquarePlus, MoreVertical, Phone, Search as SearchIcon, Send, Video } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export default function Messages() {
  const { user } = useAuth()
  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null)
  const [isNewConvoDialogOpen, setNewConvoDialogOpen] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const { toast } = useToast()
  const getOrCreateConversationMutation = useGetOrCreateConversation()

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConvoId) {
      if (window.innerWidth >= 768) {
        const mostRecent = [...conversations].sort((a, b) => 
          new Date(b.last_message?.created_at || 0).getTime() - 
          new Date(a.last_message?.created_at || 0).getTime()
        )[0];
        if (mostRecent) setSelectedConvoId(mostRecent.conversation_id);
      }
    }
  }, [conversations, selectedConvoId])

  const handleStartConversation = async (userId: string) => {
    try {
      const { conversationId } = await getOrCreateConversationMutation.mutateAsync(userId)
      setSelectedConvoId(conversationId)
      setNewConvoDialogOpen(false)
    } catch (error: any) {
      toast({ title: 'Error starting conversation', description: error?.message || 'Could not start a new conversation.', variant: 'destructive' })
    }
  }

  const queryClient = useQueryClient()
  const selectedConversation = conversations?.find(c => c.conversation_id === selectedConvoId);

  useEffect(() => {
    if (!selectedConvoId || !user?.id) return

    // Mark conversation messages as read when opened
    fetch(`/api/conversations/${selectedConvoId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      })
      .catch((err) => {
        console.error('Failed to mark conversation read', err)
      })
  }, [selectedConvoId, user?.id, queryClient])

  if (isCalling && selectedConvoId) {
    return <VideoCall channelName={selectedConvoId} onEndCall={() => setIsCalling(false)} />
  }

  return (
    <div className="h-full flex bg-background text-foreground font-sans antialiased overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-background" />
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-blob animation-delay-3000" />
      </div>

      <aside className={cn(
        "flex-col bg-card/30 backdrop-blur-xl border-r border-card-border transition-all duration-300 ease-in-out",
        selectedConvoId ? "hidden" : "flex w-full",
        "md:flex md:w-[380px] md:flex-shrink-0"
      )}>
        <SidebarContent onNewConversation={() => setNewConvoDialogOpen(true)} conversations={conversations || []} conversationsLoading={conversationsLoading} selectedConvoId={selectedConvoId} onSelectConvo={setSelectedConvoId} />
      </aside>

      <main className={cn(
        "flex-col flex-1 min-w-0",
        selectedConvoId ? "flex" : "hidden",
        "md:flex",
        // add a small horizontal gap from the global sidebar
        "md:ml-4 lg:ml-6 xl:ml-8"
      )}>
        {selectedConversation ? (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b border-primary/10 bg-card/20 backdrop-blur-lg z-10">
              <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setSelectedConvoId(null)}><ArrowLeft className="h-5 w-5" /></Button>
              <UserAvatar src={selectedConversation.avatar_url} name={selectedConversation.username} size="md" isOnline={true}/>
              <div className="flex-1 min-w-0"><p className="font-semibold truncate text-white">{selectedConversation.username}</p><p className="text-xs text-green-400 filter drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]">Active now</p></div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => toast({title: 'Voice call coming soon!'})}><Phone className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setIsCalling(true)}><Video className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost"><MoreVertical className="h-5 w-5" /></Button>
              </div>
            </header>
            <ConversationWindow conversation={selectedConversation} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-card/20">
            <div className="text-center space-y-4 p-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto shadow-lg shadow-primary/10"><Send className="w-12 h-12 text-primary -rotate-45 transform -translate-x-1" /></div>
              <div><h3 className="text-xl font-semibold mb-1 text-white">Digital Line Messenger</h3><p className="text-white/60 text-sm max-w-xs mx-auto">Select a conversation to start messaging.</p></div>
            </div>
          </div>
        )}
      </main>
      
      <NewConversationDialog open={isNewConvoDialogOpen} onOpenChange={setNewConvoDialogOpen} onStartConversation={handleStartConversation} userId={user?.id}/>
    </div>
  )
}

const SidebarContent = ({ onNewConversation, conversations, conversationsLoading, selectedConvoId, onSelectConvo }: any) => (
  <>
    <header className="p-4 border-b border-primary/10 flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Comms</h1>
        <Button size="icon" variant="ghost" onClick={onNewConversation}><MessageSquarePlus className="w-5 h-5"/></Button>
      </div>
      <div className="relative"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" /><Input placeholder="Search conversations..." className="pl-10 text-sm"/></div>
    </header>
    <ScrollArea className="flex-1">
      {conversationsLoading ? <div className="p-4 text-center text-white/50">Loading...</div> : conversations.length === 0 ? (
        <div className="text-center p-8 mt-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4"><MessageSquarePlus className="w-10 h-10 text-primary"/></div>
          <h3 className="font-semibold text-lg">Empty Inbox</h3><p className="text-sm text-white/50">Start a new conversation.</p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          {[...conversations]
            .sort((a, b) => new Date(b.last_message?.created_at || 0).getTime() - new Date(a.last_message?.created_at || 0).getTime())
            .map((conv) => <ChatListItem key={conv.conversation_id} id={conv.conversation_id} name={conv.username || 'Unknown User'} avatar={conv.avatar_url} lastMessage={conv.last_message?.content || ''} timestamp={conv.last_message?.created_at ? format(new Date(conv.last_message.created_at), 'p') : ''} unreadCount={conv.unread_count || 0} isActive={selectedConvoId === conv.conversation_id} onClick={() => onSelectConvo(conv.conversation_id)}/>)}
        </div>
      )}
    </ScrollArea>
  </>
)

function ConversationWindow({ conversation }: { conversation: any }) {
    const { user } = useAuth();
    const { data: initialMessages = [], isLoading } = useMessages(conversation.conversation_id);
    const sendMessageMutation = useSendMessage();
    const [messages, setMessages] = useState(initialMessages);

    useEffect(() => { setMessages(initialMessages); }, [initialMessages]);

    const handleNewMessage = useCallback((newMessage: any) => {
        if (newMessage.conversation_id === conversation.conversation_id) {
            setMessages((prev) => [...prev, newMessage]);
        }
    }, [conversation.conversation_id]);

    usePusher(conversation.conversation_id, 'new_message', handleNewMessage);

    const handleSendMessage = async (content: string, imageUrl?: string) => {
        if (!content.trim() && !imageUrl) return;
        await sendMessageMutation.mutateAsync({ conversationId: conversation.conversation_id, content, imageUrl });
    };

    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        timestamp: msg.created_at,
        isSent: msg.sender_id === user?.id,
        senderName: msg.sender?.username || 'User',
        imageUrl: msg.image_url,
    }));

    return <ChatWindow messages={formattedMessages} onSendMessage={handleSendMessage} isLoading={isLoading} conversationId={conversation.conversation_id}/>
}

function NewConversationDialog({ open, onOpenChange, onStartConversation, userId }: { open: boolean, onOpenChange: (open: boolean) => void, onStartConversation: (userId: string) => void, userId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = [], isLoading } = useSearchProfiles(searchQuery);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Find someone to connect with.</DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <div className="relative"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" /><Input placeholder="Search by username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 text-sm"/></div>
          <ScrollArea className="mt-4 h-[300px]">
              {isLoading && searchQuery ? <div className="text-center p-4 text-sm text-white/50">Searching...</div> : null}
              {!isLoading && searchResults.length === 0 ? <div className="text-center p-4 text-sm text-white/50">{searchQuery ? 'No users found.' : 'Start typing to find users.'}</div> : null}
              <div className="space-y-1 py-1">
                  {searchResults.filter(p => p.id !== userId).map(profile => (
                      <button key={profile.id} onClick={() => onStartConversation(profile.id)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                          <UserAvatar src={profile.avatar_url} name={profile.username} size="md" />
                          <div className="flex-1"><p className="font-semibold text-sm text-white">{profile.username}</p><p className="text-xs text-white/60">{profile.full_name}</p></div>
                      </button>
                  ))}
              </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
