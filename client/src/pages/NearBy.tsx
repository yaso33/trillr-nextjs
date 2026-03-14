import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { calculateDistance, formatDistance, useGeolocation } from '@/hooks/useGeolocation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  ChevronLeft,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Radar,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

interface NearbyUser {
  id: string
  username: string
  fullName: string
  avatar: string | null
  bio: string | null
  distance: number
  isVerified: boolean
  isFollowing: boolean
  mutualFollowers: number
}

const mockNearbyUsers: NearbyUser[] = [
  {
    id: '1',
    username: 'sara_design',
    fullName: 'Sara Ahmed',
    avatar: null,
    bio: 'UI/UX Designer',
    distance: 0.5,
    isVerified: true,
    isFollowing: false,
    mutualFollowers: 12,
  },
  {
    id: '2',
    username: 'mohammed_dev',
    fullName: 'Mohammed Ali',
    avatar: null,
    bio: 'Full Stack Developer',
    distance: 1.2,
    isVerified: false,
    isFollowing: true,
    mutualFollowers: 5,
  },
  {
    id: '3',
    username: 'layla_photo',
    fullName: 'Layla Hassan',
    avatar: null,
    bio: 'Photographer',
    distance: 2.8,
    isVerified: true,
    isFollowing: false,
    mutualFollowers: 23,
  },
  {
    id: '4',
    username: 'ahmed_fit',
    fullName: 'Ahmed Khalil',
    avatar: null,
    bio: 'Fitness Coach',
    distance: 3.5,
    isVerified: false,
    isFollowing: false,
    mutualFollowers: 8,
  },
  {
    id: '5',
    username: 'nour_art',
    fullName: 'Nour Ibrahim',
    avatar: null,
    bio: 'Digital Artist',
    distance: 4.2,
    isVerified: false,
    isFollowing: false,
    mutualFollowers: 3,
  },
]

export default function NearBy() {
  const { user } = useAuth()
  const { isRTL } = useLanguage()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const { latitude, longitude, loading, error, requestLocation } = useGeolocation()
  const [radius, setRadius] = useState([5])
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (latitude && longitude) {
      searchNearby()
    }
  }, [latitude, longitude, radius])

  const searchNearby = async () => {
    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const filtered = mockNearbyUsers.filter((u) => u.distance <= radius[0])
    setNearbyUsers(filtered)
    setIsSearching(false)
  }

  const handleFollow = (userId: string) => {
    setNearbyUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u))
    )
    toast({
      title: isRTL ? 'تم!' : 'Done!',
      description: isRTL ? 'تم تحديث المتابعة' : 'Follow status updated',
    })
  }

  return (
    <div className="h-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <ScrollArea className="h-full">
        <div className="w-full max-w-2xl mx-auto p-4 pb-24 md:pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {isRTL ? 'اكتشف القريبين' : 'Discover Nearby'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'اعثر على أشخاص بالقرب منك' : 'Find people near you'}
                </p>
              </div>
            </div>
          </div>

          {!latitude && !loading && (
            <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Navigation className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {isRTL ? 'تفعيل الموقع' : 'Enable Location'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isRTL
                    ? 'نحتاج إذنك للوصول إلى موقعك للعثور على أشخاص قريبين'
                    : 'We need your permission to access your location to find nearby people'}
                </p>
                <Button onClick={requestLocation} className="gradient-primary" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  {isRTL ? 'تفعيل الموقع' : 'Enable Location'}
                </Button>

                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
              </CardContent>
            </Card>
          )}

          {latitude && longitude && (
            <>
              <Card className="border-primary/20 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Radar className="w-5 h-5 text-primary" />
                      <span className="font-medium">{isRTL ? 'نطاق البحث' : 'Search Radius'}</span>
                    </div>
                    <span className="text-primary font-bold">{radius[0]} km</span>
                  </div>
                  <Slider
                    value={radius}
                    onValueChange={setRadius}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isRTL
                      ? `${nearbyUsers.length} شخص قريب`
                      : `${nearbyUsers.length} people nearby`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={searchNearby}
                  disabled={isSearching}
                  className="gap-2"
                >
                  <RefreshCw className={cn('w-4 h-4', isSearching && 'animate-spin')} />
                  {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 animate-ping absolute" />
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Radar className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    {isRTL ? 'جاري البحث...' : 'Searching...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyUsers.map((person, index) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                                <AvatarImage src={person.avatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                                  {person.fullName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {person.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                  <BadgeCheck className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold truncate">{person.fullName}</span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                @{person.username}
                              </p>
                              {person.bio && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {person.bio}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-primary flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {formatDistance(person.distance)}
                                </span>
                                {person.mutualFollowers > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {person.mutualFollowers} {isRTL ? 'متابع مشترك' : 'mutual'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-9 w-9"
                                onClick={() => setLocation('/messages')}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={person.isFollowing ? 'outline' : 'default'}
                                size="sm"
                                className={cn(
                                  'rounded-full h-9',
                                  !person.isFollowing && 'gradient-primary'
                                )}
                                onClick={() => handleFollow(person.id)}
                              >
                                {person.isFollowing ? (
                                  isRTL ? (
                                    'متابَع'
                                  ) : (
                                    'Following'
                                  )
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    {isRTL ? 'متابعة' : 'Follow'}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {nearbyUsers.length === 0 && !isSearching && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        {isRTL
                          ? 'لا يوجد أشخاص قريبين في هذا النطاق'
                          : 'No people found in this range'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isRTL ? 'جرب زيادة نطاق البحث' : 'Try increasing the search radius'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
