import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"

interface LegalLayoutProps {
  eyebrow: string
  title: string
  lastUpdated: string
  intro: string
  children: React.ReactNode
}

/**
 * Shared shell for the plainly-worded legal pages (privacy, terms). Quiet,
 * readable, brand-consistent — the ledger eyebrow and Playfair heading, then a
 * constrained reading column.
 */
export function LegalLayout({ eyebrow, title, lastUpdated, intro, children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-1/4 top-1/3 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 md:pt-40">
          <span className="ledger text-[11px] uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </span>
          <h1 className="font-display mt-4 text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="ledger mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
            Last updated {lastUpdated}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>

          <div className="mt-12 space-y-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_li]:ml-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  )
}
