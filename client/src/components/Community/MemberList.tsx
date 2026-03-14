import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import React from 'react'

interface Member {
  id: string
  status: 'online' | 'offline'
  profiles: {
    username: string
  } | null
}

interface MemberListProps {
  members: Member[]
}

export default function MemberList({ members }: MemberListProps) {
  const onlineMembers = members.filter((m) => m.status === 'online')
  const offlineMembers = members.filter((m) => m.status !== 'online')

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white/5 backdrop-blur-md border-l border-white/10 p-4"
    >
      {/* Online Members */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Online — ({onlineMembers.length})
        </h4>
        <div className="space-y-2">
          {onlineMembers.map((member: any) => (
            <div key={member.id} className="flex items-center p-2 rounded hover:bg-white/10">
              <div className="relative mr-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#020617] bg-green-500" />
              </div>
              <span className="text-sm">{member.profiles?.username || 'Unknown'}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-white/10 my-4" />

      {/* Offline Members */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Offline — ({offlineMembers.length})
        </h4>
        <div className="space-y-2">
          {offlineMembers.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center p-2 rounded hover:bg-white/10 opacity-50"
            >
              <div className="relative mr-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#020617] bg-gray-500" />
              </div>
              <span className="text-sm">{member.profiles?.username || 'Unknown'}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
