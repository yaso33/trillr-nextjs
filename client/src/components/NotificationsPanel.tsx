
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, AtSign, Heart, MessageCircle, UserPlus, Users, Video } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from 'date-fns';

const notificationIconConfig: any = {
  like: { icon: Heart, color: "#F472B6" }, // Pink
  comment: { icon: MessageCircle, color: "#60A5FA" }, // Blue
  follow: { icon: UserPlus, color: "#34D399" }, // Green
  mention: { icon: AtSign, color: "#FBBF24" }, // Amber
  video: { icon: Video, color: "#A78BFA" }, // Purple
  default: { icon: Users, color: "#9CA3AF" }, // Gray
};

const NotificationIcon = ({ type, count }: { type: string, count: number }) => {
  const { icon: Icon, color } = notificationIconConfig[type] || notificationIconConfig.default;
  const isPlural = count > 1;
  const FinalIcon = isPlural && type !== 'mention' ? Users : Icon;

  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative" style={{ backgroundColor: `${color}1A`, color }}>
      <FinalIcon size={20} />
      {isPlural && <span className="absolute -top-1 -right-1 text-xs bg-primary text-white rounded-full px-1.5 py-0.5">{count}</span>}
    </div>
  );
};

const NotificationItem = ({ notification, onMarkAsRead }: any) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [, setLocation] = useLocation();

  const { icon: Icon, color } = notificationIconConfig[notification.type] || notificationIconConfig.default;

  const handleClick = () => {
    onMarkAsRead?.(notification.id);
    // Add navigation logic later, e.g. to a post or profile
    if (notification.postId) {
        // setLocation(`/post/${notification.postId}`);
    }
  };

  const userDisplay = notification.users.slice(0, 2).map((u: any) => u.name).join(', ') + (notification.count > 2 ? ` and ${notification.count - 2} others` : '');
  const actionText = notification.count > 1 ? notification.type + 's on' : notification.type;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "w-full p-0.5 rounded-2xl relative transition-all duration-300",
        !notification.isRead && "bg-gradient-to-r from-primary/20 via-blue-500/10 to-transparent"
      )}
    >
      <div className="bg-card/60 backdrop-blur-md p-4 rounded-[15px] flex items-center gap-4">
        {!notification.isRead && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary filter shadow-[0_0_8px_rgba(0,255,255,0.8)]"/>}
        <NotificationIcon type={notification.type} count={notification.count} />

        <div className="flex-1 min-w-0">
          <p className="text-foreground/90 text-sm">
            <span className="font-bold text-foreground">{userDisplay}</span>
            <span className="text-foreground/60"> {notification.message}</span>
          </p>
          <p className="text-xs text-foreground/40 mt-1">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</p>
        </div>

        <AnimatePresence>
        {isHovered && (
            <motion.div initial={{opacity:0, x: 10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}}>
                <Button size="sm" variant="ghost" className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white" onClick={handleClick}>
                    View <ArrowRight size={14} className="ml-2"/>
                </Button>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function NotificationsPanel({ notifications, onMarkAsRead }: any) {
  if (!notifications) return null;

  return (
    <div className="space-y-3 pb-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification: any) => (
          <NotificationItem key={notification.id} notification={notification} onMarkAsRead={onMarkAsRead} />
        ))}
      </AnimatePresence>
    </div>
  );
}
