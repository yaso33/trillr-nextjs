import UserAvatar from '@/components/UserAvatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useProfile, useUpdateProfile } from '@/hooks/useProfiles'
import { useRTL } from '@/hooks/useRTL'
import { logger } from '@/lib/logger'
import { uploadAvatar } from '@/lib/storage'
import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'

export default function EditProfile() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const updateProfileMutation = useUpdateProfile()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const isRTL = useRTL()

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
    email: '',
    twitter: '',
    instagram: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        email: profile.email || '',
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
      })
    }
  }, [profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: isRTL ? 'نوع ملف غير صالح' : 'Invalid file type',
        description: isRTL ? 'يرجى اختيار ملف صورة.' : 'Please select an image file.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: isRTL ? 'الملف كبير جداً' : 'File too large',
        description: isRTL
          ? 'يجب أن تكون صورة الملف الشخصي أقل من 5MB.'
          : 'Avatar must be less than 5MB.',
        variant: 'destructive',
      })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsUploading(true)
      let avatar_url = profile?.avatar_url

      if (avatarFile) {
        const result = await uploadAvatar(avatarFile, user.id)
        avatar_url = result.url
      }

      await updateProfileMutation.mutateAsync({
        full_name: formData.full_name || null,
        bio: formData.bio || null,
        website: formData.website || null,
        email: formData.email || null,
        twitter: formData.twitter || null,
        instagram: formData.instagram || null,
        avatar_url,
      })

      setLocation('/profile')
    } catch (error) {
      logger.error('Error updating profile:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div
          className="w-full max-w-2xl mx-auto p-4 sm:p-6 pb-24 md:pb-8"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-6">
            {isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
          </h1>

          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-border/50 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <UserAvatar
                  src={avatarPreview || profile?.avatar_url}
                  name={profile?.username || 'User'}
                  size="2xl"
                  className="ring-4 ring-primary/30"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 sm:p-3 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2} />
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground text-center">
                {isRTL
                  ? 'انقر على أيقونة الكاميرا لتغيير صورتك الشخصية'
                  : 'Click the camera icon to change your profile picture'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'اسم المستخدم' : 'Username'}</Label>
              <Input
                value={profile?.username}
                disabled
                className="bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'لا يمكن تغيير اسم المستخدم' : 'Username cannot be changed'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className="bg-muted/30 border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'النبذة' : 'Bio'}</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={isRTL ? 'أخبرنا عن نفسك...' : 'Tell us about yourself...'}
                className="min-h-[100px] bg-muted/30 border-border/50 focus:border-primary resize-none"
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/150</p>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'الموقع الإلكتروني' : 'Website'}</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="bg-muted/30 border-border/50 focus:border-primary"
                type="url"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="bg-muted/30 border-border/50 focus:border-primary"
                type="email"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'تويتر' : 'Twitter'}</Label>
              <Input
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="@yourhandle"
                className="bg-muted/30 border-border/50 focus:border-primary"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'إنستاجرام' : 'Instagram'}</Label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@yourhandle"
                className="bg-muted/30 border-border/50 focus:border-primary"
                dir="ltr"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 h-11 rounded-xl gradient-primary hover:opacity-90"
                disabled={isUploading || updateProfileMutation.isPending}
              >
                {isUploading
                  ? isRTL
                    ? 'جاري الرفع...'
                    : 'Uploading...'
                  : updateProfileMutation.isPending
                    ? isRTL
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : isRTL
                      ? 'حفظ التغييرات'
                      : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl px-6"
                onClick={() => setLocation('/profile')}
                disabled={isUploading || updateProfileMutation.isPending}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
