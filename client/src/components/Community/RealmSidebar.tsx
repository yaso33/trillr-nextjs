import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCommunityRole } from '@/hooks/useCommunityRole'
import { motion } from 'framer-motion'
import { Plus, Settings } from 'lucide-react'
import React, { useState } from 'react'
import RealmSettings from './RealmSettings'

interface Community {
  id: string
  name: string
}

interface RealmSidebarProps {
  communities: Community[]
  selectedCommunity: Community | null
  onSelectCommunity: (community: Community) => void
  onDiscoverClick: () => void
}

export default function RealmSidebar({
  communities,
  selectedCommunity,
  onSelectCommunity,
  onDiscoverClick,
}: RealmSidebarProps) {
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const { role } = useCommunityRole(selectedCommunity?.id)

  return (
    <>
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-16 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-4 space-y-2"
      >
        {communities.map((community: Community) => {
          if (selectedCommunity?.id === community.id) {
            return (
              <DropdownMenu key={community.id}>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all bg-primary/20 shadow-lg shadow-primary/50"
                    title={community.name}
                  >
                    <span className="text-lg font-bold">
                      {community.name.slice(0, 1).toUpperCase()}
                    </span>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right">
                  {(role === 'owner' || role === 'moderator') && (
                    <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Realm Settings</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          return (
            <motion.div
              key={community.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all bg-white/10 hover:bg-white/20"
              onClick={() => onSelectCommunity(community)}
              title={community.name}
            >
              <span className="text-lg font-bold">{community.name.slice(0, 1).toUpperCase()}</span>
            </motion.div>
          )
        })}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          onClick={onDiscoverClick}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.div>

      <RealmSettings isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
