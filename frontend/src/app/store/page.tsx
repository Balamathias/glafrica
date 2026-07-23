import { Metadata } from "next"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { VideoField, RecordLine, EarTag } from "@/components/brand"
import { StoreGrid } from "@/components/store/store-grid"
import { VIDEOS, POSTERS } from "@/lib/media"

export const metadata: Metadata = {
  title: "Farm Store — Inputs for the trained farmer",
  description:
    "Source fertile eggs, exotic chickens, tilapia fingerlings, grass seed, and livestock — everything a trained farmer needs to start or grow. Inquiry-based sourcing desk.",
}

export default function StorePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Field hero */}
        <section className="relative flex min-h-[60vh] items-end overflow-hidden">
          <VideoField
            src={VIDEOS.littleChicks}
            poster={POSTERS.hero}
            overlayClassName="bg-gradient-to-b from-[#0b120c]/65 via-[#0b120c]/40 to-[#0b120c]"
          />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 lg:px-12">
            <EarTag accent>Equip</EarTag>
            <h1 className="font-display mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.08] text-white sm:text-5xl md:text-6xl">
              What a trained farmer needs to{" "}
              <span className="text-gradient-signature">start or grow</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Genetics, inputs, and stock — sourced through our network and delivered to
              farmers we work with. Every item here is inquiry-based, so you get the right
              quantity, quality, and timing for your farm.
            </p>
            <div className="mt-8">
              <RecordLine segments={["Sourcing desk", "Reply in 2 days", "No fixed cart"]} />
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                Browse the catalogue
              </h2>
              <p className="mt-3 text-muted-foreground">
                Select an item to send a sourcing request. We confirm availability,
                quality, and price directly — no guesswork, no filler.
              </p>
            </div>
            <StoreGrid />
          </div>
        </section>

        {/* Aquaculture field-break */}
        <section className="relative flex min-h-[50vh] items-center overflow-hidden">
          <VideoField
            src={VIDEOS.fishesInPond}
            poster={POSTERS.hero}
            overlayClassName="bg-gradient-to-b from-[#0b120c] via-[#0b120c]/50 to-[#0b120c]"
          />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
            <EarTag accent>Aquaculture</EarTag>
            <h2 className="font-display mt-5 max-w-2xl text-balance text-3xl font-medium leading-tight text-white sm:text-4xl md:text-5xl">
              Tilapia — the fastest protein a{" "}
              <span className="text-gradient-signature">trained farmer</span> can raise.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
              Healthy fingerlings, pond guidance from the Learn hub, and a sourcing desk
              that responds in two working days.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
