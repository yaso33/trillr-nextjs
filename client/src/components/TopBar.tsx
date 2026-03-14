import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfiles'
import { useRTL } from '@/hooks/useRTL'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Bell, Home, MessageCircle, PlusCircle, Search, Users, Video } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import tinarLogo from '/tinar_logo.svg'
import ThemeToggleButton from './ThemeToggleButton'

const NavButton = ({ icon: Icon, label, href, isActive, className }: any) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
    <Link href={href}>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'h-9 w-9 md:h-10 md:w-10 rounded-full transition-all duration-300',
          isActive
            ? 'bg-primary/20 text-primary shadow-md shadow-primary/20'
            : 'hover:bg-primary/10 text-foreground/70 hover:text-foreground'
        )}
        title={label}
      >
        <Icon className="h-5 w-5" />
      </Button>
    </Link>
    {isActive && (
      <motion.div
        layoutId="indicator"
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    )}
  </motion.div>
)

export default function TopBar() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const isRTL = useRTL()
  const [location] = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div
          className={`flex h-14 md:h-16 items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Link href="/home">
              <div
                className={`flex items-center gap-2 cursor-pointer group ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={tinarLogo}
                  loading="eager"
                  alt="Logo"
                  className="h-8 w-8 md:h-9 md:w-9 object-contain transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]"
                />
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden md:block flex-1"
          >
            <Link href="/search">
              <div
                className={`relative w-64 lg:w-80 group ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}
              >
                <Search
                  className={`absolute h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2`}
                />
                <Input
                  placeholder={isRTL ? 'ابحث...' : 'Search...'}
                  className={`h-10 ${isRTL ? 'pr-11 text-right' : 'pl-11 text-left'} bg-muted/50 border border-border/30 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full transition-all cursor-pointer`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  readOnly
                  data-testid="input-search"
                />
              </div>
            </Link>
          </motion.div>

          <motion.div
            className={`flex items-center gap-2 md:gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            <ThemeToggleButton />

            <div className="hidden md:flex gap-1 items-center">
              <NavButton icon={Home} label="Home" href="/home" isActive={location === '/home'} />
              <NavButton
                icon={MessageCircle}
                label="Messages"
                href="/messages"
                isActive={location === '/messages' || location.startsWith('/messages')}
              />
              <NavButton
                icon={Users}
                label="Communities"
                href="/communities"
                isActive={location === '/communities'}
              />
              <NavButton
                icon={Video}
                label="Videos"
                href="/"
                isActive={location === '/' || location === '/videos'}
              />
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/create">
                <div
                  className={cn(
                    'relative inline-block p-2 rounded-full transition-all duration-300',
                    location === '/create'
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-primary hover:bg-primary/10'
                  )}
                >
                  <PlusCircle className="h-5 w-5" />
                  {location === '/create' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>

            <NavButton
              icon={Bell}
              label="Notifications"
              href="/notifications"
              isActive={location === '/notifications'}
            />

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link href="/profile">
                <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
                    alt={profile?.username || 'Profile'}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs md:text-sm font-semibold">
                    {profile?.username?.slice(0, 2).toUpperCase() ||
                      user?.email?.slice(0, 2).toUpperCase() ||
                      'ME'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
