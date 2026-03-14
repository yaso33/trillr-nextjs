import 'intro.js/introjs.css'
import { Steps } from 'intro.js-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { steps } from './steps'

export const OnboardingTour = () => {
  const [enabled, setEnabled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const tourViewed = localStorage.getItem('tourViewed')
    if (!tourViewed) {
      // Delay starting the tour to allow the page to render
      setTimeout(() => setEnabled(true), 1000)
    }
  }, [location.pathname])

  const onExit = () => {
    setEnabled(false)
    localStorage.setItem('tourViewed', 'true')
  }

  return (
    <Steps
      enabled={enabled}
      steps={steps}
      initialStep={0}
      onExit={onExit}
      options={{
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        tooltipClass: 'custom-tooltip',
      }}
    />
  )
}
