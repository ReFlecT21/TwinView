import type { AppProps } from 'next/app'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrpcProvider } from "@/components/providers/TrpcProvider";
import Sidebar from "@/components/layout/sidebar";
import '../styles/globals.css'

function AppContent({ Component, pageProps }: AppProps) {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  // Public pages that don't need sidebar
  const publicPages = ['/sign-in', '/sign-up', '/']
  const isPublicPage = publicPages.includes(router.pathname)

  if (!isSignedIn && !isPublicPage) {
    return <Component {...pageProps} />
  }

  if (isPublicPage) {
    return <Component {...pageProps} />
  }

  return (
    <div className="flex h-screen bg-secondary/20">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Component {...pageProps} />
      </main>
    </div>
  )
}

export default function App(appProps: AppProps) {
  return (
    <ClerkProvider {...appProps.pageProps}>
      <TrpcProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent {...appProps} />
        </TooltipProvider>
      </TrpcProvider>
    </ClerkProvider>
  )
}