
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useFollowUser, useIsFollowing, useSearchProfiles } from "@/hooks/useProfiles";
import { useDiscoverCommunities } from "@/hooks/useCommunities"; // Placeholder for community search
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Users, Globe, Loader2, UserPlus, Check } from "lucide-react";
import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults, isLoading: searchLoading } = useSearchProfiles(debouncedQuery, debouncedQuery.length > 0);
  
  // Using discover as a placeholder for community search API
  const { data: allCommunities, isLoading: communitiesLoading } = useDiscoverCommunities(
    '',
    1,
    50, // Fetch a good number to filter from
    debouncedQuery.length > 0
  );

  const filteredCommunities = useMemo(() => {
    if (!debouncedQuery) return [];
    return allCommunities.filter((c: any) => c.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [allCommunities, debouncedQuery]);

  const isLoading = searchLoading || communitiesLoading;

  return (
    <div className="h-full w-full bg-background text-foreground font-sans antialiased overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-0 left-0 w-full h-full bg-background">
          <div className="absolute top-[15%] left-[20%] w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-[15%] right-[20%] w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-blob animation-delay-3000" />
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto p-4 pt-16 md:pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/30 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for users and communities..."
            className="w-full h-16 pl-16 pr-6 text-xl bg-card/10 backdrop-blur-sm border border-card-border focus:ring-2 focus:ring-primary/50 focus:border-primary rounded-2xl text-foreground placeholder:text-foreground/30 transition-all duration-300"
          />
          {isLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 animate-spin" />}
        </motion.div>

        <AnimatePresence>
          {debouncedQuery && (searchResults || filteredCommunities) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 space-y-6 text-left"
            >
              {searchResults && searchResults.length > 0 && (
                <SearchResultCategory icon={<Users size={18} />} title="Users">
                  {searchResults.map((user: any) => <UserSearchResultItem key={user.id} user={user} />)}
                </SearchResultCategory>
              )}

              {filteredCommunities && filteredCommunities.length > 0 && (
                <SearchResultCategory icon={<Globe size={18} />} title="Communities">
                  {filteredCommunities.map((community: any) => <CommunitySearchResultItem key={community.id} community={community} />)}
                </SearchResultCategory>
              )}
            </motion.div>
          )}
        </AnimatePresence>

         {!isLoading && debouncedQuery && searchResults?.length === 0 && filteredCommunities?.length === 0 && (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-16 text-white/40">
                <p>No results found for "{debouncedQuery}".</p>
            </motion.div>
         )}

      </div>
    </div>
  );
}

const SearchResultCategory = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <section>
    <div className="flex items-center gap-3 mb-3 px-2">
      <div className="text-white/40">{icon}</div>
      <h2 className="text-lg font-bold text-white/80 tracking-wide">{title}</h2>
    </div>
    <div className="space-y-2">{children}</div>
  </section>
);

function UserSearchResultItem({ user }: { user: any }) {
  const { data: isFollowing, isLoading: isFollowingLoading } = useIsFollowing(user.id);
  const followMutation = useFollowUser();
  const [, setLocation] = useLocation();

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    followMutation.mutateAsync({ userId: user.id, isFollowing: !!isFollowing });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={() => setLocation(`/profile/${user.username}`)}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 cursor-pointer group"
    >
      <Avatar className="h-12 w-12 bg-card/20 border border-card-border">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/30 text-white">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">{user.username}</h3>
        {user.full_name && <p className="text-sm text-white/50 truncate">{user.full_name}</p>}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleFollow}
        disabled={isFollowingLoading || followMutation.isPending}
        className={cn(
          "rounded-lg px-4 transition-all",
          isFollowing 
            ? "text-primary bg-primary/10 hover:bg-primary/20"
            : "text-foreground/60 bg-card/10 hover:bg-card/20"
        )}
      >
        {isFollowing ? <Check size={16} /> : <UserPlus size={16} />}
        <span className="ml-2">{isFollowing ? 'Following' : 'Follow'}</span>
      </Button>
    </motion.div>
  );
}

function CommunitySearchResultItem({ community }: { community: any }) {
  return (
    <Link href={`/communities/${community.id}`}>
      <motion.a
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center gap-4 p-3 rounded-xl hover:bg-card/20 transition-colors duration-200 cursor-pointer group"
      >
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full bg-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">{community.name}</h3>
            <p className="text-sm text-white/50 truncate">{community.member_count || 0} members</p>
        </div>
      </motion.a>
    </Link>
  )
}
