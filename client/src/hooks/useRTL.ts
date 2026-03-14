import { useLanguage } from '@/contexts/LanguageContext'

export function useRTL() {
  const { isRTL } = useLanguage()
  return isRTL
}
