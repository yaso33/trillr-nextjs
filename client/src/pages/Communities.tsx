
import CommunityCard from "@/components/Community/CommunityCard";
import CreateCommunityDialog from "@/components/CreateCommunityDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities, useDiscoverCommunities } from "@/hooks/useCommunities";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "wouter";

const MotionLink = motion(Link);

export default function CommunitiesPage() {
  const { user } = useAuth();
  const { data: userCommunities = [], isLoading: isLoadingUserCommunities } = useCommunities();
  const { data: discoverCommunities = [], isLoading: isLoadingDiscover } = useDiscoverCommunities('', 1, 20); // Fetch more to populate the space

  const allCommunities = useMemo(() => {
    const communityMap = new Map();
    [...userCommunities, ...discoverCommunities].forEach((community: any) => {
      if (community) {
        communityMap.set(community.id, community);
      }
    });
    return Array.from(communityMap.values());
  }, [userCommunities, discoverCommunities]);

  const userCommunityIds = useMemo(() => new Set(userCommunities.map((c: any) => c.id)), [userCommunities]);

  // State to hold the community being hovered over
  const [hoveredCommunity, setHoveredCommunity] = useState<any>(null);

  const isLoading = isLoadingUserCommunities || isLoadingDiscover;

  return (
    <div className="h-full w-full bg-black text-white font-sans antialiased overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <div className="absolute top-[5%] left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-[5%] right-[10%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-transparent">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        >
          Community Constellation
        </motion.h1>
        <CreateCommunityDialog 
          trigger={
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300"
            >
              <Plus size={18} />
              Create Hub
            </motion.button>
          }
        />
      </header>

      <main className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-xl text-white/50">Loading Constellation...</div>
        )}

        {!isLoading && allCommunities.map((community: any, index: number) => {
            const isMember = userCommunityIds.has(community.id);
            // Generate semi-random, stable positions for stars
            const x = (parseInt(community.id.slice(-5), 16) % 80) + 10; // X position from 10% to 90%
            const y = (parseInt(community.id.slice(-10, -5), 16) % 80) + 10; // Y position from 10% to 90%
            const size = Math.max(12, Math.min(32, community.member_count / 10 || 15));
            
            return (
              <MotionLink
                href={`/communities/${community.id}`}
                key={community.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                onHoverStart={() => setHoveredCommunity({ ...community, x, y, size, isMember })}
                onHoverEnd={() => setHoveredCommunity(null)}
                className="absolute z-10 block"
                style={{ top: `${y}%`, left: `${x}%`, width: size, height: size }}
              >
                <motion.div
                  className={cn(
                    "w-full h-full rounded-full transition-all duration-300 flex items-center justify-center",
                    isMember ? "bg-primary/70 shadow-[0_0_15px_rgba(0,255,255,0.5)]" : "bg-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
                  )}
                  whileHover={{ scale: 1.5, shadow: isMember ? "0 0 30px rgba(0,255,255,0.8)" : "0 0 30px rgba(168,85,247,0.8)" }}
                />
              </MotionLink>
            );
          })}

        {/* Holographic Tooltip */}
        <AnimatePresence>
          {hoveredCommunity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute p-0.5 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 shadow-2xl shadow-black/50 pointer-events-none z-30"
              style={{
                top: `calc(${hoveredCommunity.y}% + ${hoveredCommunity.size / 2}px)`,
                left: `calc(${hoveredCommunity.x}% + ${hoveredCommunity.size / 2}px)`,
                transform: 'translate(1rem, -50%)', // Position it to the right of the star
              }}
            >
              <div className="bg-black/80 backdrop-blur-md rounded-lg p-4 w-64">
                <CommunityCard community={hoveredCommunity} isMember={hoveredCommunity.isMember} layout="tooltip" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// We need AnimatePresence for exit animations
import { AnimatePresence } from "framer-motion";
