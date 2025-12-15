"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Heart, Syringe, Plus, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLivestockForm } from "../livestock-form-context"

export function StepDetailsHealth() {
  const {
    state,
    updateField,
    addVaccination,
    updateVaccination,
    removeVaccination,
  } = useLivestockForm()
  const { errors } = state

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold">Details & Health</h3>
        <p className="text-sm text-muted-foreground">
          Provide detailed description and health information for potential buyers.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-muted-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <textarea
            placeholder="Describe this livestock in detail. Include information about appearance, temperament, breeding history, special qualities, etc."
            value={state.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            className={cn(
              "flex w-full rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-sm transition-colors",
              "placeholder:text-muted-foreground resize-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              errors.description && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          {errors.description ? (
            <motion.p
              className="text-xs text-destructive"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.description}
            </motion.p>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "text-xs",
              state.description.length < 50 ? "text-muted-foreground" : "text-primary"
            )}
          >
            {state.description.length}/50 minimum
          </span>
        </div>
      </div>

      {/* Health Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Health Status <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-3 text-muted-foreground">
            <Heart className="h-4 w-4" />
          </div>
          <textarea
            placeholder="Describe the current health condition. Include any recent check-ups, known conditions, dietary requirements, etc."
            value={state.health_status}
            onChange={(e) => updateField("health_status", e.target.value)}
            rows={4}
            className={cn(
              "flex w-full rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-sm transition-colors",
              "placeholder:text-muted-foreground resize-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              errors.health_status && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          {errors.health_status ? (
            <motion.p
              className="text-xs text-destructive"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.health_status}
            </motion.p>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "text-xs",
              state.health_status.length < 20 ? "text-muted-foreground" : "text-primary"
            )}
          >
            {state.health_status.length}/20 minimum
          </span>
        </div>
      </div>

      {/* Vaccination History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Syringe className="h-4 w-4 text-muted-foreground" />
            Vaccination History
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVaccination}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {state.vaccination_history.length === 0 ? (
            <motion.div
              className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Syringe className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No vaccination records yet</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Add Record&quot; to add vaccination history
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {state.vaccination_history.map((record, index) => (
                <motion.div
                  key={record.id}
                  className="rounded-xl border border-border/50 bg-background p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid gap-3 sm:grid-cols-3">
                      {/* Vaccine Name */}
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-xs text-muted-foreground">Vaccine Name</label>
                        <Input
                          placeholder="e.g., PPR Vaccine"
                          value={record.name}
                          onChange={(e) =>
                            updateVaccination(record.id, { name: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-xs text-muted-foreground">Date</label>
                        <Input
                          type="date"
                          value={record.date}
                          onChange={(e) =>
                            updateVaccination(record.id, { date: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-xs text-muted-foreground">Notes (optional)</label>
                        <Input
                          placeholder="e.g., Booster shot"
                          value={record.notes || ""}
                          onChange={(e) =>
                            updateVaccination(record.id, { notes: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVaccination(record.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper card */}
      <div className="rounded-xl bg-muted/50 p-4 space-y-3">
        <h4 className="font-medium text-sm">Writing Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <strong>Description:</strong> Be specific about physical characteristics, temperament,
            and any breeding lineage
          </li>
          <li>
            <strong>Health Status:</strong> Include information about general condition, recent
            vet visits, and any ongoing treatments
          </li>
          <li>
            <strong>Vaccinations:</strong> List all vaccinations with dates - buyers value complete
            health records
          </li>
        </ul>
      </div>
    </div>
  )
}
