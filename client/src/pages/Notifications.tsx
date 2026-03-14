
import NotificationsPanel from '@/components/NotificationsPanel';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertCircle, Bell, BellRing, Check, GitMerge, MessageSquare, UserPlus, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const NOTIFICATION_TYPES = [
  { id: 'all', label: 'All', icon: <BellRing size={16} /> },
  { id: 'follow', label: 'Follows', icon: <UserPlus size={16} /> },
  { id: 'comment', label: 'Comments', icon: <MessageSquare size={16} /> },
  { id: 'mention', label: 'Mentions', icon: <Users size={16} /> },
  // Add other types as needed
];

export default function Notifications() {
  const { data: rawNotifications, isLoading, error } = useNotifications();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const [activeFilter, setActiveFilter] = useState('all');

  const notifications = useMemo(() => {
    if (!rawNotifications) return [];
    return rawNotifications.map((n: any) => ({ // Ensure proper typing for n
        id: n.id,
        type: n.type,
        user: n.profiles ? { 
            name: n.profiles.full_name || n.profiles.username || 'Someone',
            username: n.profiles.username,
            avatar: n.profiles.avatar_url || undefined,
        } : { name: 'Unknown', username: 'unknown', avatar: undefined },
        message: n.content,
        timestamp: n.created_at,
        isRead: n.read,
        postId: n.post_id, // assuming post_id is available
    }));
  }, [rawNotifications]);

  const groupedNotifications = useMemo(() => {
    const grouped = notifications.reduce((acc: any, notif: any) => {
        const key = `${notif.type}_${notif.postId || notif.id}`;
        if (!acc[key]) {
            acc[key] = { ...notif, users: [notif.user], count: 1 };
        } else {
            acc[key].users.push(notif.user);
            acc[key].count += 1;
        }
        return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return groupedNotifications;
    return groupedNotifications.filter((n: any) => n.type === activeFilter);
  }, [groupedNotifications, activeFilter]);

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const hasUnread = useMemo(() => notifications.some(n => !n.isRead), [notifications]);

  const renderContent = () => {
    if (isLoading) return <StateDisplay icon={<div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />} text="Loading Notifications..." />;
    if (error) return <StateDisplay icon={<AlertCircle size={40} />} text={`Error: ${error.message}`} />;
    if (filteredNotifications.length === 0) return <StateDisplay icon={<Bell size={40} />} text={activeFilter === 'all' ? "You're all caught up!" : "No notifications of this type."} />;

    return <NotificationsPanel notifications={filteredNotifications} onMarkAsRead={handleMarkAsRead} />;
  };

  return (
    <div className="h-full w-full bg-background text-foreground font-sans antialiased overflow-hidden relative">
      <div className="absolute inset-0 -z-20 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-blue-900/30 animate-pulse-slow"/>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 h-full flex flex-col">
        <header className="flex justify-between items-center py-4 flex-shrink-0">
            <h1 className="text-3xl font-bold tracking-tight text-foreground filter drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]">Action Center</h1>
            {hasUnread && 
              <motion.button 
                whileHover={{scale: 1.05}} whileTap={{scale:0.95}}
                onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/10 border border-card-border text-sm text-foreground/70 hover:bg-card/20 transition-colors">
                  <Check size={16}/> Mark all as read
              </motion.button>}
        </header>
        
        <div className="flex-shrink-0 border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 p-1 bg-card/10 rounded-lg">
                {NOTIFICATION_TYPES.map(type => (
                    <button key={type.id} onClick={() => setActiveFilter(type.id)} className={cn(
                        "flex-1 py-2 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                        activeFilter === type.id ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]" : "text-foreground/50 hover:bg-card/20"
                    )}>
                        {type.icon}{type.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}

const StateDisplay = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex flex-col items-center justify-center h-full text-center text-white/50 space-y-4 p-8">
        <div className="text-primary filter drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">{icon}</div>
        <p>{text}</p>
    </motion.div>
);
