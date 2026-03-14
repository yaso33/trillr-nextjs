import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'
import { Bell, Search } from 'lucide-react'
import { Link, useLocation } from 'wouter'

const TopNavItem = ({ href, icon: Icon, isActive }) => (
  <Link
    href={href}
    className={cn(
      'flex items-center justify-center h-12 w-12 rounded-full text-muted-foreground transition-colors duration-200 hover:bg-muted',
      isActive && 'text-primary bg-primary/10'
    )}
  >
    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
  </Link>
)

export default function TopNav() {
  const [location] = useLocation()

  const navItems = [
    { href: '/search', icon: Search },
    { href: '/notifications', icon: Bell },
  ]

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center h-14 max-w-lg mx-auto px-2 sm:px-4">
        <Link href="/home">
          <a className="px-2">
            <Logo className="h-8 w-auto" />
          </a>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <TopNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={location.startsWith(item.href)}
            />
          ))}
        </nav>
      </div>
    </header>
  )
}
