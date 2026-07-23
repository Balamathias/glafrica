"use client"

import { useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { inquiryApi, type InquirySubject } from "@/lib/api"
import { cn } from "@/lib/utils"

interface InquiryFormProps {
  subject: InquirySubject
  /** Prefills the message, e.g. "I'd like to source: Tilapia fingerlings". */
  prefill?: string
  /** Extra structured line for context, e.g. the product name. */
  contextLabel?: string
  submitLabel?: string
  onSuccess?: () => void
}

/**
 * Shared public inquiry form (contact / farm-store sourcing / partner). Posts to
 * the rate-limited /contact/ endpoint. The backend requires a message of at
 * least 20 characters, so a prefill is provided where the context is known.
 */
export function InquiryForm({
  subject,
  prefill = "",
  contextLabel,
  submitLabel = "Send inquiry",
  onSuccess,
}: InquiryFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState(prefill)
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const body = contextLabel ? `[${contextLabel}]\n\n${message}` : message
    if (body.trim().length < 20) {
      setError("Please add a little more detail (at least 20 characters).")
      return
    }

    setStatus("sending")
    try {
      await inquiryApi.submit({ name, email, phone: phone || undefined, subject, message: body })
      setStatus("done")
      onSuccess?.()
    } catch (err) {
      setStatus("idle")
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10" style={{ color: "var(--pasture)" }} />
        <h3 className="text-lg font-semibold text-foreground">Inquiry received</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thank you. Our team will get back to you shortly — usually within two working
          days.
        </p>
      </div>
    )
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-[color:var(--pasture)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pasture)]/30"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="ledger mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">
            Full name
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="ledger mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block">
        <span className="ledger mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">
          Phone <span className="normal-case opacity-60">(optional)</span>
        </span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
          placeholder="+234…"
        />
      </label>

      <label className="block">
        <span className="ledger mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">
          Message
        </span>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(inputCls, "resize-y")}
          placeholder="Tell us what you need — quantity, location, timing."
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--pasture)] px-6 py-3 font-semibold text-[color:var(--nightfield)] transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  )
}
