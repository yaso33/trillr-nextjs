
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import UserAvatar from "./UserAvatar";

interface MessageBubbleProps {
  text: string;
  timestamp: string;
  isSent: boolean;
  senderName: string;
  imageUrl?: string;
}

export default function MessageBubble({ text, timestamp, isSent, senderName, imageUrl }: MessageBubbleProps) {
  const alignment = isSent ? "justify-end" : "justify-start";
  const bubbleColor = isSent 
    ? "bg-primary/20 border-primary/30 text-foreground"
    : "bg-card/10 border-card-border text-foreground/90";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex items-end gap-2", alignment)}
    >
      {!isSent && <UserAvatar name={senderName} size="sm" className="mb-7" />}
      
      <div className={cn("flex flex-col max-w-xs md:max-w-md", {"items-end": isSent, "items-start": !isSent})}>
        <div className={cn(
          "px-4 py-2 rounded-3xl border",
          isSent ? "rounded-br-lg" : "rounded-bl-lg",
          bubbleColor
        )}>
          {!isSent && <p className="text-xs font-bold text-primary mb-1">{senderName}</p>}
          {imageUrl && 
            <div className="mb-2 -mx-2 -mt-1 rounded-t-2xl overflow-hidden">
                <img src={imageUrl} alt="Chat image" className="max-w-full h-auto"/>
            </div>
          }
          {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
        </div>
        <p className="text-xs text-foreground/40 mt-1 px-2">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>

      {isSent && <UserAvatar name={senderName} size="sm" className="mb-7"/>}
    </motion.div>
  );
}
