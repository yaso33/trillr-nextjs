
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { uploadChatMedia } from '@/lib/storage'
import { Loader2, Paperclip, Send, Smile, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import EmojiPicker from './EmojiPicker'
import MessageBubble from './MessageBubble'

export interface Message {
  id: string
  text: string
  timestamp: string
  isSent: boolean
  senderName: string
  imageUrl?: string
}

interface ChatWindowProps {
  messages: Message[]
  onSendMessage: (text: string, imageUrl?: string) => void
  isLoading: boolean
  conversationId: string
}

export default function ChatWindow({ messages, onSendMessage, isLoading, conversationId }: ChatWindowProps) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      setTimeout(() => viewport.scrollTop = viewport.scrollHeight, 100)
    }
  }, [messages, imagePreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "File too large", description: "Please select an image smaller than 10MB.", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  const handleSend = async () => {
    if ((!text.trim() && !imageFile) || isUploading) return;

    setIsUploading(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile && user) {
        const result = await uploadChatMedia(imageFile, user.id);
        imageUrl = result.url;
      }
      onSendMessage(text, imageUrl);
      setText('');
      setImageFile(null);
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Message send error:", error);
      toast({ title: "Send Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-card/20">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
            {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
             : messages.length === 0 ? <div className="text-center py-16 text-white/50 text-sm">No messages yet. Start the conversation!</div>
             : messages.map((msg, index) => <MessageBubble key={msg.id || index} {...msg} />)
            }
        </div>
      </ScrollArea>

      <div className="p-4 bg-card/30 backdrop-blur-xl border-t border-primary/10">
        {imagePreview && (
            <div className="relative w-24 h-24 mb-2 p-1 border border-primary/20 rounded-lg">
                <img src={imagePreview} className="w-full h-full object-cover rounded"/>
                <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>
        )}
        <div className="relative">
            <Input 
                placeholder="Send a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="pr-24 h-12 text-base"
                disabled={isUploading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <EmojiPicker onSelect={(emoji) => setText(t => t + emoji)} trigger={<Button size="icon" variant="ghost" className="text-white/60 hover:text-white"><Smile className="w-5 h-5"/></Button>}/>
                <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" onClick={() => fileInputRef.current?.click()}><Paperclip className="w-5 h-5"/></Button>
                 {(text.trim() || imageFile) && (
                    <motion.div initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{duration: 0.2}}>
                      <Button size="icon" onClick={handleSend} disabled={isUploading} className="bg-primary hover:bg-primary/80 rounded-full w-9 h-9">
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                      </Button>
                    </motion.div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
