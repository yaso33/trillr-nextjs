import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Loading from './loading'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trillr.app'

export const metadata: Metadata = {
  title: {
    default: 'Trillr',
    template: '%s | Trillr',
  },
  description: 'منصة تواصل اجتماعي للتفاعل في الوقت الفعلي',
  keywords: ['social media', 'community', 'chat', 'live', 'trillr'],
  authors: [{ name: 'Trillr' }],
  creator: 'Trillr',

  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
    url: APP_URL,
    siteName: 'Trillr',
    title: 'Trillr — Social Platform',
    description: 'منصة تواصل اجتماعي للتفاعل في الوقت الفعلي',
    images: [
      {
        url: `${APP_URL}/api/og?title=Trillr&description=Social+media+platform`,
        width: 1200,
        height: 630,
        alt: 'Trillr',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Trillr',
    description: 'منصة تواصل اجتماعي للتفاعل في الوقت الفعلي',
    images: [`${APP_URL}/api/og?title=Trillr`],
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.json',

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: '#1A1D21',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
