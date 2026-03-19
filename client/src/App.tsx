import { OnboardingTour } from '@/components/App/OnboardingTour'
import BottomNav from '@/components/BottomNav'
import CommunityPage from '@/components/Community/CommunityPage'
import DiscoverCommunitiesPage from '@/components/Community/DiscoverCommunities'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import NavigationRail from '@/components/layout/NavigationRail'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useIsMobile } from '@/hooks/use-mobile'
import AboutPage from '@/pages/About'
import Auth from '@/pages/Auth'
import CommunitiesPage from '@/pages/Communities'
import ContactPage from '@/pages/Contact'
import Create from '@/pages/Create'
import CreateVideo from '@/pages/CreateVideo'
import E2EHarness from '@/pages/E2EHarness'
import EditProfile from '@/pages/EditProfile'
import FAQPage from '@/pages/FAQ'
import ForgotPassword from '@/pages/ForgotPassword'
import Home from '@/pages/Home'
import LegalPage from '@/pages/Legal'
import Messages from '@/pages/Messages'
import NearBy from '@/pages/NearBy'
import Notifications from '@/pages/Notifications'
import Profile from '@/pages/Profile'
import ResetPassword from '@/pages/ResetPassword'
import Search from '@/pages/Search'
import Settings from '@/pages/Settings'
import VerificationRequest from '@/pages/VerificationRequest'
import VerifyOTP from '@/pages/VerifyOTP'
import Videos from '@/pages/Videos'
import NotFound from '@/pages/not-found'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { queryClient } from './lib/queryClient'

const TOUR_STORAGE_KEY = 'onboardingTourCompleted'

function Router() {
  const { user, loading } = useAuth()
  const [location] = useLocation()

  const publicPaths = [
    '/auth',
    '/forgot-password',
    '/verify-otp',
    '/reset-password',
    '/legal',
    '/contact',
    '/faq',
    '/about',
  ]
  if (process.env.NODE_ENV !== 'production') {
    publicPaths.push('/__e2e__')
  }
  const isPublicPath = publicPaths.includes(location)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1D21]">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    )
  }

  if (!user && !isPublicPath) {
    return <Auth />
  }

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-otp" component={VerifyOTP} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/legal" component={LegalPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/reels" component={Videos} />
      <Route path="/search" component={Search} />
      <Route path="/create" component={Create} />
      <Route path="/create-video" component={CreateVideo} />
      <Route path="/videos" component={Videos} />
      <Route path="/messages" component={Messages} />
      <Route path="/communities/discover" component={DiscoverCommunitiesPage} />
      <Route path="/communities" component={CommunitiesPage} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/profile" component={Profile} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route path="/settings" component={Settings} />
      <Route path="/verify" component={VerificationRequest} />
      <Route path="/nearby" component={NearBy} />
      <Route path="/communities/:id" component={CommunityPage} />
      <Route component={NotFound} />
    </Switch>
  )
}

function AppContent() {
  const { user } = useAuth()
  const [location] = useLocation()
  const isMobile = useIsMobile()
  const [tourEnabled, setTourEnabled] = useState(false)

  useEffect(() => {
    if (user) {
      const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
      if (tourCompleted !== 'true') {
        setTourEnabled(true)
      }
    }
  }, [user])

  const handleTourExit = () => {
    setTourEnabled(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }

  const isCommunitiesPage = location.startsWith('/communities')
  const showMobileNav = user && isMobile

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {user && !isMobile && (isCommunitiesPage ? <NavigationRail /> : <Sidebar />)}
      <div className="flex-1 flex flex-col min-h-0">
        {showMobileNav && <TopNav />}
        <main className={`flex-1 overflow-y-auto ${showMobileNav ? 'pt-14 pb-16' : ''}`}>
          <Router />
        </main>
        {showMobileNav && <BottomNav />}
      </div>
      {user && <OnboardingTour enabled={tourEnabled} onExit={handleTourExit} />}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
