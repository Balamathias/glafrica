import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { LivestockPageClient } from "@/components/livestock"

export const metadata: Metadata = {
  title: "Premium Livestock Collection | Green Livestock Africa",
  description:
    "Discover Africa's finest livestock. Browse our curated collection of cattle, goats, sheep and more. Verified genetics, documented health histories.",
  openGraph: {
    title: "Premium Livestock Collection | Green Livestock Africa",
    description:
      "Discover Africa's finest livestock. Verified genetics, documented health.",
    images: [
      {
        url: "/atmospheric/high-res-wide-shot-with-negative-text.png",
        width: 1200,
        height: 630,
        alt: "Green Livestock Africa - Premium Livestock Collection",
      },
    ],
  },
}

export default function LivestockPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<HeroSkeleton />}>
          <LivestockPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

function HeroSkeleton() {
  return (
    <div className="relative h-[40vh] min-h-[400px] bg-muted animate-pulse" />
  )
}
