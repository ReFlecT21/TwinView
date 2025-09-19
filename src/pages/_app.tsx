import type { AppProps } from 'next/app'
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrpcProvider } from "@/components/providers/TrpcProvider";
import Sidebar from "@/components/layout/sidebar";
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TrpcProvider>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen bg-secondary/20">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Component {...pageProps} />
          </main>
        </div>
      </TooltipProvider>
    </TrpcProvider>
  )
}