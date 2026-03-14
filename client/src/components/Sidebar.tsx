import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useProfile } from '@/hooks/useProfiles'
import { cn } from '@/lib/utils'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Crown,
  Home,
  MessageCircle,
  Moon,
  Play,
  PlusCircle,
  Search,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'wouter'
import Logo from './Logo'
import { ProfileHoverCard } from './ProfileHoverCard'
import UserAvatar from './UserAvatar'

const COLLAPSED_WIDTH = '80px'
const EXPANDED_WIDTH = '260px'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar.collapsed') === '1'
    } catch (e) {
      return false
    }
  })
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { data: profile } = useProfile(user?.id)

  const applyCssWidth = useCallback((isCollapsed: boolean) => {
    const width = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
    document.documentElement.style.setProperty('--sidebar-width', width)
  }, [])

  useEffect(() => {
    applyCssWidth(collapsed)
    try {
      localStorage.setItem('sidebar.collapsed', collapsed ? '1' : '0')
    } catch (e) {}
  }, [collapsed, applyCssWidth])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setCollapsed((s) => !s)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <aside
      data-tour="sidebar"
      aria-expanded={!collapsed}
      className={cn(
        'h-screen z-40 p-3 bg-card backdrop-blur-lg border-r border-card-border flex flex-col gap-3 transition-all duration-200 ease-out flex-shrink-0 rounded-r-2xl shadow-md',
        'dark:bg-card dark:border-card-border'
      )}
      role="navigation"
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
    >
      <div className="flex items-center gap-2 p-2">
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex flex-col gap-2 mt-2">
        {(() => {
          const [location] = useLocation()
          const items = [
            { href: '/home', icon: Home, label: 'Home' },
            { href: '/reels', icon: Play, label: 'Reels' },
            { href: '/messages', icon: MessageCircle, label: 'Messages' },
            { href: '/search', icon: Search, label: 'Search' },
            { href: '/communities', icon: Users, label: 'Communities' },
            { href: '/notifications', icon: Bell, label: 'Notifications' },
          ];

          // premium users get a special link
          if (user?.isPremium) {
            items.push({ href: '/premium', icon: Crown, label: 'Premium' });
          }

          return items.map(({ href, icon: Icon, label }) => {
            const isActive = location === href || location.startsWith(`${href}/`)
            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'group flex items-center gap-3 justify-start w-full px-2 py-1 h-12 rounded-lg',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                      : 'hover:bg-primary/10 text-primary-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  {!collapsed && <span className="font-semibold text-sm truncate">{label}</span>}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary" />
                  )}
                </Button>
              </Link>
            )
          })
        })()}
      </nav>

      <div className="mt-4" data-tour="new-post">
        <Link href="/create">
          <Button variant="default" className="w-full h-12 flex items-center justify-center gap-2">
            <PlusCircle className="h-6 w-6 shrink-0" />
            {!collapsed && <span className="font-semibold text-sm">Create</span>}
          </Button>
        </Link>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Separator />

        <div
          data-tour="profile"
          className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}
        >
          {user && profile && (
            <ProfileHoverCard userId={user.id}>
              <div className="flex items-center gap-2 overflow-hidden p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer w-full">
                <UserAvatar
                  src={profile.avatar_url}
                  name={profile.username || 'User'}
                  size="md"
                  userId={user.id}
                  enableProfileCard
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {profile.full_name || profile.username}
                    </p>
                  </div>
                )}
              </div>
            </ProfileHoverCard>
          )}

          {!collapsed && (
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 flex-1 justify-center h-10"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((s) => !s)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-full hover:bg-primary/10 flex-1 justify-center h-10"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
