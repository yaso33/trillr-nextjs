import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trillr',
  description: 'Social media platform for real-time interaction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
