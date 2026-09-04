"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Baby,
  Wheat,
  ShieldAlert,
  ClipboardCheck,
  Download,
  FileText,
  Presentation,
  Eye,
} from "lucide-react"
import { courseMaterialsApi } from "@/lib/api"
import type { CourseMaterial, CourseTopic } from "@/lib/types"
import { downloadFile } from "@/lib/download"
import { cn } from "@/lib/utils"

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/api\/v1\/?$/, "")

/** Mirrors `CourseMaterial.TOPIC_CHOICES` on the backend. */
const TOPIC_META: Record<CourseTopic, { label: string; icon: React.ElementType }> = {
  breeding: { label: "Breeding", icon: Baby },
  nutrition: { label: "Nutrition", icon: Wheat },
  health: { label: "Health", icon: ShieldAlert },
  management: { label: "Management", icon: ClipboardCheck },
}

const TOPIC_ORDER: CourseTopic[] = ["breeding", "nutrition", "health", "management"]

function formatFileSize(bytes: number | null): string | null {
  if (!bytes) return null
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

/**
 * "PPTX · 18 slides · 2.4 MB", skipping whatever we don't know.
 *
 * The format leads: a farmer on a phone needs to know before tapping whether
 * this is a PDF they can read anywhere or a deck that wants an Office app.
 */
function formatMeta(material: CourseMaterial): string {
  return [
    material.format_label || null,
    material.page_count
      ? `${material.page_count} ${material.page_unit || "pages"}`
      : null,
    formatFileSize(material.file_size_bytes),
  ]
    .filter(Boolean)
    .join(" · ")
}

function CourseCard({ material, index }: { material: CourseMaterial; index: number }) {
  const meta = formatMeta(material)
  const FileIcon = material.page_unit === "slides" ? Presentation : FileText
  const [downloading, setDownloading] = useState(false)

  // Card title opens the hosted file in the browser's PDF viewer (preview); the
  // Download button hits the same-origin endpoint which streams the file as an
  // attachment — reliable and free of the cross-origin fetch issues.
  const previewUrl = `${API_ORIGIN}${material.download_url}`
  const downloadUrl = `${API_ORIGIN}${material.download_file_url}`

  const handleDownload = () => {
    if (downloading) return
    setDownloading(true)
    // The download is streamed directly by the browser, so it completes
    // immediately on click — reset the flag on the next tick.
    downloadFile(downloadUrl)
    setTimeout(() => setDownloading(false), 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl p-6 md:p-7",
        "border border-border/50 bg-card/50 backdrop-blur-sm",
        "transition-all duration-500",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/50 transition-colors duration-300 group-hover:bg-background/80">
          <FileIcon className="h-5 w-5 text-primary" />
        </div>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2"
        >
          <h3 className="text-lg font-semibold leading-snug text-foreground underline-offset-4 transition-colors group-hover:text-primary">
            {material.title}
          </h3>
        </a>

        {material.summary && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {material.summary}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="ledger text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
            {meta || "Preview"}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Preview in the PDF viewer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
              Preview
            </a>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-60"
            >
              <Download className={cn("h-4 w-4", downloading && "animate-bounce")} />
              {downloading ? "Downloading…" : "Download"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * The downloadable curriculum on /learn. Replaces the Herd Health Card as the
 * page's signature block.
 *
 * Materials are grouped under the same four topic headings used by the page's
 * topic cards, so the set reads as a curriculum rather than a file dump.
 */
export function CourseMaterials() {
  const [materials, setMaterials] = useState<CourseMaterial[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    courseMaterialsApi
      .getList()
      .then(setMaterials)
      .catch(() => setFailed(true))
  }, [])

  if (failed || (materials && materials.length === 0)) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Course materials are being prepared. Check back shortly, or{" "}
        <a href="#get-in-touch" className="text-primary underline underline-offset-4">
          ask us directly
        </a>
        .
      </p>
    )
  }

  if (!materials) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-3xl border border-border/50 bg-card/30"
          />
        ))}
      </div>
    )
  }

  const groups = TOPIC_ORDER.map((topic) => ({
    topic,
    ...TOPIC_META[topic],
    items: materials.filter((m) => m.topic === topic),
  })).filter((group) => group.items.length > 0)

  let cardIndex = 0

  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const Icon = group.icon
        return (
          <div key={group.topic}>
            <div className="mb-5 flex items-center gap-2.5">
              <Icon className="h-4 w-4" style={{ color: "var(--ochre)" }} />
              <h3 className="ledger text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {group.label}
              </h3>
              <span className="h-px flex-1 bg-border/60" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((material) => (
                <CourseCard key={material.id} material={material} index={cardIndex++} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
