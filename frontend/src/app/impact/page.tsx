import { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { Stamp, RecordLine, EarTag, FarmersTrained } from "@/components/brand"
import { ImpactStrip } from "@/components/home/impact-strip"
import { COHORTS } from "@/lib/impact"

export const metadata: Metadata = {
  title: "Impact — Outcomes, plainly stated",
  description:
    "Transparent outcomes reporting for sponsors and partners. Real numbers only \u2014 confirmed cohort results, no projections, no inflation.",
}

// Render placeholder fields as an honest "to be confirmed" rather than raw tokens.
function field(value: string): { text: string; pending: boolean } {
  return value.startsWith("TODO_OWNER")
    ? { text: "To be confirmed", pending: true }
    : { text: value, pending: false }
}

export default function ImpactPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 pb-14 pt-32 md:pt-40">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <EarTag accent>Verify</EarTag>
            <h1 className="font-display mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.08] text-foreground sm:text-5xl md:text-6xl">
              Outcomes, <span className="text-gradient-signature">plainly stated</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Built for sponsors, foreign development partners, and investors to see real
              numbers. We report what has been delivered — not what we project or hope for.
              Every figure below is confirmed before it appears here.
            </p>
            <div className="mt-8">
              <RecordLine
                segments={[
                  <>
                    <FarmersTrained /> Farmers Trained
                  </>,
                  "Cohort 01",
                  "Verified",
                ]}
                verified
              />
            </div>
          </div>
        </section>

        {/* Headline stats */}
        <ImpactStrip />

        {/* Cohort ledger */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="ledger text-[11px] uppercase tracking-[0.25em] text-[color:var(--pasture)]">
                  The record
                </span>
                <h2 className="font-display mt-3 text-2xl font-medium text-foreground sm:text-3xl">
                  Cohort by cohort
                </h2>
              </div>
              <p className="ledger max-w-xs text-[11px] uppercase tracking-wider text-muted-foreground/70">
                A chart earns its place at cohort three. For now, the ledger.
              </p>
            </div>

            <div className="space-y-6">
              {COHORTS.map((c) => {
                const period = field(c.period)
                const location = field(c.location)
                return (
                  <div
                    key={c.label}
                    className="relative overflow-hidden rounded-3xl border border-black/10 surface-vellum"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
                      <div>
                        <p className="ledger text-[10px] uppercase tracking-[0.25em] text-black/45">
                          {c.label}
                        </p>
                        <p className="font-display mt-1 text-3xl text-[color:var(--canopy)]">
                          {c.farmersTrained} farmers trained
                        </p>
                      </div>
                      {c.verified && <Stamp label="Verified" />}
                    </div>

                    <dl className="grid grid-cols-2 gap-px bg-black/[0.06] sm:grid-cols-4">
                      <Cell label="Period" value={period.text} pending={period.pending} />
                      <Cell label="Location" value={location.text} pending={location.pending} />
                      <Cell label="Trained" value={String(c.farmersTrained)} />
                      <Cell label="Status" value={c.verified ? "Verified" : "In review"} />
                    </dl>

                    <div className="px-6 py-5">
                      <p className="ledger text-[10px] uppercase tracking-[0.2em] text-black/45">
                        Taught
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.topics.map((t) => (
                          <span
                            key={t}
                            className="ledger rounded-md rounded-tl-none border border-black/15 px-2.5 py-1 text-[11px] uppercase tracking-wider text-black/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {!c.confirmed && (
                        <p className="ledger mt-4 text-[10px] uppercase tracking-wider text-black/40">
                          Some details pending final confirmation before publication.
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SDG alignment — referenced, not oversold */}
        <section className="border-t border-border/60 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <p className="ledger text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
              Where this fits
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground/90">
              This work aligns naturally with the Sustainable Development Goals on{" "}
              <span className="font-medium">zero hunger (2)</span>,{" "}
              <span className="font-medium">quality education (4)</span>,{" "}
              <span className="font-medium">decent work (8)</span>, and{" "}
              <span className="font-medium">partnerships (17)</span> — not as an official
              programme, but as the honest through-line of training farmers to feed their
              communities.
            </p>
            <div className="mt-8">
              <Link
                href="/partner"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--pasture)] px-7 py-3.5 font-semibold text-[color:var(--nightfield)] transition-transform hover:scale-[1.03] active:scale-95"
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

function Cell({ label, value, pending }: { label: string; value: string; pending?: boolean }) {
  return (
    <div className="surface-vellum px-5 py-4">
      <dt className="ledger text-[10px] uppercase tracking-[0.2em] text-black/45">{label}</dt>
      <dd className={pending ? "mt-1 text-sm italic text-black/40" : "mt-1 text-sm font-medium text-[color:var(--vellum-ink)]"}>
        {value}
      </dd>
    </div>
  )
}
