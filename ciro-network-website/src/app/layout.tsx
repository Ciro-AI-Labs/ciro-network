import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ciro Network - Verifiable AI Compute Infrastructure',
    template: '%s | Ciro Network'
  },
  description: 'Decentralized, verifiable AI compute infrastructure built for the real world. Born on the factory floor, trusted by industry, powered by community.',
  keywords: [
    'AI compute',
    'decentralized infrastructure',
    'ZK-ML',
    'verifiable AI',
    'DePIN',
    'blockchain compute',
    'Starknet',
    'industrial AI',
    'GPU sharing'
  ],
  authors: [{ name: 'Ciro Network Foundation' }],
  creator: 'Ciro Network Foundation',
  publisher: 'Ciro Network Foundation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ciro.network'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ciro.network',
    title: 'Ciro Network - Verifiable AI Compute Infrastructure',
    description: 'Decentralized, verifiable AI compute infrastructure built for the real world. Born on the factory floor, trusted by industry, powered by community.',
    siteName: 'Ciro Network',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ciro Network - Verifiable AI Compute Infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciro Network - Verifiable AI Compute Infrastructure',
    description: 'Decentralized, verifiable AI compute infrastructure built for the real world.',
    images: ['/images/og-image.png'],
    creator: '@CiroNetwork',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/images/Ciro Icon Color.png" />
        <link rel="apple-touch-icon" href="/images/Ciro Icon Color.png" />
      </head>
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
} 