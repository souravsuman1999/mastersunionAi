import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../styles/globals.css"
import ThemeScript from "@/components/ThemeScript"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Masters' Union Ai",
  description: "AI-powered webpage generator for training AI agents",
  generator: "v0.app",
  // Icons are optional - uncomment and add files to public/ folder if needed
  // icons: {
  //   icon: [
  //     {
  //       url: "/icon-light-32x32.png",
  //       media: "(prefers-color-scheme: light)",
  //     }, 
  //     {
  //       url: "/icon-dark-32x32.png",
  //       media: "(prefers-color-scheme: dark)",
  //     },
  //     {
  //       url: "/icon.svg",
  //       type: "image/svg+xml",
  //     },
  //   ],
  //   apple: "/apple-icon.png",
  // },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

       <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>


      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ThemeScript />
        {children}
        <Analytics />
      </body>
    </html>
  )
}


