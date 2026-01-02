import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../styles/globals.css"

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
    <html lang="en">

       <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        {/* Tetr Fonts */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Aeonik-regular';
              src: url('https://cdn.tetr.com/assets/fonts/Aeonik-Regular.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Aeonik-medium';
              src: url('https://cdn.tetr.com/assets/fonts/Aeonik-Medium.woff2') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Aeonik-bold';
              src: url('https://cdn.tetr.com/assets/fonts/Aeonik-Bold.woff2') format('woff2');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'plexRegular';
              src: url('https://cdn.tetr.com/assets/fonts/IBMPlex-Regular.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'plexMedium';
              src: url('https://cdn.tetr.com/assets/fonts/IBMPlex-Medium.woff2') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'plexSemiBold';
              src: url('https://cdn.tetr.com/assets/fonts/IBMPlex-SemiBold.woff2') format('woff2');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'plexBold';
              src: url('https://cdn.tetr.com/assets/fonts/IBMPlex-Bold.woff2') format('woff2');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
      </head>


      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}


