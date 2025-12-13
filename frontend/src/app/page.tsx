import { Hero } from "@/components/home/hero"
import { InfiniteGallery } from "@/components/gallery/infinite-gallery"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Gallery Section */}
      <section id="gallery" className="scroll-mt-16">
        <header className="px-4 md:px-8 pt-12 pb-6 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-2">
            Featured Livestock
          </h2>
          <p className="text-muted-foreground">
            Browse our curated selection of premium animals available for investment
          </p>
        </header>

        <InfiniteGallery />
      </section>
    </div>
  )
}
