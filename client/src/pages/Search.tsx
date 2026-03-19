import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSearch, SearchResult } from '@/hooks/useSearch' // The only hook we need now!
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Debounce input to avoid excessive queries

  // A single, unified search hook!
  const { data: results, isLoading, isError } = useSearch(debouncedSearchTerm)

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search for people, posts, or communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-lg p-4"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <p className="text-center text-red-500">
          An error occurred during the search. Please try again.
        </p>
      )}

      {!isLoading && !isError && debouncedSearchTerm && (!results || results.length === 0) && (
        <p className="text-center text-gray-500 mt-10">No results found.</p>
      )}

      <div className="space-y-4">
        {results?.map((item) => (
          <SearchResultItem key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  )
}

// A component to render a single search result item, with navigation
function SearchResultItem({ item }: { item: SearchResult }) {
  const getLink = (item: SearchResult) => {
    switch (item.type) {
      case 'user':
        return `/u/${item.slug}`
      case 'community':
        return `/c/${item.slug}`
      case 'post':
        // Assuming post links are /posts/:id
        return `/post/${item.id}`
      default:
        return '#'
    }
  }

  return (
    <Link
      to={getLink(item)}
      className="flex items-center p-3 bg-card hover:bg-muted rounded-lg transition-colors duration-200"
    >
      <Avatar className="h-12 w-12 mr-4">
        <AvatarImage src={item.avatar_url || undefined} alt={item.title} />
        <AvatarFallback>{item.title.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <div className="flex items-center">
          <p className="font-semibold text-card-foreground">{item.title}</p>
          <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {item.type}
          </span>
        </div>
        {item.subtitle && <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>}
      </div>
    </Link>
  )
}
