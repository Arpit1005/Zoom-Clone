import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/lib/user-context'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Zoom Workplace',
  description: 'Meetings, chat, notes and more — all in one Zoom Workplace.',
  icons: {
    icon: [
      {
        url: '/zoom.ico',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/zoom.ico',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/zoom.ico',
        type: 'image/svg+xml',
      },
    ],
    apple: '/zoom.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="bg-zoom-canvas font-sans text-zoom-ink antialiased">
        <UserProvider>{children}</UserProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
