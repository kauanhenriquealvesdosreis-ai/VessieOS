import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Nexa — Assistente de IA',
    template: '%s | Nexa',
  },
  description:
    'Chatbot com streaming, histórico, memória persistente e prompt que evolui.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json', // PWA
  openGraph: {
    title: 'Nexa — Assistente de IA',
    description: 'Chatbot inteligente com memória persistente e streaming.',
    url: 'https://nexa.ai',
    siteName: 'Nexa',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nexa - Assistente de IA',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexa — Assistente de IA',
    description: 'Chatbot inteligente com memória persistente e streaming.',
    images: ['/og-image.png'],
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
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}