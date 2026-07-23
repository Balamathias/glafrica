"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog"
import { InquiryForm } from "./inquiry-form"
import type { InquirySubject } from "@/lib/api"

interface InquiryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** What the inquiry is about, e.g. "Kalahari Red Buck". */
  itemName: string
  /** Structured context line sent with the message, e.g. "Livestock — Kalahari Red Buck". */
  contextLabel: string
  subject?: InquirySubject
  title?: string
  description?: string
  prefill?: string
}

/**
 * Item-scoped inquiry modal — wraps the shared InquiryForm with the item's
 * context so "Contact Seller" / "Make Inquiry" buttons land in the same
 * rate-limited contact pipeline the rest of the site uses.
 */
export function InquiryDialog({
  open,
  onOpenChange,
  itemName,
  contextLabel,
  subject = "purchase",
  title = "Contact us about this listing",
  description,
  prefill,
}: InquiryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>
            {description ??
              `Tell us what you need regarding "${itemName}" and our team will follow up. We respond within two working days.`}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <InquiryForm
            subject={subject}
            contextLabel={contextLabel}
            prefill={prefill ?? `I'm interested in "${itemName}". `}
            submitLabel="Send inquiry"
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
