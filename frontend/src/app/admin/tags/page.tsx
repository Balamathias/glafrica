"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Edit,
  Tag,
  XCircle,
  PawPrint,
  CheckCircle,
  AlertCircle,
  Hash,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSelectionStore } from "@/lib/admin-store"
import {
  tagsApi,
  type Tag as TagType,
  type PaginatedResponse,
  adminApi,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { DataTable } from "@/components/admin/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Extended tag with usage count
interface TagWithStats extends TagType {
  usage_count?: number
  created_at?: string
  updated_at?: string
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Generate a color based on tag name for visual variety
function getTagColor(name: string): string {
  const colors = [
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    "bg-rose-500/10 text-rose-500 border-rose-500/20",
  ]
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export default function AdminTagsPage() {
  const { selectedIds, toggleItem, selectAll, clearSelection, isSelected } = useSelectionStore()

  const [data, setData] = useState<PaginatedResponse<TagWithStats> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    ids: string[]
    names: string[]
  }>({ open: false, ids: [], names: [] })
  const [createEditModal, setCreateEditModal] = useState<{
    open: boolean
    mode: "create" | "edit"
    tag: TagWithStats | null
  }>({ open: false, mode: "create", tag: null })

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      if (searchQuery) params.append("search", searchQuery)

      const response = await adminApi.get<PaginatedResponse<TagWithStats>>(`/tags/?${params}`)
      setData(response.data)
    } catch (error) {
      console.error("Failed to load tags:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate selection state for header checkbox
  const allSelected = data?.results.length
    ? data.results.every((item) => selectedIds.includes(item.id))
    : false
  const someSelected = data?.results.length
    ? data.results.some((item) => selectedIds.includes(item.id)) && !allSelected
    : false

  // Define columns
  const columns: ColumnDef<TagWithStats>[] = useMemo(
    () => [
      // Selection checkbox
      {
        id: "select",
        header: () => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(checked) => {
                if (checked && data?.results) {
                  selectAll(data.results.map((item) => item.id))
                } else {
                  clearSelection()
                }
              }}
              size="sm"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected(row.original.id)}
              onChange={() => toggleItem(row.original.id)}
              size="sm"
            />
          </div>
        ),
        enableSorting: false,
      },
      // Tag Preview
      {
        id: "preview",
        header: "Tag",
        cell: ({ row }) => (
          <Badge className={cn("gap-1 border", getTagColor(row.original.name))}>
            <Hash size={12} />
            {row.original.name}
          </Badge>
        ),
      },
      // Slug
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground font-mono">
            {row.original.slug}
          </span>
        ),
      },
      // Usage Count
      {
        id: "usage",
        header: "Usage",
        cell: ({ row }) => {
          const count = row.original.usage_count || 0
          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <PawPrint size={12} />
                {count}
              </Badge>
              <span className="text-xs text-muted-foreground">
                livestock
              </span>
            </div>
          )
        },
      },
      // Created
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.created_at ? formatDate(row.original.created_at) : "-"}
          </span>
        ),
      },
      // Actions
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setCreateEditModal({ open: true, mode: "edit", tag: row.original })
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialog({
                    open: true,
                    ids: [row.original.id],
                    names: [row.original.name],
                  })
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
      },
    ],
    [data, selectedIds, isSelected, toggleItem, selectAll, clearSelection, allSelected, someSelected]
  )

  // Handle delete
  const handleDelete = async () => {
    try {
      for (const id of deleteDialog.ids) {
        await tagsApi.delete(id)
      }
      setDeleteDialog({ open: false, ids: [], names: [] })
      clearSelection()
      loadData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedNames = data?.results
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => item.name) || []
    setDeleteDialog({ open: true, ids: [...selectedIds], names: selectedNames })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Manage tags for livestock organization and filtering"
        actions={
          <Button
            size="sm"
            onClick={() => setCreateEditModal({ open: true, mode: "create", tag: null })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        }
      />

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          className="flex items-center justify-between rounded-xl glass border border-border/50 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm">
            <span className="font-medium">{selectedIds.length}</span> item(s) selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <XCircle className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tags Preview Grid (optional visual display) */}
      {data?.results && data.results.length > 0 && (
        <div className="p-4 rounded-xl glass border border-border/50">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Tag size={14} className="text-primary" />
            All Tags Preview
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.results.map((tag) => (
              <Badge
                key={tag.id}
                className={cn(
                  "gap-1 border cursor-pointer hover:opacity-80 transition-opacity",
                  getTagColor(tag.name)
                )}
                onClick={() => setCreateEditModal({ open: true, mode: "edit", tag })}
              >
                <Hash size={10} />
                {tag.name}
                {tag.usage_count !== undefined && tag.usage_count > 0 && (
                  <span className="ml-1 opacity-60">({tag.usage_count})</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.results || []}
        searchKey="name"
        searchPlaceholder="Search tags..."
        isLoading={isLoading}
        serverSide
        totalCount={data?.count || 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={(row) =>
          setCreateEditModal({ open: true, mode: "edit", tag: row })
        }
      />

      {/* Create/Edit Modal */}
      <TagModal
        open={createEditModal.open}
        mode={createEditModal.mode}
        tag={createEditModal.tag}
        onOpenChange={(open) =>
          setCreateEditModal({ open, mode: "create", tag: null })
        }
        onSuccess={() => {
          setCreateEditModal({ open: false, mode: "create", tag: null })
          loadData()
        }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, ids: [], names: [] })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag{deleteDialog.ids.length > 1 ? "s" : ""}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {deleteDialog.names.length === 1 ? (
                <span className="font-medium">{deleteDialog.names[0]}</span>
              ) : (
                <span className="font-medium">{deleteDialog.names.length} tags</span>
              )}
              ? This will remove the tag from all associated livestock.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, ids: [], names: [] })}
            >
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

// Tag Create/Edit Modal
function TagModal({
  open,
  mode,
  tag,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  mode: "create" | "edit"
  tag: TagWithStats | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === "edit" && tag) {
        setName(tag.name)
      } else {
        setName("")
      }
      setError("")
    }
  }, [open, mode, tag])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    // Validate tag name (no special characters except hyphens)
    if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
      setError("Tag name can only contain letters, numbers, spaces, and hyphens")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      if (mode === "create") {
        await tagsApi.create(name.trim())
      } else if (tag) {
        await tagsApi.update(tag.id, { name: name.trim() })
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Tag" : "Edit Tag"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new tag for categorizing livestock."
              : "Update the tag name."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premium, Organic, Grass-fed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The slug will be auto-generated from the name.
            </p>
          </div>

          {/* Preview */}
          {name && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Preview</label>
              <Badge className={cn("gap-1 border", getTagColor(name))}>
                <Hash size={12} />
                {name}
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {mode === "create" ? "Create" : "Save Changes"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
