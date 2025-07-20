'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <div className="min-h-screen bg-ciro-dark text-ciro-text-primary flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  )
} 