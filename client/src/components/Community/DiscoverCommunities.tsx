import CommunityCard from '@/components/Community/CommunityCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useDiscoverCommunities } from '@/hooks/useCommunities'
import React from 'react'
import { Link } from 'wouter'

export default function DiscoverCommunitiesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = React.useState('')
  const {
    data: communities = [],
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useDiscoverCommunities(searchTerm, 1, 12)

  const userCommunityIds = new Set() // Assuming we get user's communities from a hook

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Communities</h1>
        <p className="text-muted-foreground mt-2">
          Find and join communities that match your interests.
        </p>
      </header>

      <div className="mb-6">
        <Input
          placeholder="Search for communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && <div className="text-center text-muted-foreground py-8">Loading...</div>}

      {!isLoading && communities.length === 0 && (
        <div className="text-center border-2 border-dashed border-border rounded-lg py-16">
          <p className="text-muted-foreground">No communities found.</p>
        </div>
      )}

      {communities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {communities.map((community: any) => (
            <Link key={community.id} href={`/communities/${community.id}`}>
              <a className="block transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg rounded-lg h-full">
                <CommunityCard
                  community={community}
                  isMember={userCommunityIds.has(community.id)}
                />
              </a>
            </Link>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-8 text-center">
          <Button onClick={() => fetchNextPage()} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}
