import { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  Stethoscope,
  Wheat,
  ShieldAlert,
  Baby,
  ClipboardCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { VideoField, RecordLine, EarTag, HerdHealthCard } from "@/components/brand"
import { InquiryForm } from "@/components/inquiry/inquiry-form"
import { VIDEOS, POSTERS } from "@/lib/media"

export const metadata: Metadata = {
  title: "Learn — Open livestock knowledge",
  description:
    "Free, open training on breeding, nutrition, disease prevention, and farm management for livestock farmers across Africa. Generate a vaccination schedule with the Herd Health Card.",
}

const TOPICS = [
  {
    icon: Baby,
    tag: "Breeding",
    title: "Breeding & improved genetics",
    body: "Selecting healthy stock, managing mating, and raising kids and chicks that survive and thrive.",
  },
  {
    icon: Wheat,
    tag: "Nutrition",
    title: "Feeding & nutrition",
    body: "Balanced rations, pasture and forage, clean water, and preventing bloat in ruminants.",
  },
  {
    icon: ShieldAlert,
    tag: "Health",
    title: "Disease prevention",
    body: "Vaccination discipline, biosecurity, spotting sickness early, and knowing when to call a vet.",
  },
  {
    icon: ClipboardCheck,
    tag: "Management",
    title: "Farm management & records",
    body: "Housing, record-keeping, costing, and running the farm as the serious business it is.",
  },
]

export default function LearnPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Field hero */}
        <section className="relative flex min-h-[70vh] items-end overflow-hidden">
          <VideoField
            src={VIDEOS.feedingCattle}
            poster={POSTERS.hero}
            overlayClassName="bg-gradient-to-b from-[#0b120c]/70 via-[#0b120c]/40 to-[#0b120c]"
          />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 lg:px-12">
            <EarTag accent>Enlighten</EarTag>
            <h1 className="font-display mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.08] text-white sm:text-5xl md:text-6xl">
              Knowledge is the first{" "}
              <span className="text-gradient-signature">harvest</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Everything here is open. No enrollment, no paywall — because raising the
              knowledge of every farmer is how we answer hunger. Workshops, on-farm
              sessions, and tools you can use today.
            </p>
            <div className="mt-8">
              <RecordLine segments={["Open access", "No fees", "By design"]} />
            </div>
          </div>
        </section>

        {/* Topics */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-12 flex items-center gap-3">
              <BookOpen className="h-5 w-5" style={{ color: "var(--pasture)" }} />
              <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                What we teach
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TOPICS.map((t) => {
                const Icon = t.icon
                return (
                  <div
                    key={t.title}
                    className="group relative flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium md:p-7"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80">
                        <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="ledger mt-5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                        {t.tag}
                      </span>
                      <h3 className="mt-1.5 text-lg font-semibold text-foreground">{t.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Herd Health Card — the signature tool */}
        <section
          id="herd-health"
          className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-20 md:py-28"
        >
          {/* Background glow decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="mb-4 inline-flex">
                <Stethoscope className="h-6 w-6" style={{ color: "var(--ochre)" }} />
              </div>
              <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl md:text-5xl">
                The <span className="text-gradient-signature">Herd Health Card</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                A working vaccination and health schedule for your animals — pick a
                species, add a birth date, and take the protocol with you.
              </p>
            </div>
            <HerdHealthCard />
          </div>
        </section>

        {/* Future Farmers Academy teaser */}
        <section className="relative overflow-hidden py-16 md:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-1/4 top-0 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="group relative overflow-hidden rounded-3xl border border-primary/25 bg-card/50 p-8 backdrop-blur-sm md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-secondary/5 opacity-60" />
              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <span className="ledger inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-primary">
                    <GraduationCap className="h-4 w-4" />
                    New · Launching 2026
                  </span>
                  <h2 className="font-display mt-3 text-2xl font-medium text-foreground sm:text-3xl md:text-4xl">
                    Future Farmers Academy
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Open knowledge isn&apos;t only for today&apos;s farmers. We&apos;re
                    teaching children and teenagers to raise animals, keep records, and
                    think like agricultural entrepreneurs — from age 8 to 18.
                  </p>
                </div>
                <Link
                  href="/academy"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Explore the Academy
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Get in touch — the way in for anyone who wants to be taught */}
        <section
          id="get-in-touch"
          className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background py-20 md:py-28"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
                  Reach out
                </span>
                <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl">
                  Want to be <span className="text-gradient-signature">taught</span>?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Everything on this page is open, but the best learning still happens
                  face to face. Tell us where you are and what you keep, and we will
                  point you to the next workshop, on-farm session, or visit near you.
                </p>
                <ul className="ledger mt-6 space-y-2 text-[13px] text-muted-foreground/80">
                  <li>· Workshops and on-farm training</li>
                  <li>· Individual farmers, groups, and cooperatives</li>
                  <li>· No fees — ask us anything</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-border/50 bg-card/50 p-7 shadow-premium backdrop-blur-sm sm:p-9">
                <h3 className="text-lg font-semibold text-foreground">
                  Tell us what you want to learn
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We reply within two working days.
                </p>
                <div className="mt-6">
                  <InquiryForm
                    subject="training"
                    contextLabel="Learn — Training request"
                    prefill="I'd like to learn more about "
                    submitLabel="Send my request"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bridge to equip */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
              Learned it. Now equip for it.
            </h2>
            <p className="mt-3 text-muted-foreground">
              The inputs a trained farmer needs — genetics, vaccines, fertile eggs,
              fingerlings, and grass seed — are a message away.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/store"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--pasture)] px-7 py-3.5 font-semibold text-[color:var(--nightfield)] transition-transform hover:scale-[1.03] active:scale-95"
              >
                Visit the Farm Store
              </Link>
              <Link
                href="/partner"
                className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3.5 font-semibold text-foreground transition-colors hover:border-[color:var(--pasture)]/50"
              >
                Partner with us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
