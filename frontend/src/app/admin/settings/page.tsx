"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Users, Save } from "lucide-react"

import { siteFiguresApi, certificatesApi, type AdminSiteFigure } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminSettingsPage() {
  const [figure, setFigure] = useState<AdminSiteFigure | null>(null)
  const [value, setValue] = useState("")
  const [certificateCount, setCertificateCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const figures = await siteFiguresApi.list()
        const farmersTrained =
          figures.find((f) => f.key === "farmers_trained") ?? null
        setFigure(farmersTrained)
        setValue(
          farmersTrained?.integer_value != null
            ? String(farmersTrained.integer_value)
            : ""
        )
      } catch {
        // No row yet is a normal first-run state, not an error.
      } finally {
        setLoading(false)
      }

      // Context only — the public figure is the CEO's number, not this count.
      try {
        const certificates = await certificatesApi.list()
        setCertificateCount(certificates.count)
      } catch {
        setCertificateCount(null)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error("Enter a whole number.")
      return
    }

    setSaving(true)
    try {
      const saved = await siteFiguresApi.setInteger(
        "farmers_trained",
        parsed,
        "Farmers trained"
      )
      setFigure(saved)
      toast.success("Public figure updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Figures"
        description="Headline numbers shown across the public site. Changes go live immediately."
      />

      <div className="max-w-xl rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Farmers trained</h2>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Appears in the homepage hero, the impact strip, the About page and the
              footer, animating up from zero on each visit.
            </p>

            <div className="mt-5 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium">Number</label>
                <Input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="147"
                  className="mt-1.5 tabular-nums"
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>

            {certificateCount !== null && (
              <p className="mt-4 text-xs text-muted-foreground">
                For reference: {certificateCount} certificate
                {certificateCount === 1 ? "" : "s"} on file. This figure is set by
                hand and does not have to match — farmers trained before records moved
                online still count.
              </p>
            )}

            {figure?.updated_at && (
              <p className="mt-2 text-xs text-muted-foreground/70">
                Last updated {new Date(figure.updated_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {figure.updated_by_name ? ` by ${figure.updated_by_name}` : ""}
              </p>
            )}

            {!figure && (
              <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-600">
                This figure has not been set yet — the public site is showing 0. Set it
                before launch.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
