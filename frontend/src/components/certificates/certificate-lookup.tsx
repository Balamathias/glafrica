"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Download, Loader2, ShieldCheck, SearchX, Eye } from "lucide-react"
import Link from "next/link"
import { certificatesApi } from "@/lib/api"
import type { CertificateLookupResult, PublicCertificate } from "@/lib/types"
import { downloadFile } from "@/lib/download"
import { RecordLine } from "@/components/brand"
import { cn } from "@/lib/utils"

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1\/?$/, "")

/** Matches `CertificateLookupView.MIN_QUERY_LENGTH` on the backend. */
const MIN_QUERY_LENGTH = 3

function formatIssueDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/** One matched certificate card — preview in the PDF viewer, or download via JS. */
function CertificateRow({
  certificate,
  index,
}: {
  certificate: PublicCertificate
  index: number
}) {
  const [downloading, setDownloading] = useState(false)

  const previewUrl = `${API_ORIGIN}${certificate.download_url}`
  const downloadUrl = `${API_ORIGIN}${certificate.download_file_url}`

  const handleDownload = () => {
    if (downloading) return
    setDownloading(true)
    // Streamed straight from the same-origin endpoint as an attachment.
    downloadFile(downloadUrl)
    setTimeout(() => setDownloading(false), 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-3xl p-6 md:p-7",
        "border border-border/50 bg-card/50 backdrop-blur-sm",
        "transition-all duration-500 hover:border-primary/30 hover:shadow-premium"
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-medium text-foreground">
            {certificate.holder_name}
          </h3>
          <p className="ledger mt-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {certificate.phone_masked}
          </p>
          <div className="mt-4">
            <RecordLine
              className="!border-border/60 !bg-muted/40 !text-foreground/80"
              segments={[
                certificate.cohort || "Training",
                certificate.programme || "Livestock",
                `Issued ${formatIssueDate(certificate.issued_on)}`,
              ]}
            />
          </div>
          <p className="ledger mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            <ShieldCheck
              className="mr-1.5 inline-block h-3 w-3 align-middle"
              style={{ color: "var(--ochre)" }}
            />
            {certificate.certificate_number}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview in the PDF viewer"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full border border-border/60 px-5 py-3 text-sm font-semibold",
              "text-foreground transition-colors hover:border-primary/40"
            )}
          >
            <Eye className="h-4 w-4" />
            Preview
          </a>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold",
              "bg-primary text-primary-foreground transition-transform",
              "hover:scale-[1.03] active:scale-95",
              "disabled:pointer-events-none disabled:opacity-60"
            )}
          >
            <Download className={cn("h-4 w-4", downloading && "animate-bounce")} />
            {downloading ? "Downloading…" : "Download"}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Search-only certificate lookup.
 *
 * There is no browsable list here by design — the API exposes no endpoint that
 * returns all certificates, because a public roll of farmer names beside phone
 * numbers is a harvesting target. A visitor must already know a name or a full
 * phone number, and the number comes back masked either way.
 */
export function CertificateLookup() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<CertificateLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSearch = query.trim().length >= MIN_QUERY_LENGTH

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSearch || loading) return

    setLoading(true)
    setError(null)
    try {
      setResult(await certificatesApi.lookup(query.trim()))
    } catch (err) {
      setResult(null)
      setError(
        err instanceof Error
          ? err.message
          : "We could not run that search. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="certificate-search" className="sr-only">
          Search by name or phone number
        </label>
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl px-5 py-4",
            "border border-border/60 bg-card/60 backdrop-blur-sm",
            "transition-colors duration-300 focus-within:border-primary/50"
          )}
        >
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            id="certificate-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your name or phone number"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            disabled={!canSearch || loading}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
              "bg-primary text-primary-foreground transition-all",
              "hover:scale-[1.03] active:scale-95",
              "disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </button>
        </div>
      </form>

      <p className="ledger mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
        Enter at least {MIN_QUERY_LENGTH} characters of a name, or a full phone number
      </p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            {error}
          </motion.p>
        )}

        {!error && result && result.count === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10 rounded-3xl border border-border/50 bg-card/40 p-8 text-center backdrop-blur-sm"
          >
            <SearchX className="mx-auto h-6 w-6 text-muted-foreground/70" />
            <p className="mt-4 text-base font-medium text-foreground">
              No certificate found for that name or number
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Some farmers were trained before our records moved online. If you
              completed a programme with us,{" "}
              <Link
                href="/contact"
                className="text-primary underline underline-offset-4"
              >
                get in touch
              </Link>{" "}
              and we will look you up.
            </p>
          </motion.div>
        )}

        {!error && result && result.count > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10 space-y-4"
          >
            {result.results.map((certificate, index) => (
              <CertificateRow key={certificate.id} certificate={certificate} index={index} />
            ))}

            {result.truncated && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                More than {result.count} farmers match that search. Add a surname or
                use the phone number to narrow it down.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
