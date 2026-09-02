"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  FileText,
  EyeOff,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  courseMaterialsApi,
  type AdminCourseMaterial,
  type CourseTopic,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

const MAX_FILE_BYTES = 25 * 1024 * 1024

/** Mirrors `CourseMaterial.TOPIC_CHOICES` on the backend. */
const TOPIC_OPTIONS: { value: CourseTopic; label: string }[] = [
  { value: "breeding", label: "Breeding & improved genetics" },
  { value: "nutrition", label: "Feeding & nutrition" },
  { value: "health", label: "Disease prevention" },
  { value: "management", label: "Farm management & records" },
]

interface FormState {
  title: string
  summary: string
  topic: CourseTopic
  page_count: string
  sort_order: string
  is_published: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  summary: "",
  topic: "management",
  page_count: "",
  sort_order: "0",
  is_published: true,
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—"
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

export default function AdminCourseMaterialsPage() {
  const [materials, setMaterials] = useState<AdminCourseMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCourseMaterial | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<AdminCourseMaterial | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setMaterials(await courseMaterialsApi.list())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load materials")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setFile(null)
    setForm({ ...EMPTY_FORM, sort_order: String(materials.length) })
    setModalOpen(true)
  }

  const openEdit = (material: AdminCourseMaterial) => {
    setEditing(material)
    setFile(null)
    setForm({
      title: material.title,
      summary: material.summary,
      topic: material.topic,
      page_count: material.page_count ? String(material.page_count) : "",
      sort_order: String(material.sort_order),
      is_published: material.is_published,
    })
    setModalOpen(true)
  }

  const handleFile = (selected: File | null) => {
    if (!selected) return setFile(null)
    if (selected.type !== "application/pdf") {
      toast.error("Course materials must be PDF files.")
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      toast.error("That file is larger than 25 MB.")
      return
    }
    setFile(selected)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Give the material a title.")
      return
    }
    if (!editing && !file) {
      toast.error("Attach the PDF.")
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        topic: form.topic,
        sort_order: Number(form.sort_order) || 0,
        is_published: form.is_published,
        ...(form.page_count ? { page_count: Number(form.page_count) } : {}),
        ...(file ? { file_size_bytes: file.size } : {}),
      }

      if (editing) {
        await courseMaterialsApi.update(editing.id, payload, file)
        toast.success("Material updated")
      } else {
        await courseMaterialsApi.create(payload, file)
        toast.success("Material added")
      }
      setModalOpen(false)
      load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  /** Swap sort_order with the neighbour — the curriculum sequence is editorial. */
  const move = async (material: AdminCourseMaterial, direction: -1 | 1) => {
    const index = materials.findIndex((m) => m.id === material.id)
    const neighbour = materials[index + direction]
    if (!neighbour) return

    try {
      await Promise.all([
        courseMaterialsApi.update(material.id, { sort_order: neighbour.sort_order }),
        courseMaterialsApi.update(neighbour.id, { sort_order: material.sort_order }),
      ])
      load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reorder")
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await courseMaterialsApi.remove(deleting.id)
      toast.success("Material deleted")
      setDeleting(null)
      load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Materials"
        description="The downloadable training PDFs on the public Learn page. Order here is the order farmers see."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add material
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center gap-2 p-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading materials…
          </div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No course materials yet. Add the first PDF to replace the placeholder on
            the Learn page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Topic</th>
                  <th className="p-4 font-medium">Size</th>
                  <th className="p-4 font-medium">Downloads</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <tr
                    key={material.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => move(material, -1)}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={index === materials.length - 1}
                          onClick={() => move(material, 1)}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {material.title}
                      {material.summary && (
                        <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
                          {material.summary}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {material.topic_display}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatSize(material.file_size_bytes)}
                    </td>
                    <td className="p-4 tabular-nums text-muted-foreground">
                      {material.download_count}
                    </td>
                    <td className="p-4">
                      {material.is_published ? (
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
                        {material.file_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={material.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(material)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(material)}
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
        <DialogContent size="md" className="flex max-h-[90vh] flex-col">
          <DialogHeader className="pr-12">
            <DialogTitle>{editing ? "Edit material" : "Add material"}</DialogTitle>
            <DialogDescription className="text-sm">
              Materials are grouped by topic on the public page, in the order set here.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="min-h-0 flex-1 space-y-5">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Goat nutrition: building a balanced ration"
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Summary</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
                placeholder="One or two lines shown on the card."
                className="mt-1.5 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Topic</label>
                <select
                  value={form.topic}
                  onChange={(e) =>
                    setForm({ ...form, topic: e.target.value as CourseTopic })
                  }
                  className="mt-1.5 w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:border-primary/50"
                >
                  {TOPIC_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Page count</label>
                <Input
                  type="number"
                  min={0}
                  value={form.page_count}
                  onChange={(e) => setForm({ ...form, page_count: e.target.value })}
                  placeholder="Optional"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">PDF</label>
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
                        : "Drop the PDF, or click to browse"}
                    </span>
                    <span className="text-xs">PDF only, up to 25 MB</span>
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

            <Checkbox
              checked={form.is_published}
              onChange={(is_published) => setForm({ ...form, is_published })}
              label="Publish"
              description="Show this material on the public Learn page."
            />
          </DialogBody>

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
        <DialogContent size="sm">
          <DialogHeader className="pr-12">
            <DialogTitle>Delete material?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleting?.title}&rdquo; will be removed from the Learn page. This
              cannot be undone.
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
