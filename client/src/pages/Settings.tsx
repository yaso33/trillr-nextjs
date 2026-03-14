
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  LogOut,
  Palette,
  ShieldCheck,
  User,
} from 'lucide-react'
import { ComponentType, ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'wouter'

// --- Data Management (No UI logic here) ---
const SETTINGS_STORAGE_KEY = 'digital_line_settings'

interface UserSettings {
  notifications: { likes: boolean; comments: boolean; follows: boolean; messages: boolean }
  privacy: { privateAccount: boolean; allowTags: boolean }
  theme: 'dark' | 'light' | 'system'
}

const defaultSettings: UserSettings = {
  notifications: { likes: true, comments: true, follows: true, messages: true },
  privacy: { privateAccount: false, allowTags: true },
  theme: 'dark',
}

const loadSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch (error) {
    console.error('Failed to load settings:', error)
    return defaultSettings
  }
}

const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

// --- Main Settings Component ---
export default function Settings() {
  const { signOut } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [langDialogOpen, setLangDialogOpen] = useState(false)

  useEffect(() => {
    saveSettings(settings)
    // Enforce dark theme only
    document.body.classList.add('dark')
    document.body.classList.remove('light')
  }, [settings])

  const updateSetting = <K extends keyof UserSettings, V extends UserSettings[K]>(
    key: K,
    value: V
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogout = async () => {
    await signOut()
    setLocation('/auth')
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.' })
  }

  return (
    <div className="h-full bg-background text-foreground font-sans overflow-hidden">
       <div className="absolute inset-0 -z-20 bg-background" />
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 left-[10%] w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-3000" />
      </div>

      <ScrollArea className="h-full">
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 pb-24">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground">Settings</h1>
            <p className="text-foreground/60">Manage your account and preferences.</p>
          </header>

          <div className="space-y-8">
             <SettingsSection icon={User} title="Account">
                 <SettingsRow
                    icon={User}
                    label="Edit Profile"
                    onClick={() => setLocation('/edit-profile')}
                    control="navigate"
                 />
                 <SettingsRow
                    icon={ShieldCheck}
                    label="Request Verification"
                    onClick={() => toast({ title: 'Coming Soon!' })}
                    control="navigate"
                 />
            </SettingsSection>

            <SettingsSection icon={Bell} title="Notifications">
              {Object.keys(settings.notifications).map((key) => (
                <SettingsRow
                  key={key}
                  icon={Bell}
                  label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                  control={
                    <Switch
                      checked={settings.notifications[key as keyof typeof settings.notifications]}
                      onCheckedChange={(checked) =>
                        updateSetting('notifications', { ...settings.notifications, [key]: checked })
                      }
                    />
                  }
                />
              ))}
            </SettingsSection>

            <SettingsSection icon={Lock} title="Privacy & Security">
              <SettingsRow
                icon={Lock}
                label="Private Account"
                control={
                  <Switch
                    checked={settings.privacy.privateAccount}
                    onCheckedChange={(checked) =>
                      updateSetting('privacy', { ...settings.privacy, privateAccount: checked })
                    }
                  />
                }
              />
              <SettingsRow icon={ShieldCheck} label="Blocked Accounts" control="navigate" onClick={() => toast({title: 'Coming Soon!'})} />
            </SettingsSection>

            <SettingsSection icon={Palette} title="Appearance & Language">
                 <SettingsRow icon={Globe} label="Language" value="English" onClick={() => setLangDialogOpen(true)} control="navigate" />
            </SettingsSection>

             <SettingsSection icon={CreditCard} title="Subscription">
                 <SettingsRow icon={CreditCard} label="Manage Subscription" description="You are on the Premium plan" onClick={() => toast({title: 'Coming Soon!'})} control="navigate" />
            </SettingsSection>

            <div className="mt-12">
                 <h3 className="text-sm font-semibold text-red-500/80 uppercase tracking-wider mb-2 px-4">Danger Zone</h3>
                 <div className="bg-black/40 backdrop-blur-xl border border-red-500/20 rounded-2xl overflow-hidden">
                    <SettingsRow icon={LogOut} label="Sign Out" onClick={handleLogout} className="text-red-500/80 hover:bg-red-500/10" />
                 </div>
            </div>

             <p className="text-center text-sm text-foreground/40 pt-8">Trillr v1.0.0</p>

          </div>
        </div>
      </ScrollArea>

       <OptionsDialog open={langDialogOpen} onOpenChange={setLangDialogOpen} title="Select Language" options={[{label: 'English', value: 'en'}, {label: 'العربية', value: 'ar'}]} current={ 'en'} onSelect={() => {}} />
    </div>
  )
}

// --- Reusable UI Components ---
const SettingsSection = ({ icon: Icon, title, children }: { icon: ComponentType<{className?: string}>, title: string, children: ReactNode }) => (
    <div>
        <div className="flex items-center gap-3 mb-4 px-4">
            <Icon className="w-5 h-5 text-primary"/>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
        </div>
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {children}
        </div>
    </div>
);

const SettingsRow = ({
  icon: Icon,
  label,
  value,
  description,
  control,
  onClick,
  className
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value?: string
  description?: string
  control?: ReactNode | 'navigate'
  onClick?: () => void
  className?: string
}) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center p-4 min-h-[60px] border-b border-white/5 last:border-b-0 transition-colors",
      onClick && "hover:bg-white/5 cursor-pointer",
      className
    )}
  >
    <Icon className="w-5 h-5 mr-4 text-foreground/60" />
    <div className="flex-1">
      <p className="font-medium text-foreground">{label}</p>
      {value && <p className="text-sm text-foreground/50">{value}</p>}
      {description && <p className="text-sm text-foreground/50">{description}</p>}
    </div>
    <div className="ml-4">
      {control === 'navigate' ? <ChevronRight className="w-5 h-5 text-foreground/40" /> : control}
    </div>
  </div>
)

const OptionsDialog = ({ open, onOpenChange, title, options, current, onSelect }: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    title: string,
    options: {label: string, value: string}[],
    current: string,
    onSelect: (value: string) => void
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 pt-4">
                {options.map(opt => (
                    <button key={opt.value} onClick={() => { onSelect(opt.value); onOpenChange(false); }} className={cn('w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors', current === opt.value ? 'bg-primary text-black font-semibold' : 'hover:bg-white/10')}>
                        <span>{opt.label}</span>
                        {current === opt.value && <Check className="w-5 h-5" />}
                    </button>
                ))}
            </div>
        </DialogContent>
    </Dialog>
);
