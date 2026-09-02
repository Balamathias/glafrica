"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Upload,
  FileText,
  AlertTriangle,
  EyeOff,
  ExternalLink,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { certificatesApi, type AdminCertificate } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MAX_FILE_BYTES = 10 * 1024 * 1024

interface FormState {
  holder_name: string
  phone: string
  certificate_number: string
  cohort: string
  programme: string
  issued_on: string
  is_published: boolean
}

const EMPTY_FORM: FormState = {
  holder_name: "",
  phone: "",
  certificate_number: "",
  cohort: "",
  programme: "",
  issued_on: "",
  is_published: true,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCertificate | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<AdminCertificate | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const data = await certificatesApi.list({ search: query || undefined })
      setCertificates(data.results)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load certificates"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced so typing a surname doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => load(search), 300)
    return () => clearTimeout(timer)
  }, [search, load])

  const openCreate = async () => {
    setEditing(null)
    setFile(null)
    setForm({ ...EMPTY_FORM, issued_on: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
    // Suggest the next number so the secretary doesn't have to track sequence.
    try {
      const certificate_number = await certificatesApi.nextNumber()
      setForm((f) => (f.certificate_number ? f : { ...f, certificate_number }))
    } catch {
      // A suggestion is a convenience — the field is still editable.
    }
  }

  const openEdit = (certificate: AdminCertificate) => {
    setEditing(certificate)
    setFile(null)
    setForm({
      holder_name: certificate.holder_name,
      phone: certificate.phone,
      certificate_number: certificate.certificate_number,
      cohort: certificate.cohort,
      programme: certificate.programme,
      issued_on: certificate.issued_on,
      is_published: certificate.is_published,
    })
    setModalOpen(true)
  }

  const handleFile = (selected: File | null) => {
    if (!selected) return setFile(null)
    if (selected.type !== "application/pdf") {
      toast.error("Certificates must be PDF files.")
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      toast.error("That file is larger than 10 MB.")
      return
    }
    setFile(selected)
  }

  const handleSave = async () => {
    if (!form.holder_name.trim() || !form.phone.trim() || !form.issued_on) {
      toast.error("Name, phone number and issue date are required.")
      return
    }
    if (!editing && !file) {
      toast.error("Attach the certificate PDF.")
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await certificatesApi.update(editing.id, form, file)
        toast.success("Certificate updated")
      } else {
        const created = await certificatesApi.create(form, file)
        toast.success(`Certificate saved for ${created.holder_name}`)
        if (created.duplicate_phone) {
          toast.warning(
            "Another certificate already uses this phone number. That's fine if the farmer was re-trained — check if it's a duplicate."
          )
        }
      }
      setModalOpen(false)
      load(search)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await certificatesApi.remove(deleting.id)
      toast.success("Certificate deleted")
      setDeleting(null)
      load(search)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Training certificates farmers can look up and download. Published records go live on /certificates immediately."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add certificate
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, number or cohort"
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center gap-2 p-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading certificates…
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search
              ? "No certificates match that search."
              : "No certificates yet. Add the first one to start the public directory."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Holder</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Number</th>
                  <th className="p-4 font-medium">Cohort</th>
                  <th className="p-4 font-medium">Issued</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <tr
                    key={certificate.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {certificate.holder_name}
                        {certificate.duplicate_phone && (
                          <span
                            title="Another certificate shares this phone number"
                            className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-600"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Duplicate
                          </span>
                        )}
                      </div>
                      {certificate.programme && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {certificate.programme}
                        </p>
                      )}
                    </td>
                    {/* Full number: staff need it to tell two farmers apart. The
                        public endpoint only ever returns the masked form. */}
                    <td className="p-4 tabular-nums text-muted-foreground">
                      {certificate.phone}
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {certificate.certificate_number}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {certificate.cohort || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(certificate.issued_on)}
                    </td>
                    <td className="p-4">
                      {certificate.is_published ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-emerald-600">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <EyeOff className="h-3 w-3" />
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {certificate.file_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={certificate.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(certificate)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(certificate)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit certificate" : "Add certificate"}
            </DialogTitle>
            <DialogDescription>
              The phone number is the farmer&apos;s search key — enter it exactly as
              they use it. It is never shown in full on the public site.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <Input
                value={form.holder_name}
                onChange={(e) => setForm({ ...form, holder_name: e.target.value })}
                placeholder="Amina Yusuf"
                className="mt-1.5"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Phone number</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08012344521"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Certificate number</label>
                <Input
                  value={form.certificate_number}
                  onChange={(e) =>
                    setForm({ ...form, certificate_number: e.target.value })
                  }
                  placeholder="GLA-2026-0094"
                  className="mt-1.5 font-mono"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Cohort</label>
                <Input
                  value={form.cohort}
                  onChange={(e) => setForm({ ...form, cohort: e.target.value })}
                  placeholder="Cohort 01"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Programme</label>
                <Input
                  value={form.programme}
                  onChange={(e) => setForm({ ...form, programme: e.target.value })}
                  placeholder="Small Ruminants"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Issue date</label>
              <Input
                type="date"
                value={form.issued_on}
                onChange={(e) => setForm({ ...form, issued_on: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Certificate PDF</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFile(e.dataTransfer.files?.[0] ?? null)
                }}
                className={cn(
                  "mt-1.5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6",
                  "border-border/60 text-sm text-muted-foreground transition-colors",
                  "hover:border-primary/50 hover:text-foreground"
                )}
              >
                {file ? (
                  <>
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{file.name}</span>
                    <span className="text-xs">
                      {(file.size / 1024 / 1024).toFixed(1)} MB — click to replace
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>
                      {editing
                        ? "Drop a new PDF to replace the current one"
                        : "Drop the certificate PDF, or click to browse"}
                    </span>
                    <span className="text-xs">PDF only, up to 10 MB</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              Publish — make this findable on the public directory
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete certificate?</DialogTitle>
            <DialogDescription>
              {deleting?.holder_name}&apos;s certificate ({deleting?.certificate_number})
              will be removed and will no longer be findable. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
