"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Edit,
  Eye,
  ArrowUpDown,
  XCircle,
  Egg,
  Package,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSelectionStore } from "@/lib/admin-store"
import {
  adminEggsApi,
  adminEggCategoriesApi,
  type AdminEgg,
  type AdminEggCategory,
  type PaginatedResponse,
  type EggStats,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { DataTable } from "@/components/admin/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  EGG_PACKAGING_LABELS,
  EGG_TYPE_LABELS,
} from "@/lib/types"
import type { EggPackaging, EggType } from "@/lib/types"
import { CreateEggModal, ViewEditEggModal } from "@/components/admin/eggs"

export default function AdminEggsPage() {
  const { selectedIds, toggleItem, selectAll, clearSelection, isSelected } = useSelectionStore()

  const [data, setData] = useState<PaginatedResponse<AdminEgg> | null>(null)
  const [stats, setStats] = useState<EggStats | null>(null)
  const [categories, setCategories] = useState<AdminEggCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<{
    search?: string
    category?: string
    egg_type?: string
    is_available?: boolean
  }>({})

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    ids: string[]
    names: string[]
  }>({ open: false, ids: [], names: [] })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [viewEditModal, setViewEditModal] = useState<{
    open: boolean
    eggId: string | null
    mode: "view" | "edit"
  }>({ open: false, eggId: null, mode: "view" })

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [eggsResponse, statsResponse, categoriesResponse] = await Promise.all([
        adminEggsApi.getList(currentPage, filters),
        adminEggsApi.getStats(),
        adminEggCategoriesApi.getAll(),
      ])
      setData(eggsResponse)
      setStats(statsResponse)
      setCategories(categoriesResponse)
    } catch (error) {
      console.error("Failed to load eggs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filters])

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
  const columns: ColumnDef<AdminEgg>[] = useMemo(
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
      // Image
      {
        id: "image",
        header: "",
        cell: ({ row }) => (
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
            {row.original.featured_image?.url ? (
              <img
                src={row.original.featured_image.url}
                alt={row.original.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Egg className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ),
        enableSorting: false,
      },
      // Name
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.breed}</p>
          </div>
        ),
      },
      // Category
      {
        accessorKey: "category_name",
        header: "Bird Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.category_name}
          </Badge>
        ),
      },
      // Packaging
      {
        accessorKey: "packaging",
        header: "Packaging",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {EGG_PACKAGING_LABELS[row.original.packaging as EggPackaging]}
            </span>
          </div>
        ),
      },
      // Stock
      {
        accessorKey: "quantity_available",
        header: "Stock",
        cell: ({ row }) => (
          <span className={cn(
            row.original.quantity_available < 5 && "text-orange-500 font-medium"
          )}>
            {row.original.quantity_available} units
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
                  setViewEditModal({ open: true, eggId: row.original.id, mode: "view" })
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setViewEditModal({ open: true, eggId: row.original.id, mode: "edit" })
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
      await adminEggsApi.bulkDelete(deleteDialog.ids)
      setDeleteDialog({ open: false, ids: [], names: [] })
      clearSelection()
      loadData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eggs Management"
        description="View and manage all egg products"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Total Eggs</p>
            <p className="text-2xl font-bold">{stats.total_eggs}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available_eggs}</p>
          </div>
        </div>
      )}

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
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedNames = data?.results
                  .filter((item) => selectedIds.includes(item.id))
                  .map((item) => item.name) || []
                setDeleteDialog({ open: true, ids: selectedIds, names: selectedNames })
              }}
            >
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.results || []}
        searchKey="name"
        searchPlaceholder="Search eggs..."
        isLoading={isLoading}
        serverSide
        totalCount={data?.count || 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, ids: [], names: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Eggs</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {deleteDialog.names.length === 1 ? (
                <span className="font-medium">{deleteDialog.names[0]}</span>
              ) : (
                <span className="font-medium">{deleteDialog.names.length} items</span>
              )}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, ids: [], names: [] })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Egg Modal */}
      <CreateEggModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadData}
      />

      {/* View/Edit Egg Modal */}
      <ViewEditEggModal
        open={viewEditModal.open}
        onOpenChange={(open) => setViewEditModal((prev) => ({ ...prev, open }))}
        eggId={viewEditModal.eggId}
        initialMode={viewEditModal.mode}
        onSuccess={loadData}
      />
    </div>
  )
}
