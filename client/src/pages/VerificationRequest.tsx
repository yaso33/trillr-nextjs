import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  Globe,
  Instagram,
  Link as LinkIcon,
  Shield,
  Sparkles,
  Star,
  Twitter,
  Upload,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'

const STEPS = [
  { id: 'intro', title: 'Introduction', icon: Sparkles },
  { id: 'eligibility', title: 'Eligibility', icon: Shield },
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'notability', title: 'Notability', icon: Star },
  { id: 'review', title: 'Review', icon: FileText },
]

interface FormData {
  fullName: string
  username: string
  category: string
  bio: string
  followers: string
  websiteUrl: string
  instagramUrl: string
  twitterUrl: string
  otherLinks: string
  idDocument: File | null
  additionalDocs: File[]
  agreeTerms: boolean
  confirmInfo: boolean
}

export default function VerificationRequest() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    fullName: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
    category: '',
    bio: '',
    followers: '',
    websiteUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    otherLinks: '',
    idDocument: null,
    additionalDocs: [],
    agreeTerms: false,
    confirmInfo: false,
  })

  const updateFormData = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true
      case 1:
        return formData.category !== ''
      case 2:
        return formData.fullName && formData.idDocument
      case 3:
        return formData.bio && (formData.websiteUrl || formData.instagramUrl || formData.twitterUrl)
      case 4:
        return formData.agreeTerms && formData.confirmInfo
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSubmitted(true)
    setIsSubmitting(false)

    toast({
      title: t('requestSubmitted'),
      description: t('requestReview'),
    })
  }

  const categories = [
    { id: 'creator', label: t('contentCreator'), icon: Star },
    { id: 'celebrity', label: t('celebrity'), icon: Crown },
    { id: 'brand', label: t('brandBusiness'), icon: Globe },
    { id: 'influencer', label: t('influencer'), icon: Users },
  ]

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t('requestSubmitted')}
          </h1>
          <p className="text-muted-foreground mb-8">{t('requestSubmittedThanks')}</p>
          <Button onClick={() => setLocation('/settings')} className="gradient-primary">
            {t('backToSettings')}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <BadgeCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t('verificationRequest')}</h1>
                <p className="text-sm text-muted-foreground">{t('getVerified')}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t('step')} {currentStep + 1} {t('of')} {STEPS.length}
              </span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="flex justify-between mt-4">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex flex-col items-center gap-1',
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      index < currentStep && 'bg-primary text-white',
                      index === currentStep && 'bg-primary/20 border-2 border-primary',
                      index > currentStep && 'bg-muted'
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
                  <CardHeader className="text-center pb-2">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center">
                      <BadgeCheck className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{t('getVerifiedOnBuzly')}</CardTitle>
                    <CardDescription className="text-base">
                      {t('verificationAuthentic')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {[
                        { icon: Shield, text: t('protectIdentity') },
                        { icon: Star, text: t('increaseCredibility') },
                        { icon: Users, text: t('buildTrust') },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <item.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 1 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>{t('chooseCategory')}</CardTitle>
                    <CardDescription>{t('bestDescribes')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => updateFormData('category', cat.id)}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all text-center',
                            formData.category === cat.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div
                            className={cn(
                              'w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center',
                              formData.category === cat.id ? 'bg-primary text-white' : 'bg-muted'
                            )}
                          >
                            <cat.icon className="w-6 h-6" />
                          </div>
                          <span className="font-medium">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>{t('identityVerification')}</CardTitle>
                    <CardDescription>{t('uploadId')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('fullName')}</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        placeholder={t('enterFullName')}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('idDocument')}</Label>
                      <div
                        onClick={() => document.getElementById('id-upload')?.click()}
                        className={cn(
                          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                          formData.idDocument
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {formData.idDocument ? (
                          <div className="flex items-center justify-center gap-2 text-primary">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{formData.idDocument.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{t('clickToUpload')}</p>
                          </>
                        )}
                      </div>
                      <input
                        id="id-upload"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => updateFormData('idDocument', e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground">{t('idInstructions')}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>{t('proofOfNotability')}</CardTitle>
                    <CardDescription>{t('tellUsAboutYou')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('aboutYou')}</Label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => updateFormData('bio', e.target.value)}
                        placeholder={t('aboutYouPlaceholder')}
                        className="bg-muted/50 min-h-24"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>{t('socialLinks')}</Label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={formData.websiteUrl}
                            onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="bg-muted/50 pl-10"
                          />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={formData.instagramUrl}
                            onChange={(e) => updateFormData('instagramUrl', e.target.value)}
                            placeholder="@instagram_username"
                            className="bg-muted/50 pl-10"
                          />
                        </div>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={formData.twitterUrl}
                            onChange={(e) => updateFormData('twitterUrl', e.target.value)}
                            placeholder="@twitter_username"
                            className="bg-muted/50 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>{t('reviewRequest')}</CardTitle>
                    <CardDescription>{t('reviewInfo')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('name')}</span>
                        <span className="font-medium">{formData.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('category')}</span>
                        <span className="font-medium">
                          {categories.find((c) => c.id === formData.category)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('documents')}</span>
                        <span className="font-medium text-primary">
                          {formData.idDocument ? '1 file' : 'None'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => updateFormData('agreeTerms', checked)}
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          {t('agreeToTerms')}
                        </Label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="confirm"
                          checked={formData.confirmInfo}
                          onCheckedChange={(checked) => updateFormData('confirmInfo', checked)}
                        />
                        <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
                          {t('confirmInfo')}
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex-1 h-12 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('previous')}
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="flex-1 h-12 rounded-xl gradient-primary"
              >
                {t('next')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('submitting')}
                  </div>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4 mr-2" />
                    {t('submitRequest')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
