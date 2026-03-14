import { Steps } from 'intro.js-react'
import 'intro.js/introjs.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface OnboardingTourProps {
  enabled: boolean
  onExit: () => void
}

export function OnboardingTour({ enabled, onExit }: OnboardingTourProps) {
  const { t, isRTL } = useLanguage()

  const steps = [
    {
      title: t('onboarding.welcome.title'),
      intro: t('onboarding.welcome.intro'),
    },
    {
      element: '[data-tour="sidebar"]',
      intro: t('onboarding.sidebar.intro'),
    },
    {
      element: '[data-tour="new-post"]',
      intro: t('onboarding.newPost.intro'),
    },
    {
      element: '[data-tour="profile"]',
      intro: t('onboarding.profile.intro'),
    },
    {
      title: t('onboarding.done.title'),
      intro: t('onboarding.done.intro'),
    },
  ]

  return (
    <Steps
      enabled={enabled}
      steps={steps}
      initialStep={0}
      onExit={onExit}
      options={{
        nextLabel: t('next'),
        prevLabel: t('previous'),
        doneLabel: t('submitRequest'),
        tooltipClass: `font-sans ${isRTL ? 'rtl' : 'ltr'}`,
        highlightClass: '!bg-red-500',
      }}
    />
  )
}
