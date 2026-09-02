import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Lock, FileCheck2 } from "lucide-react"
import { Navbar } from "@/components/navigation"
import { Footer } from "@/components/layout"
import { VideoField, RecordLine, EarTag } from "@/components/brand"
import { CertificateLookup } from "@/components/certificates"
import { VIDEOS, POSTERS } from "@/lib/media"

export const metadata: Metadata = {
  title: "Certificate directory — Verify a trained farmer",
  description:
    "Look up and download a Green Livestock Africa training certificate by the holder's name or phone number. Search-only: we never publish a browsable list of farmers' contact details.",
}

const ASSURANCES = [
  {
    icon: Lock,
    title: "We never publish the list",
    body: "There is no page here that shows every farmer. You can only find a record you already know how to search for.",
  },
  {
    icon: ShieldCheck,
    title: "Phone numbers stay masked",
    body: "A matched record shows only the first and last digits — enough to confirm it is yours, not enough to harvest.",
  },
  {
    icon: FileCheck2,
    title: "Every record is issued by us",
    body: "Certificates are uploaded by Green Livestock Africa staff and carry a unique reference number.",
  },
]

export default function CertificatesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Field hero */}
        <section className="relative flex min-h-[60vh] items-end overflow-hidden">
          <VideoField
            src={VIDEOS.feedingCattle}
            poster={POSTERS.hero}
            overlayClassName="bg-gradient-to-b from-[#0b120c]/70 via-[#0b120c]/40 to-[#0b120c]"
          />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 lg:px-12">
            <EarTag accent>Verify</EarTag>
            <h1 className="font-display mt-5 max-w-3xl text-balance text-4xl font-medium leading-[1.08] text-white sm:text-5xl md:text-6xl">
              Every certificate,{" "}
              <span className="text-gradient-signature">on the record</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Trained with us? Find your certificate and download it. Employers,
              cooperatives and partners can confirm a farmer&apos;s training here too.
            </p>
            <div className="mt-8">
              <RecordLine segments={["Issued by GLA", "Search only", "Verified"]} verified />
            </div>
          </div>
        </section>

        {/* The lookup */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                Find a <span className="text-gradient-signature">certificate</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Search by the farmer&apos;s full name, or by the phone number the
                certificate was issued against.
              </p>
            </div>

            <CertificateLookup />
          </div>
        </section>

        {/* Why the directory works this way */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid gap-5 md:grid-cols-3">
              {ASSURANCES.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm md:p-7"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/50">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Route to training */}
        <section className="relative overflow-hidden pb-20 md:pb-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="group relative overflow-hidden rounded-3xl border border-primary/25 bg-card/50 p-8 backdrop-blur-sm md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-secondary/5 opacity-60" />
              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
                    Not trained with us yet?
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    Our training is open and free. Download the course material, or tell
                    us where you are and what you keep.
                  </p>
                </div>
                <Link
                  href="/learn"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Start learning
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
