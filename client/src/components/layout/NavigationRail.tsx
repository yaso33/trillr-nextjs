import { Skeleton } from '@/components/ui/skeleton' // For loading state
import { useCommunities } from '@/hooks/useCommunities' // Corrected path
import React from 'react'

/**
 * The NavigationRail is the primary navigation component for Communities.
 * It is now a dynamic component that fetches and displays the user's communities.
 */
const NavigationRail = () => {
  const { data: communities, isLoading, error } = useCommunities()

  // Handle loading and error states
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="h-screen w-20 bg-[#1A1D21] flex flex-col items-center justify-center text-white text-center text-xs p-2">
        <p>Error loading worlds</p>
      </div>
    )
  }

  // Create a static "Home" entry for DMs or a home page concept
  const homeEntry = { id: 'home', name: 'Home', icon: '🏠', type: 'home' }

  return (
    <nav className="h-screen w-20 bg-[#1A1D21] flex flex-col items-center pt-4 pb-2 space-y-3">
      {/* Static Home Icon */}
      <ServerIcon server={homeEntry} />

      {/* Separator */}
      <div className="w-8 h-0.5 bg-[#313439] rounded-full" />

      {/* Dynamic Server List from API */}
      <div className="flex flex-col items-center space-y-3">
        {communities?.map((community: any) => (
          <ServerIcon key={community.id} server={community} />
        ))}
      </div>
    </nav>
  )
}

// Sub-component for individual server icons.
const ServerIcon = ({ server }: { server: any }) => {
  // Use the community's image if available, otherwise fallback to the first letter of its name.
  const iconContent = server.icon ? (
    <span className="relative z-10 text-2xl">{server.icon}</span>
  ) : server.image_url ? (
    <img src={server.image_url} alt={server.name} className="w-full h-full object-cover" />
  ) : (
    <span className="relative z-10 font-bold text-lg">{server.name?.charAt(0).toUpperCase()}</span>
  )

  return (
    <div className="relative group">
      <a
        href={server.id === 'home' ? '/messages' : `/communities/${server.id}`}
        className="
          w-14 h-14 flex items-center justify-center overflow-hidden
          bg-[#313439] hover:bg-[#5865F2]
          text-white
          rounded-2xl hover:rounded-xl
          transition-all duration-200 ease-in-out
          cursor-pointer
        "
      >
        {/* Glow effect for potential live events */}
        {server.live && (
          <div className="absolute inset-0 bg-[#2D7D46] rounded-xl blur-md animate-pulse opacity-80" />
        )}
        {iconContent}
      </a>

      {/* Notification Badge */}
      {server.notification && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-4 border-[#1A1D21] flex items-center justify-center text-xs font-bold text-white" />
      )}

      {/* Tooltip */}
      <div
        className="
          absolute left-full ml-4 px-3 py-1.5
          bg-[#111214] text-white text-sm font-semibold
          rounded-md whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          pointer-events-none z-20
        "
      >
        {server.name}
      </div>
    </div>
  )
}

// A skeleton loader to match the layout and provide a good UX.
const LoadingSkeleton = () => {
  return (
    <nav className="h-screen w-20 bg-[#1A1D21] flex flex-col items-center pt-4 pb-2 space-y-3">
      <Skeleton className="w-14 h-14 rounded-2xl bg-[#313439]" />
      <div className="w-8 h-0.5 bg-[#313439] rounded-full" />
      <div className="flex flex-col items-center space-y-3">
        <Skeleton className="w-14 h-14 rounded-2xl bg-[#313439]" />
        <Skeleton className="w-14 h-14 rounded-2xl bg-[#313439]" />
        <Skeleton className="w-14 h-14 rounded-2xl bg-[#313439]" />
      </div>
    </nav>
  )
}

export default NavigationRail
