"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Edit,
  Folder,
  XCircle,
  PawPrint,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSelectionStore } from "@/lib/admin-store"
import {
  categoriesApi,
  type Category,
  type PaginatedResponse,
  adminApi,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { DataTable } from "@/components/admin/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

// Extended category with stats
interface CategoryWithStats extends Category {
  livestock_count?: number
  available_count?: number
  sold_count?: number
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminCategoriesPage() {
  const { selectedIds, toggleItem, selectAll, clearSelection, isSelected } = useSelectionStore()

  const [data, setData] = useState<PaginatedResponse<CategoryWithStats> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    id: string
    name: string
    hasLivestock: boolean
  }>({ open: false, id: "", name: "", hasLivestock: false })
  const [createEditModal, setCreateEditModal] = useState<{
    open: boolean
    mode: "create" | "edit"
    category: CategoryWithStats | null
  }>({ open: false, mode: "create", category: null })

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      if (searchQuery) params.append("search", searchQuery)

      const response = await adminApi.get<PaginatedResponse<CategoryWithStats>>(`/categories/?${params}`)
      setData(response.data)
    } catch (error) {
      console.error("Failed to load categories:", error)
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
  const columns: ColumnDef<CategoryWithStats>[] = useMemo(
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
      // Icon
      {
        id: "icon",
        header: "",
        cell: () => (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Folder size={18} className="text-primary" />
          </div>
        ),
        enableSorting: false,
      },
      // Name
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.slug}</p>
          </div>
        ),
      },
      // Description
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {row.original.description || "-"}
          </p>
        ),
      },
      // Livestock Count
      {
        id: "livestock",
        header: "Livestock",
        cell: ({ row }) => {
          const total = row.original.livestock_count || 0
          const available = row.original.available_count || 0
          const sold = row.original.sold_count || 0

          return (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <PawPrint size={12} />
                {total}
              </Badge>
              {total > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="text-emerald-500">{available} avail</span>
                  <span>/</span>
                  <span className="text-red-500">{sold} sold</span>
                </div>
              )}
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
                  setCreateEditModal({ open: true, mode: "edit", category: row.original })
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
                    id: row.original.id,
                    name: row.original.name,
                    hasLivestock: (row.original.livestock_count || 0) > 0,
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
      await categoriesApi.delete(deleteDialog.id)
      setDeleteDialog({ open: false, id: "", name: "", hasLivestock: false })
      clearSelection()
      loadData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage livestock categories"
        actions={
          <Button
            size="sm"
            onClick={() => setCreateEditModal({ open: true, mode: "create", category: null })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
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
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <XCircle className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.results || []}
        searchKey="name"
        searchPlaceholder="Search categories..."
        isLoading={isLoading}
        serverSide
        totalCount={data?.count || 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={(row) =>
          setCreateEditModal({ open: true, mode: "edit", category: row })
        }
      />

      {/* Create/Edit Modal */}
      <CategoryModal
        open={createEditModal.open}
        mode={createEditModal.mode}
        category={createEditModal.category}
        onOpenChange={(open) =>
          setCreateEditModal({ open, mode: "create", category: null })
        }
        onSuccess={() => {
          setCreateEditModal({ open: false, mode: "create", category: null })
          loadData()
        }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, id: "", name: "", hasLivestock: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              {deleteDialog.hasLivestock ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Cannot delete this category</p>
                    <p className="text-sm text-muted-foreground">
                      The category &quot;{deleteDialog.name}&quot; has livestock assigned to it.
                      Please reassign or delete the livestock first.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-medium">{deleteDialog.name}</span>? This action cannot be
                  undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: "", name: "", hasLivestock: false })}
            >
              Cancel
            </Button>
            {!deleteDialog.hasLivestock && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Category Create/Edit Modal
function CategoryModal({
  open,
  mode,
  category,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  mode: "create" | "edit"
  category: CategoryWithStats | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === "edit" && category) {
        setName(category.name)
        setDescription(category.description || "")
      } else {
        setName("")
        setDescription("")
      }
      setError("")
    }
  }, [open, mode, category])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      if (mode === "create") {
        await categoriesApi.create({ name: name.trim(), description: description.trim() })
      } else if (category) {
        await categoriesApi.update(category.id, {
          name: name.trim(),
          description: description.trim(),
        })
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
          <DialogTitle>{mode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new category for organizing livestock."
              : "Update the category details."}
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
              placeholder="e.g., Cattle, Goats, Poultry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this category..."
              rows={3}
            />
          </div>
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
