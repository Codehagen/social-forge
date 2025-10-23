import { cookies, headers } from 'next/headers'
import { AppLayout } from './app-layout'
import { getSidebarWidthFromCookie, getSidebarOpenFromCookie } from '@/lib/coding-agent/cookies'

interface AppLayoutWrapperProps {
  children: React.ReactNode
  initialSidebarWidth?: number
  initialSidebarOpen?: boolean
  initialIsMobile?: boolean
}

export async function AppLayoutWrapper({ 
  children, 
  initialSidebarWidth: propInitialSidebarWidth,
  initialSidebarOpen: propInitialSidebarOpen,
  initialIsMobile: propInitialIsMobile
}: AppLayoutWrapperProps) {
  const cookieStore = await cookies()
  const cookieString = cookieStore.toString()
  const initialSidebarWidth = propInitialSidebarWidth ?? getSidebarWidthFromCookie(cookieString)
  const initialSidebarOpen = propInitialSidebarOpen ?? getSidebarOpenFromCookie(cookieString)

  // Detect if mobile from user agent
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isMobile = propInitialIsMobile ?? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  return (
    <AppLayout
      initialSidebarWidth={initialSidebarWidth}
      initialSidebarOpen={initialSidebarOpen}
      initialIsMobile={isMobile}
    >
      {children}
    </AppLayout>
  )
}
