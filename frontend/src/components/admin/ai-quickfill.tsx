"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, ImagePlus, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  aiQuickfillApi,
  type LivestockSuggestion,
  type EggSuggestion,
} from "@/lib/admin-api"

type Kind = "livestock" | "egg"

interface AIQuickfillProps {
  kind: Kind
  /** Receives the validated suggestion plus the original photo file. */
  onResult: (suggestion: LivestockSuggestion | EggSuggestion, file: File) => void
  className?: string
}

/**
 * Drop one photo → the AI drafts the form fields for review. The image is
 * downscaled client-side (max 1024px JPEG) so the payload stays tiny, and the
 * original file is handed back so it can be queued as the record's media.
 */
export function AIQuickfill({ kind, onResult, className }: AIQuickfillProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [status, setStatus] = React.useState<"idle" | "working" | "done" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{ confidence: number; notes: string } | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  const downscale = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 1024
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error("Canvas unavailable"))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error("Could not read the image"))
      }
      img.src = url
    })

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return
    setStatus("working")
    setError(null)
    setResult(null)
    setPreview(URL.createObjectURL(file))
    try {
      const dataUrl = await downscale(file)
      const suggestion =
        kind === "livestock"
          ? await aiQuickfillApi.classifyLivestock(dataUrl)
          : await aiQuickfillApi.classifyEgg(dataUrl)
      onResult(suggestion, file)
      setResult({ confidence: suggestion.confidence, notes: suggestion.notes })
      setStatus("done")
    } catch (err) {
      setStatus("error")
      setError(
        err instanceof Error ? err.message : "Could not analyse the image — fill the form manually."
      )
    }
  }

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setStatus("idle")
    setError(null)
    setResult(null)
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-primary/25 bg-primary/[0.04] p-4",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-start gap-3">
        {/* Thumb / icon */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-primary/10">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
          )}
          {status === "working" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm font-semibold text-foreground">AI quick-fill</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Drop one photo and the assistant drafts the record — you review every
                  field before submitting.
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Choose photo
                </button>
              </motion.div>
            )}

            {status === "working" && (
              <motion.div key="working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm font-semibold text-foreground">Reading the photo…</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Identifying {kind === "livestock" ? "species, breed, and build" : "bird type and egg details"}.
                </p>
              </motion.div>
            )}

            {status === "done" && result && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Draft filled — review before submitting
                  <span className="ledger rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {Math.round(result.confidence * 100)}% match
                  </span>
                </p>
                {result.notes && (
                  <p className="mt-0.5 text-xs text-muted-foreground">Check: {result.notes}</p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  The photo has been added to this record&apos;s media.
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Try another photo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(status === "done" || status === "error") && (
          <button
            type="button"
            onClick={reset}
            aria-label="Reset quick-fill"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
