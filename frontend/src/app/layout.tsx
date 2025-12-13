import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/query-client"
import { Sidebar } from "@/components/layout/sidebar"
import { MainLayout } from "@/components/layout/main-layout"
import { ChatAssistant } from "@/components/ai/chat-assistant"
import { LivestockDetailModal } from "@/components/livestock/livestock-detail-modal"
import { Toaster } from "@/components/ui/sonner"

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
})

export const metadata: Metadata = {
  title: {
    default: "Green Livestock Africa",
    template: "%s | Green Livestock Africa",
  },
  description:
    "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics, documented health histories.",
  keywords: [
    "livestock",
    "cattle",
    "goats",
    "sheep",
    "Africa",
    "investment",
    "farming",
    "agriculture",
  ],
  authors: [{ name: "Green Livestock Africa" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Green Livestock Africa",
    title: "Green Livestock Africa",
    description:
      "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Livestock Africa",
    description:
      "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics.",
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
            <div className="flex min-h-screen bg-background text-foreground">
              <Sidebar />
              <MainLayout>{children}</MainLayout>
              <ChatAssistant />
              <LivestockDetailModal />
            </div>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
