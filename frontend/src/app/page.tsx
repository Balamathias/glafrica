import { Metadata } from "next"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import {
  Hero,
  HeroTransition,
  ModelPillars,
  HerdHealthTeaser,
  BreedingGenetics,
  DualPath,
  ImpactStrip,
  FeaturedPreview,
  EggsShowcase,
  Testimonials,
  CTASection,
  LocationMap,
} from "@/components/home"

export const metadata: Metadata = {
  title: "Green Livestock Africa | Raising the next generation of African farmers",
  description:
    "Open training in breeding, nutrition, and disease prevention for livestock farmers across Africa — knowledge as a direct answer to hunger and food insecurity. 93 farmers trained in our first cohort.",
  openGraph: {
    title: "Green Livestock Africa | Raising the next generation of African farmers",
    description:
      "Open livestock training as a working answer to hunger in Africa. Enlighten, equip, verify, grow.",
    images: [
      {
        url: "/atmospheric/high-res-wide-shot-with-negative-text.png",
        width: 1200,
        height: 630,
        alt: "Green Livestock Africa — training farmers across Africa",
      },
    ],
  },
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Education-first hero — mission leads, marketplace follows */}
        <Hero />
        <HeroTransition />

        {/* The model: Enlighten → Equip → Verify → Grow */}
        <ModelPillars />

        {/* Signature: the Herd Health Card, live on the homepage */}
        <HerdHealthTeaser />

        {/* Equip, continued: artificial insemination as a service + training */}
        <BreedingGenetics />

        {/* Tiered entry: new to farming vs already farming */}
        <DualPath />

        {/* Delivered outcomes, plainly stated */}
        <ImpactStrip />

        {/* Marketplace reframed as proof of outcomes */}
        <FeaturedPreview />
        <EggsShowcase />

        {/* Farmer voices first, then partners */}
        <Testimonials />

        {/* Where we work + closing call */}
        <LocationMap />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
