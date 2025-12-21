import { Metadata } from "next"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import {
  Hero,
  HeroTransition,
  ValueProps,
  CategoriesShowcase,
  FeaturedPreview,
  EggsShowcase,
  Testimonials,
  AITeaser,
  CTASection,
} from "@/components/home"

export const metadata: Metadata = {
  title: "Green Livestock Africa | Premium Livestock Investment",
  description:
    "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics, documented health histories. Your gateway to agricultural wealth.",
  openGraph: {
    title: "Green Livestock Africa | Premium Livestock Investment",
    description:
      "Discover and invest in Africa's finest livestock. Premium breeds, verified genetics.",
    images: [
      {
        url: "/atmospheric/high-res-wide-shot-with-negative-text.png",
        width: 1200,
        height: 630,
        alt: "Green Livestock Africa - Premium African Livestock",
      },
    ],
  },
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section - Full viewport immersive video */}
        <Hero />

        {/* Smooth gradient transition from dark hero to content */}
        <HeroTransition />

        {/* Value Propositions - Trust & credibility */}
        <ValueProps />

        {/* Categories Showcase - Browse by category */}
        <CategoriesShowcase />

        {/* Featured Livestock Preview */}
        <FeaturedPreview />

        {/* Premium Eggs Showcase */}
        <EggsShowcase />

        {/* Testimonials - Social proof */}
        <Testimonials />

        {/* AI Assistant Teaser */}
        <AITeaser />

        {/* Call to Action */}
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
