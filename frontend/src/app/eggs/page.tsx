import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { EggsPageClient } from "@/components/eggs"

export const metadata: Metadata = {
  title: "Premium Eggs Collection | Green Livestock Africa",
  description:
    "Discover Africa's finest eggs. Browse our curated collection from chicken, duck, quail, turkey and more. Fresh from local farms with verified quality.",
  openGraph: {
    title: "Premium Eggs Collection | Green Livestock Africa",
    description:
      "Discover Africa's finest eggs. Fresh from local farms with verified quality.",
    images: [
      {
        url: "/atmospheric/high-res-wide-shot-with-negative-text.png",
        width: 1200,
        height: 630,
        alt: "Green Livestock Africa - Premium Eggs Collection",
      },
    ],
  },
}

export default function EggsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<HeroSkeleton />}>
          <EggsPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

function HeroSkeleton() {
  return (
    <div className="relative h-[40vh] min-h-[400px] bg-gradient-to-br from-amber-900/20 via-background to-orange-900/10 animate-pulse" />
  )
}
