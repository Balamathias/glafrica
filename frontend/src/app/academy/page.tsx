import { Metadata } from "next"
import {
  Sparkles,
  Users,
  Tractor,
  Trophy,
  Handshake,
  FlaskConical,
  Presentation,
  Tent,
  Globe2,
  Award,
  BadgeCheck,
  Building2,
} from "lucide-react"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { VideoField, RecordLine, EarTag } from "@/components/brand"
import { AgeExplorer } from "@/components/academy/age-explorer"
import { RegisterInterest } from "@/components/academy/register-interest"
import { VIDEOS, POSTERS } from "@/lib/media"

export const metadata: Metadata = {
  title: "Future Farmers Academy — Growing the farmers of tomorrow",
  description:
    "Educating, inspiring, and equipping children and teenagers with practical farming, livestock, and agribusiness knowledge across Africa. Launching 2026.",
}

const APPROACH = [
  { icon: Presentation, label: "Interactive classes" },
  { icon: Tractor, label: "Hands-on practical sessions" },
  { icon: Globe2, label: "Farm visits" },
  { icon: Users, label: "School clubs" },
  { icon: Tent, label: "Holiday boot camps" },
  { icon: Trophy, label: "Competitions & quizzes" },
  { icon: FlaskConical, label: "Student-run farm projects" },
  { icon: Handshake, label: "Mentorship from real farmers" },
]

const VALUES = [
  "Integrity",
  "Responsibility",
  "Animal welfare",
  "Innovation",
  "Sustainability",
  "Leadership",
  "Continuous learning",
]

const ROADMAP = [
  { icon: Globe2, title: "An online learning platform", note: "Reach beyond the classroom" },
  { icon: Users, title: "A network of school clubs", note: "Agriculture clubs in schools" },
  { icon: Tent, title: "Holiday agricultural camps", note: "Immersive, hands-on breaks" },
  { icon: BadgeCheck, title: "Junior Farmer Certification", note: "Recognised early credentials" },
  { icon: Award, title: "Scholarships", note: "For outstanding young farmers" },
  { icon: Building2, title: "School & university partnerships", note: "And commercial farms" },
]

export default function AcademyPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Field hero */}
        <section className="relative flex min-h-[76vh] items-end overflow-hidden">
          <VideoField
            src={VIDEOS.littleChicks}
            poster={POSTERS.hero}
            overlayClassName="bg-gradient-to-b from-[#0b120c]/72 via-[#0b120c]/45 to-[#0b120c]"
          />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 lg:px-12">
            <EarTag accent>Future Farmers Academy</EarTag>
            <h1 className="font-display mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.06] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Growing the{" "}
              <span className="text-gradient-signature">farmers of tomorrow</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              We educate, inspire, and equip children and teenagers with practical
              knowledge of agriculture, livestock, and agribusiness — building critical
              thinking, responsibility, and innovation from an early age.
            </p>
            <div className="mt-8">
              <RecordLine segments={["Launching 2026", "Ages 5–18", "Register interest"]} />
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="relative overflow-hidden py-20 md:py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
            <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
              Our mission
            </span>
            <p className="font-display mt-5 text-2xl font-medium leading-snug text-foreground sm:text-3xl md:text-4xl">
              To raise a generation that can feed the continent — children who grow up
              knowing how to raise healthy animals, keep honest records, and think like
              agricultural entrepreneurs.
            </p>
          </div>
        </section>

        {/* Signature: age-band explorer */}
        <section
          id="curriculum"
          className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-20 md:py-28"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-1/4 top-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
            <div className="absolute -left-1/4 bottom-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
                A path that grows with them
              </span>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
                What they learn, by age
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Three stages, from first curiosity to young entrepreneur. Choose an age to
                see what that child explores.
              </p>
            </div>
            <AgeExplorer />
          </div>
        </section>

        {/* Learning approach */}
        <section className="relative overflow-hidden py-20 md:py-24">
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                How they learn
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {APPROACH.map((a) => {
                const Icon = a.icon
                return (
                  <div
                    key={a.label}
                    className="group flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 transition-colors group-hover:bg-background/80">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{a.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Core values */}
        <section className="relative overflow-hidden border-y border-border/50 bg-muted/20 py-16 md:py-20">
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-sm">
                <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
                  Core values
                </span>
                <h2 className="font-display mt-3 text-2xl font-medium text-foreground sm:text-3xl">
                  What we grow, beyond the harvest
                </h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {VALUES.map((v) => (
                  <span
                    key={v}
                    className="ledger rounded-full border border-border/60 bg-card/50 px-4 py-2 text-xs uppercase tracking-wider text-foreground/80 backdrop-blur-sm"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Where it grows — roadmap */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-12 max-w-2xl">
              <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
                Where it grows
              </span>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-foreground sm:text-4xl md:text-5xl">
                What we&apos;re building toward
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                The Academy starts with classes and clubs — and grows into a continent-wide
                pathway for young farmers. This is the roadmap, stated plainly.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ROADMAP.map((r) => {
                const Icon = r.icon
                return (
                  <div
                    key={r.title}
                    className="group flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors group-hover:bg-background/80">
                      <Icon className="h-6 w-6 text-primary" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-foreground">{r.title}</h3>
                    <p className="ledger mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">
                      {r.note}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Register interest */}
        <RegisterInterest />
      </main>
      <Footer />
    </>
  )
}
