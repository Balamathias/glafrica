"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Printer, Share2, Syringe, Pill, Droplets, ClipboardList, Loader2 } from "lucide-react"
import { herdHealthApi } from "@/lib/api"
import type { Species, VaccinationRow, VaccinationSchedule } from "@/lib/types"
import { cn } from "@/lib/utils"
import { GlassDatePicker } from "@/components/ui/glass-date-picker"
import { Stamp } from "./stamp"

const CATEGORY_ICON = {
  vaccine: Syringe,
  deworm: Pill,
  vitamin: Droplets,
  management: ClipboardList,
} as const

function formatDate(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function scheduleToText(s: VaccinationSchedule): string {
  const lines = [
    `GLA HERD HEALTH PROTOCOL — ${s.species.name.toUpperCase()}`,
    s.birth_date ? `Born: ${formatDate(s.birth_date)}` : "Ages from birth/hatch",
    "",
    ...s.schedule.map((r) => {
      const when = r.scheduled_date ? formatDate(r.scheduled_date) : r.age_label
      return `• ${when} — ${r.name}${r.protects_against ? ` (${r.protects_against})` : ""} [${r.route_display}]`
    }),
    "",
    "Guide only — confirm with a licensed veterinarian.",
    "greenlivestockafrica.com/learn",
  ]
  return lines.join("\n")
}

export function HerdHealthCard() {
  const [species, setSpecies] = useState<Species[]>([])
  const [activeSlug, setActiveSlug] = useState<string>("")
  const [birthDate, setBirthDate] = useState<string>("")
  const [schedule, setSchedule] = useState<VaccinationSchedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    herdHealthApi
      .getSpecies()
      .then((list) => {
        if (!alive) return
        setSpecies(list)
        if (list.length) setActiveSlug(list[0].slug)
      })
      .catch(() => alive && setError("Could not load species. Please try again."))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!activeSlug) return
    let alive = true
    setLoading(true)
    setError(null)
    herdHealthApi
      .getSchedule(activeSlug, birthDate || undefined)
      .then((data) => alive && setSchedule(data))
      .catch(() => alive && setError("Could not generate the schedule. Please try again."))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [activeSlug, birthDate])

  const activeSpecies = useMemo(
    () => species.find((s) => s.slug === activeSlug),
    [species, activeSlug]
  )

  const handleShare = async () => {
    if (!schedule) return
    const text = scheduleToText(schedule)
    // Prefer the native share sheet on mobile; fall back to WhatsApp web.
    const nav = navigator as Navigator & { share?: (d: { text: string; title: string }) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title: "GLA Herd Health Protocol", text })
        return
      } catch {
        /* user dismissed — fall through to WhatsApp */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener")
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Controls */}
      <div className="mb-6 print:hidden">
        <span className="ledger text-[10px] uppercase tracking-[0.2em] text-primary">
          Select livestock
        </span>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a species">
          {species.map((s) => {
            const active = s.slug === activeSlug
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => setActiveSlug(s.slug)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border/50 bg-card/50 text-foreground/75 hover:border-primary/40 hover:text-foreground"
                )}
              >
                {s.name}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="ledger text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Birth / hatch date (optional)
            </span>
            <GlassDatePicker
              value={birthDate}
              onChange={setBirthDate}
              max={new Date().toISOString().slice(0, 10)}
              placeholder="Select a date"
            />
          </div>
          <p className="ledger text-[11px] text-muted-foreground/70">
            {birthDate ? "Showing real calendar dates." : "Add a date for a dated calendar."}
          </p>
        </div>
      </div>

      {/* The record card */}
      <div className="relative overflow-hidden rounded-3xl border border-black/10 surface-vellum shadow-premium-lg">
        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div>
            <p className="ledger text-[10px] uppercase tracking-[0.25em] text-black/45">
              GLA · Herd Health Protocol
            </p>
            <h3 className="font-display mt-1 text-2xl text-[color:var(--canopy)]">
              {activeSpecies?.name ?? "—"}
            </h3>
            {activeSpecies?.common_breeds && (
              <p className="ledger mt-1 text-[11px] text-black/50">{activeSpecies.common_breeds}</p>
            )}
          </div>
          <Stamp label="Herd Health" sublabel="Protocol" className="shrink-0" />
        </div>

        {/* Entry count sub-bar */}
        {schedule && !loading && !error && (
          <div className="ledger flex items-center justify-between border-b border-black/10 bg-black/[0.02] px-6 py-2 text-[10px] uppercase tracking-[0.2em] text-black/40">
            <span>
              {schedule.schedule.length} entries · first year
            </span>
            <span className="print:hidden">Scroll for the full protocol ↓</span>
          </div>
        )}

        {/* Rows — capped like a handheld card; scrolls inside, expands in print */}
        <div className="relative min-h-[180px]">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-black/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ledger text-xs uppercase tracking-widest">Generating…</span>
            </div>
          )}

          {error && !loading && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="max-h-[26rem] overflow-y-auto overscroll-contain print:max-h-none print:overflow-visible">
            <AnimatePresence mode="wait">
              {!loading && !error && schedule && (
                <motion.ul
                  key={activeSlug + birthDate}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="divide-y divide-black/[0.07]"
                >
                  {schedule.schedule.map((row, i) => (
                    <ScheduleRow key={i} row={row} index={i} dated={!!schedule.birth_date} />
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom fade hinting there is more to scroll */}
          {schedule && !loading && !error && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[color:var(--vellum)] to-transparent print:hidden"
            />
          )}
        </div>

        {/* Footer — source + disclaimer */}
        {schedule && (
          <div className="border-t border-black/10 bg-black/[0.02] px-6 py-4">
            <p className="ledger text-[10px] leading-relaxed text-black/50">
              {schedule.disclaimer}
            </p>
            {schedule.source_note && (
              <p className="ledger mt-1 text-[10px] leading-relaxed text-black/40">
                Source: {schedule.source_note}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {schedule && !loading && (
        <div className="mt-4 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/40 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2.5 text-sm font-semibold text-foreground/85 backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  )
}

function ScheduleRow({ row, index, dated }: { row: VaccinationRow; index: number; dated: boolean }) {
  const Icon = CATEGORY_ICON[row.category] ?? Syringe
  const when = dated && row.scheduled_date ? formatDate(row.scheduled_date) : row.age_label
  return (
    <li className="flex items-start gap-4 px-6 py-4">
      <div className="flex w-24 shrink-0 flex-col">
        <span className="ledger text-sm font-semibold tabular-nums text-[color:var(--canopy)]">
          {when}
        </span>
        {dated && (
          <span className="ledger text-[10px] uppercase tracking-wider text-black/40">
            {row.age_label}
          </span>
        )}
      </div>
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: "color-mix(in oklab, var(--canopy) 12%, transparent)" }}
      >
        <Icon className="h-4 w-4" style={{ color: "var(--canopy)" }} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-[color:var(--vellum-ink)]">{row.name}</span>
          {!row.is_core && (
            <span className="ledger rounded border border-black/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-black/45">
              Optional
            </span>
          )}
        </div>
        {row.protects_against && (
          <p className="text-[13px] text-black/55">Protects against {row.protects_against}</p>
        )}
        <p className="ledger mt-0.5 text-[11px] uppercase tracking-wider text-black/40">
          {row.route_display}
          {row.notes ? ` · ${row.notes}` : ""}
        </p>
      </div>
      <span className="ledger ml-auto hidden shrink-0 text-[10px] tabular-nums text-black/25 sm:block">
        {String(index + 1).padStart(2, "0")}
      </span>
    </li>
  )
}
