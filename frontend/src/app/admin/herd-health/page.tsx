"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Pencil,
  Trash2,
  Stethoscope,
  Syringe,
  Pill,
  Droplets,
  ClipboardList,
  Loader2,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  herdHealthApi,
  type AdminSpecies,
  type AdminVaccinationEvent,
  type VaccinationCategory,
  type VaccinationRoute,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"

const CATEGORY_OPTIONS: { value: VaccinationCategory; label: string; icon: React.ElementType }[] = [
  { value: "vaccine", label: "Vaccine", icon: Syringe },
  { value: "deworm", label: "Deworming", icon: Pill },
  { value: "vitamin", label: "Vitamin / Supplement", icon: Droplets },
  { value: "management", label: "Management", icon: ClipboardList },
]

const ROUTE_OPTIONS: { value: VaccinationRoute; label: string }[] = [
  { value: "sc", label: "Subcutaneous" },
  { value: "im", label: "Intramuscular" },
  { value: "oral", label: "Oral / Drinking water" },
  { value: "eye", label: "Eye drop / Intranasal" },
  { value: "spray", label: "Spray" },
  { value: "wing", label: "Wing web" },
  { value: "topical", label: "Topical / Pour-on" },
  { value: "other", label: "Other" },
]

interface SpeciesFormState {
  name: string
  common_breeds: string
  description: string
  source_note: string
  sort_order: number
  is_published: boolean
}

const emptySpeciesForm: SpeciesFormState = {
  name: "",
  common_breeds: "",
  description: "",
  source_note: "",
  sort_order: 0,
  is_published: true,
}

interface EventFormState {
  category: VaccinationCategory
  name: string
  protects_against: string
  age_offset_days: string
  age_label: string
  repeat_interval_days: string
  route: VaccinationRoute
  notes: string
  is_core: boolean
}

const emptyEventForm: EventFormState = {
  category: "vaccine",
  name: "",
  protects_against: "",
  age_offset_days: "",
  age_label: "",
  repeat_interval_days: "",
  route: "sc",
  notes: "",
  is_core: true,
}

export default function HerdHealthAdminPage() {
  const [species, setSpecies] = useState<AdminSpecies[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [events, setEvents] = useState<AdminVaccinationEvent[]>([])
  const [loadingSpecies, setLoadingSpecies] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Species modal state
  const [speciesModalOpen, setSpeciesModalOpen] = useState(false)
  const [editingSpecies, setEditingSpecies] = useState<AdminSpecies | null>(null)
  const [speciesForm, setSpeciesForm] = useState<SpeciesFormState>(emptySpeciesForm)

  // Event modal state
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminVaccinationEvent | null>(null)
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm)

  const [saving, setSaving] = useState(false)

  const activeSpecies = useMemo(
    () => species.find((s) => s.id === activeId) ?? null,
    [species, activeId]
  )

  const loadSpecies = useCallback(async (selectId?: string) => {
    setLoadingSpecies(true)
    try {
      const list = await herdHealthApi.getSpecies()
      setSpecies(list)
      setActiveId((prev) => selectId ?? prev ?? list[0]?.id ?? null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load species")
    } finally {
      setLoadingSpecies(false)
    }
  }, [])

  const loadEvents = useCallback(async (speciesId: string) => {
    setLoadingEvents(true)
    try {
      setEvents(await herdHealthApi.getEvents(speciesId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load protocol")
    } finally {
      setLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    loadSpecies()
  }, [loadSpecies])

  useEffect(() => {
    if (activeId) loadEvents(activeId)
    else setEvents([])
  }, [activeId, loadEvents])

  // ---------- Species handlers ----------

  const openCreateSpecies = () => {
    setEditingSpecies(null)
    setSpeciesForm(emptySpeciesForm)
    setSpeciesModalOpen(true)
  }

  const openEditSpecies = (s: AdminSpecies) => {
    setEditingSpecies(s)
    setSpeciesForm({
      name: s.name,
      common_breeds: s.common_breeds,
      description: s.description,
      source_note: s.source_note,
      sort_order: s.sort_order,
      is_published: s.is_published,
    })
    setSpeciesModalOpen(true)
  }

  const handleSaveSpecies = async () => {
    if (speciesForm.name.trim().length < 2) {
      toast.error("Species name is required")
      return
    }
    setSaving(true)
    try {
      if (editingSpecies) {
        await herdHealthApi.updateSpecies(editingSpecies.id, speciesForm)
        toast.success(`Updated ${speciesForm.name}`)
        await loadSpecies(editingSpecies.id)
      } else {
        const created = await herdHealthApi.createSpecies(speciesForm)
        toast.success(`Created ${created.name}`)
        await loadSpecies(created.id)
      }
      setSpeciesModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save species")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSpecies = async (s: AdminSpecies) => {
    if (
      !window.confirm(
        `Delete "${s.name}" and its entire protocol (${s.event_count} entries)? This cannot be undone.`
      )
    )
      return
    try {
      await herdHealthApi.deleteSpecies(s.id)
      toast.success(`Deleted ${s.name}`)
      setActiveId(null)
      await loadSpecies()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete species")
    }
  }

  // ---------- Event handlers ----------

  const openCreateEvent = () => {
    setEditingEvent(null)
    setEventForm(emptyEventForm)
    setEventModalOpen(true)
  }

  const openEditEvent = (e: AdminVaccinationEvent) => {
    setEditingEvent(e)
    setEventForm({
      category: e.category,
      name: e.name,
      protects_against: e.protects_against,
      age_offset_days: String(e.age_offset_days),
      age_label: e.age_label,
      repeat_interval_days: e.repeat_interval_days == null ? "" : String(e.repeat_interval_days),
      route: e.route,
      notes: e.notes,
      is_core: e.is_core,
    })
    setEventModalOpen(true)
  }

  const handleSaveEvent = async () => {
    if (!activeId) return
    if (!eventForm.name.trim()) {
      toast.error("Entry name is required")
      return
    }
    const ageDays = Number(eventForm.age_offset_days)
    if (!Number.isFinite(ageDays) || eventForm.age_offset_days === "") {
      toast.error("Age (days from birth) must be a number")
      return
    }
    if (!eventForm.age_label.trim()) {
      toast.error("Age label is required (e.g. “3 weeks”)")
      return
    }
    const repeat = eventForm.repeat_interval_days.trim()
    const payload = {
      species_id: activeId,
      category: eventForm.category,
      name: eventForm.name.trim(),
      protects_against: eventForm.protects_against.trim(),
      age_offset_days: ageDays,
      age_label: eventForm.age_label.trim(),
      repeat_interval_days: repeat === "" ? null : Number(repeat),
      route: eventForm.route,
      notes: eventForm.notes.trim(),
      is_core: eventForm.is_core,
    }
    setSaving(true)
    try {
      if (editingEvent) {
        await herdHealthApi.updateEvent(editingEvent.id, payload)
        toast.success("Entry updated")
      } else {
        await herdHealthApi.createEvent(payload)
        toast.success("Entry added")
      }
      setEventModalOpen(false)
      await loadEvents(activeId)
      await loadSpecies(activeId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save entry")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (e: AdminVaccinationEvent) => {
    if (!window.confirm(`Delete "${e.name}" from this protocol?`)) return
    try {
      await herdHealthApi.deleteEvent(e.id)
      toast.success("Entry deleted")
      if (activeId) {
        await loadEvents(activeId)
        await loadSpecies(activeId)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete entry")
    }
  }

  const inputLabel = "text-sm font-medium"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Herd Health Protocols"
        description="The vaccination and health schedules behind the public Herd Health Card. Changes go live immediately."
        actions={
          <Button onClick={openCreateSpecies}>
            <Plus className="mr-2 h-4 w-4" />
            New species
          </Button>
        }
      />

      {/* Species selector */}
      {loadingSpecies ? (
        <div className="flex items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading species…
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {species.map((s) => {
            const active = s.id === activeId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border/50 bg-card/50 text-foreground/75 hover:border-primary/40 hover:text-foreground"
                )}
              >
                {s.name}
                {!s.is_published && <EyeOff className="h-3.5 w-3.5 opacity-70" />}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    active ? "bg-primary-foreground/20" : "bg-muted"
                  )}
                >
                  {s.event_count}
                </span>
              </button>
            )
          })}
          {species.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No species yet — create the first one to start a protocol.
            </p>
          )}
        </div>
      )}

      {/* Active species panel */}
      {activeSpecies && (
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          {/* Species header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{activeSpecies.name}</h2>
                {!activeSpecies.is_published && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Unpublished
                  </span>
                )}
              </div>
              {activeSpecies.common_breeds && (
                <p className="mt-1 text-sm text-muted-foreground">{activeSpecies.common_breeds}</p>
              )}
              {activeSpecies.source_note && (
                <p className="mt-1 max-w-xl text-xs text-muted-foreground/70">
                  Source: {activeSpecies.source_note}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditSpecies(activeSpecies)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit species
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteSpecies(activeSpecies)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
              <Button size="sm" onClick={openCreateEvent}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add entry
              </Button>
            </div>
          </div>

          {/* Events table */}
          {loadingEvents ? (
            <div className="flex items-center gap-2 p-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading protocol…
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No entries yet. Add the first vaccination, deworming, or management entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Age</th>
                    <th className="px-5 py-3 font-medium">Entry</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Route</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Repeats</th>
                    <th className="px-5 py-3 font-medium">Core</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => {
                    const CatIcon =
                      CATEGORY_OPTIONS.find((c) => c.value === e.category)?.icon ?? Syringe
                    return (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border/30 last:border-0 hover:bg-muted/30"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 align-top">
                          <div className="font-medium tabular-nums">{e.age_label}</div>
                          <div className="text-xs text-muted-foreground">day {e.age_offset_days}</div>
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                              <CatIcon className="h-3.5 w-3.5 text-primary" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-medium">{e.name}</div>
                              {e.protects_against && (
                                <div className="text-xs text-muted-foreground">
                                  {e.protects_against}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-3.5 align-top text-muted-foreground md:table-cell">
                          {e.route_display}
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-3.5 align-top text-muted-foreground lg:table-cell">
                          {e.repeat_interval_days ? `Every ${e.repeat_interval_days} days` : "—"}
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-medium",
                              e.is_core
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {e.is_core ? "Core" : "Optional"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right align-top">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditEvent(e)}
                            aria-label={`Edit ${e.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEvent(e)}
                            className="text-destructive hover:bg-destructive/10"
                            aria-label={`Delete ${e.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Species modal */}
      <Dialog open={speciesModalOpen} onOpenChange={setSpeciesModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editingSpecies ? "Edit species" : "New species"}</DialogTitle>
            <DialogDescription>
              A species groups a full protocol on the public Herd Health Card.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className={inputLabel}>Name *</label>
              <Input
                value={speciesForm.name}
                onChange={(e) => setSpeciesForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Goats"
              />
            </div>
            <div className="space-y-1.5">
              <label className={inputLabel}>Common breeds</label>
              <Input
                value={speciesForm.common_breeds}
                onChange={(e) => setSpeciesForm((f) => ({ ...f, common_breeds: e.target.value }))}
                placeholder="e.g., Boer, Kalahari Red, West African Dwarf"
              />
            </div>
            <div className="space-y-1.5">
              <label className={inputLabel}>Description</label>
              <Textarea
                rows={2}
                value={speciesForm.description}
                onChange={(e) => setSpeciesForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short line about this protocol"
              />
            </div>
            <div className="space-y-1.5">
              <label className={inputLabel}>Source note</label>
              <Textarea
                rows={2}
                value={speciesForm.source_note}
                onChange={(e) => setSpeciesForm((f) => ({ ...f, source_note: e.target.value }))}
                placeholder="Where this schedule is compiled from — shown on the public card"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <label className={inputLabel}>Sort order</label>
                <Input
                  type="number"
                  className="w-28"
                  value={String(speciesForm.sort_order)}
                  onChange={(e) =>                    setSpeciesForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm">
                <Checkbox
                  checked={speciesForm.is_published}
                  onChange={(checked) => setSpeciesForm((f) => ({ ...f, is_published: checked }))
                  }
                />
                Published on the public card
              </label>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpeciesModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSpecies} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSpecies ? "Save changes" : "Create species"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event modal */}
      <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit entry" : "Add entry"}</DialogTitle>
            <DialogDescription>
              {activeSpecies ? `Protocol entry for ${activeSpecies.name}.` : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={inputLabel}>Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) =>                    setEventForm((f) => ({ ...f, category: e.target.value as VaccinationCategory }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={inputLabel}>Route</label>
                <select
                  value={eventForm.route}
                  onChange={(e) =>                    setEventForm((f) => ({ ...f, route: e.target.value as VaccinationRoute }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {ROUTE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={inputLabel}>Name *</label>
              <Input
                value={eventForm.name}
                onChange={(e) => setEventForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., PPR vaccine"
              />
            </div>

            <div className="space-y-1.5">
              <label className={inputLabel}>Protects against</label>
              <Input
                value={eventForm.protects_against}
                onChange={(e) => setEventForm((f) => ({ ...f, protects_against: e.target.value }))}
                placeholder="e.g., Peste des Petits Ruminants"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className={inputLabel}>Age in days *</label>
                <Input
                  type="number"
                  value={eventForm.age_offset_days}
                  onChange={(e) => setEventForm((f) => ({ ...f, age_offset_days: e.target.value }))}
                  placeholder="e.g., 21"
                />
              </div>
              <div className="space-y-1.5">
                <label className={inputLabel}>Age label *</label>
                <Input
                  value={eventForm.age_label}
                  onChange={(e) => setEventForm((f) => ({ ...f, age_label: e.target.value }))}
                  placeholder="e.g., 3 weeks"
                />
              </div>
              <div className="space-y-1.5">
                <label className={inputLabel}>Repeats every (days)</label>
                <Input
                  type="number"
                  value={eventForm.repeat_interval_days}
                  onChange={(e) =>                    setEventForm((f) => ({ ...f, repeat_interval_days: e.target.value }))
                  }
                  placeholder="blank = one-off"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={inputLabel}>Notes</label>
              <Textarea
                rows={2}
                value={eventForm.notes}
                onChange={(e) => setEventForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Shown on the public card, e.g. booster guidance"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={eventForm.is_core}
                onChange={(checked) => setEventForm((f) => ({ ...f, is_core: checked }))}
              />
              Core (strongly recommended) — untick for optional/regional
            </label>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEvent ? "Save changes" : "Add entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
