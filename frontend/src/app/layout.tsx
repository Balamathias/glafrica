import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"
import { FullscreenDetailModal } from "@/components/livestock/fullscreen-detail-modal"
import { ChatAssistant } from "@/components/ai/chat-assistant"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: {
    default: "Green Livestock Africa | Premium Livestock Investment",
    template: "%s | Green Livestock Africa",
  },
  description:
    "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics, documented health histories. Your gateway to agricultural wealth.",
  keywords: [
    "livestock investment",
    "cattle",
    "goats",
    "sheep",
    "Africa",
    "agriculture",
    "farming",
    "Boer goats",
    "premium livestock",
  ],
  authors: [{ name: "Green Livestock Africa" }],
  creator: "Green Livestock Africa",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Green Livestock Africa",
    title: "Green Livestock Africa | Premium Livestock Investment",
    description:
      "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Green Livestock Africa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Livestock Africa",
    description:
      "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <FullscreenDetailModal />
            <ChatAssistant />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
