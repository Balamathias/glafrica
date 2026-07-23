"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlassDatePickerProps {
  /** ISO date (YYYY-MM-DD) or empty string. */
  value: string
  onChange: (iso: string) => void
  /** Latest selectable ISO date (inclusive). */
  max?: string
  placeholder?: string
  className?: string
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function fromISO(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) }
}

function formatDisplay(iso: string): string {
  const p = fromISO(iso)
  if (!p) return ""
  return `${String(p.d).padStart(2, "0")} ${MONTHS[p.m].slice(0, 3)} ${p.y}`
}

/** Glassmorphic calendar popover — a styled replacement for input[type=date]. */
export function GlassDatePicker({
  value,
  onChange,
  max,
  placeholder = "Select a date",
  className,
}: GlassDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const today = useMemo(() => {
    const now = new Date()
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }
  }, [])

  const selected = fromISO(value)
  const [view, setView] = useState({ y: (selected ?? today).y, m: (selected ?? today).m })

  // Re-sync the visible month when opened with a selected value.
  useEffect(() => {
    if (open) {
      const p = fromISO(value)
      setView({ y: (p ?? today).y, m: (p ?? today).m })
    }
  }, [open, value, today])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const maxParts = max ? fromISO(max) : null
  const isDisabled = (y: number, m: number, d: number) =>
    maxParts ? toISO(y, m, d) > toISO(maxParts.y, maxParts.m, maxParts.d) : false

  // Monday-first offset of the month's first day.
  const firstOffset = (new Date(view.y, view.m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()

  const shiftMonth = (delta: number) => {
    setView(({ y, m }) => {
      const next = new Date(y, m + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm backdrop-blur-sm transition-all duration-300 sm:w-56",
          "border-border/50 bg-card/50 text-left",
          "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          open && "border-primary/50"
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
        <span className={cn("flex-1 truncate", value ? "text-foreground" : "text-muted-foreground/70")}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            aria-label="Clear date"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation()
                onChange("")
              }
            }}
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose a date"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-full z-50 mt-2 w-[19rem] rounded-3xl p-4",
              "glass-strong shadow-premium-lg"
            )}
          >
            {/* Month header */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {MONTHS[view.m]} <span className="ledger text-muted-foreground">{view.y}</span>
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday row */}
            <div className="mt-3 grid grid-cols-7 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="ledger py-1 text-[10px] uppercase text-muted-foreground/60">
                  {w}
                </span>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {Array.from({ length: firstOffset }).map((_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const iso = toISO(view.y, view.m, d)
                const isSelected = value === iso
                const isToday = today.y === view.y && today.m === view.m && today.d === d
                const disabled = isDisabled(view.y, view.m, d)
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(iso)
                      setOpen(false)
                    }}
                    className={cn(
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isSelected
                        ? "bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/30"
                        : disabled
                          ? "cursor-not-allowed text-muted-foreground/30"
                          : "text-foreground/85 hover:bg-primary/15 hover:text-foreground",
                      isToday && !isSelected && "ring-1 ring-primary/40"
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>

            {/* Footer actions */}
            <div className="mt-3 flex items-center justify-between border-t border-border/40 px-1 pt-3">
              <button
                type="button"
                onClick={() => {
                  const iso = toISO(today.y, today.m, today.d)
                  if (!isDisabled(today.y, today.m, today.d)) {
                    onChange(iso)
                    setOpen(false)
                  }
                }}
                className="ledger text-[11px] uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
                className="ledger text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
