import UserAvatar from '@/components/UserAvatar'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Home, MessageCircle, Play, PlusCircle, User, Users } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import React from 'react'

const BottomNavItem = ({ icon: Icon, path, isActive, children }: { icon: React.ElementType, path: string, isActive: boolean, children: React.ReactNode }) => (
  <Link href={path}>
    <div className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200 py-1 min-w-[60px]">
      <motion.div whileTap={{ scale: 0.9 }} className="p-2">
        {children || (
          <Icon
            className={cn('h-6 w-6', isActive && 'text-primary')}
            strokeWidth={isActive ? 2.5 : 2}
          />
        )}
      </motion.div>
      {isActive && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 bg-primary rounded-full"
        />
      )}
    </div>
  </Link>
)

export default function BottomNav() {
  const { user } = useAuth()
  const [location] = useLocation()

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Play, label: 'Reels', path: '/reels' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const isCreateActive = location.startsWith('/create') || location.startsWith('/create-video')

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            let isActive: boolean
            if (item.path === '/home') {
              isActive = location === '/home' || location === '/'
            } else if (item.path === '/reels') {
              isActive = location.startsWith('/reels') || location.startsWith('/videos')
            } else {
              isActive = location.startsWith(item.path)
            }

            if (item.label === 'Profile') {
              return (
                <BottomNavItem key={item.path} path={item.path} isActive={isActive}>
                  <UserAvatar
                    userId={user?.id}
                    src={user?.avatar_url}
                    name={user?.username || ''}
                    size="sm"
                    enableProfileCard={true}
                    className={cn(
                      'h-7 w-7 transition-all ring-offset-background',
                      isActive && 'ring-2 ring-primary ring-offset-2'
                    )}
                  />
                </BottomNavItem>
              )
            }

            return (
              <BottomNavItem
                key={item.path}
                icon={item.icon}
                path={item.path}
                isActive={isActive}
              />
            )
          })}
        </div>
      </nav>

      <Link href="/create">
        <div className="fixed bottom-24 right-5 z-50 md:hidden">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-full gradient-orange text-white shadow-lg shadow-primary/40 transition-all duration-300',
              isCreateActive && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
            )}
          >
            <PlusCircle className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
        </div>
      </Link>
    </>
  )
}
