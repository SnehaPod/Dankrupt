import type { Metadata } from "next"
import { Geist, Geist_Mono, Bangers } from "next/font/google"
import { SplashScreen } from "@/components/layout/SplashScreen"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Dankrupt — Financially irresponsible meme generation.",
  description: "The fastest way to turn internet thoughts into memes.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: { url: "/icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "Dankrupt",
    description: "The fastest way to turn internet thoughts into memes.",
    siteName: "Dankrupt",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bangers.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <SplashScreen />
        {children}
      </body>
    </html>
  )
}
