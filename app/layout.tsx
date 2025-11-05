import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Galaxy Medical - Buy Medicines & Essentials Online",
  description: "Your trusted online pharmacy for medicines and medical essentials",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen relative overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />

          {/* Floating Signature Badge */}
          <div className="fixed bottom-3 left-4 z-50">
            <div className="bg-zinc-900/80 dark:bg-zinc-800/80 text-white px-4 py-2 rounded-full shadow-lg border border-white/10 backdrop-blur-md hover:scale-105 transition-transform duration-300 text-sm font-medium">
              Made with <span className="text-red-500">❤️</span> by 
              <span className="font-semibold ml-1 text-blue-400">Gaurav Chaudhary</span>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
