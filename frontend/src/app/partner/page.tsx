import { Metadata } from "next"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { RecordLine, EarTag } from "@/components/brand"
import { InquiryForm } from "@/components/inquiry/inquiry-form"
import { HandCoins, Globe2, LineChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Partner With Us — Fund the work",
  description:
    "How sponsors, foreign development partners, and investors can support and fund livestock training across Africa. Premium, transparent, outcomes-led.",
}

const PATHS = [
  {
    icon: HandCoins,
    tag: "Sponsors",
    title: "Sponsor a cohort",
    body: "Fund the training, inputs, and veterinary support that take a group of farmers from enrollment to a producing, verified herd. You receive a transparent outcomes report.",
  },
  {
    icon: Globe2,
    tag: "Development partners",
    title: "Foreign & development partners",
    body: "Co-design programmes aligned with food-security and rural-livelihood mandates. We bring delivery on the ground; you bring reach and rigour.",
  },
  {
    icon: LineChart,
    tag: "Investors",
    title: "Invest in the marketplace",
    body: "Back verified livestock raised by trained farmers — where the return and the impact are the same transaction. The model, proven.",
  },
]

export default function PartnerPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 pb-14 pt-32 md:pt-40">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <EarTag accent>Partnerships · SDG 17</EarTag>
            <h1 className="font-display mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.08] text-foreground sm:text-5xl md:text-6xl">
              Back the farmers.{" "}
              <span className="text-gradient-signature">Feed the continent</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every farmer we train is a step against hunger — and a serious agricultural
              professional building real value. Here is how sponsors, development partners,
              and investors can fund and grow this work.
            </p>
            <div className="mt-8">
              <RecordLine segments={["Transparent reporting", "Real outcomes", "No overclaiming"]} />
            </div>
          </div>
        </section>

        {/* Paths */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid gap-5 md:grid-cols-3">
              {PATHS.map((p) => {
                const Icon = p.icon
                return (
                  <div
                    key={p.title}
                    className="group relative flex h-full flex-col rounded-3xl border border-border/50 bg-card/50 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium md:p-8"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80 md:h-14 md:w-14">
                        <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 md:h-7 md:w-7" />
                      </div>
                      <span className="ledger mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                        {p.tag}
                      </span>
                      <h3 className="mt-1.5 text-xl font-semibold text-foreground">{p.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Inquiry */}
        <section className="pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="rounded-3xl border border-border/50 bg-card/50 p-7 backdrop-blur-sm shadow-premium sm:p-10">
              <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                Start the conversation
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us who you are and how you would like to support the work. We reply
                within two working days.
              </p>
              <div className="mt-7">
                <InquiryForm
                  subject="partnership"
                  contextLabel="Partner With Us"
                  prefill="We're interested in partnering with Green Livestock Africa. Our organisation: "
                  submitLabel="Send partnership inquiry"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
