
import OptimizedImage from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useJoinCommunity, useLeaveCommunity } from "@/hooks/useCommunities";
import { ErrorLogger } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";
import { Check, LogIn, Users } from "lucide-react";
import React from "react";
import { useLocation } from "wouter";

interface CommunityCardProps {
  community: any;
  isMember: boolean;
  layout?: "default" | "tooltip";
  className?: string;
}

export default function CommunityCard({ community, isMember, layout = "default", className }: CommunityCardProps) {
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleAction = async (e: React.MouseEvent, action: 'join' | 'leave') => {
    e.stopPropagation();
    if (!user) return alert('Please sign in to join or leave communities');
    if (isProcessing) return;
    
    setIsProcessing(true);
    const mutation = action === 'join' ? joinMutation : leaveMutation;
    try {
      await mutation.mutateAsync({ communityId: community.id });
    } catch (err) {
      ErrorLogger.log(`${action} error`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (layout === 'tooltip') {
    return (
      <div className={cn("flex flex-col gap-3 text-white font-sans", className)}>
        <h3 className="text-lg font-bold text-white filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] truncate">
          {community.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>{community.member_count || 0} members</span>
            </div>
            {isMember && (
                <div className="flex items-center gap-1.5 text-primary font-semibold filter drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]">
                    <Check size={16} />
                    <span>Member</span>
                </div>
            )}
        </div>

        <p className="text-sm text-white/80 line-clamp-1">
          {community.description || 'A new hub in the constellation.'}
        </p>

        <div className="mt-2">
          {isMember ? (
            <Button
              onClick={(e) => handleAction(e, 'leave')}
              disabled={isProcessing}
              variant="ghost"
              size="sm"
              className="w-full text-center text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-lg"
            >
              {isProcessing ? 'Leaving...' : 'Leave Hub'}
            </Button>
          ) : (
            <Button
              onClick={(e) => handleAction(e, 'join')}
              disabled={isProcessing}
              variant="ghost"
              size="sm"
              className="w-full text-center text-primary/90 hover:bg-primary/10 hover:text-primary rounded-lg"
            >
              {isProcessing ? 'Joining...' : 'Join Hub'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default Card Layout (old style)
  const handleNavigation = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setLocation(`/communities/${community.id}`);
  };

  return (
    <div
      className={cn("bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full", className)}
      onClick={handleNavigation}
    >
      <div className="relative h-28 bg-muted">
        <OptimizedImage src={community.banner_url || `https://source.unsplash.com/random/400x200?community&sig=${community.id}`} alt={`${community.name} banner`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-4 flex flex-col">
        <h4 className="text-lg font-bold truncate text-card-foreground">{community.name}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2 h-10 my-2 flex-grow">
          {community.description || 'No description provided.'}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" /><span>{community.members_count || 0} members</span></div>
          {isMember ? (
            <Button onClick={(e) => handleAction(e, 'leave')} disabled={isProcessing} variant="outline" size="sm">{isProcessing ? 'Leaving...' : 'Leave'}</Button>
          ) : (
            <Button onClick={(e) => handleAction(e, 'join')} disabled={isProcessing} size="sm"><LogIn className="w-4 h-4 mr-2" />{isProcessing ? 'Joining...' : 'Join'}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
