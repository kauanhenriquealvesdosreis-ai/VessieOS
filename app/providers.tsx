'use client'

import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const isProd = process.env.NODE_ENV === 'production'

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      {isProd && <Analytics />}
    </ThemeProvider>
  )
}