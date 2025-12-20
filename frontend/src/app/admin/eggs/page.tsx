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
  AlertTriangle,
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
  FRESHNESS_LABELS,
  FRESHNESS_COLORS,
} from "@/lib/types"
import type { EggPackaging, EggType, FreshnessStatus } from "@/lib/types"
import { CreateEggModal, ViewEditEggModal } from "@/components/admin/eggs"

// Format currency
function formatCurrency(amount: string | number, currency: string = "NGN") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

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
    freshness?: string
    is_available?: boolean
  }>({})

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    ids: string[]
    names: string[]
  }>({ open: false, ids: [], names: [] })
  const [expiringDialog, setExpiringDialog] = useState(false)
  const [expiringEggs, setExpiringEggs] = useState<AdminEgg[]>([])
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

  // Load expiring eggs
  const loadExpiringEggs = async () => {
    try {
      const eggs = await adminEggsApi.getExpiringSoon(7)
      setExpiringEggs(eggs)
      setExpiringDialog(true)
    } catch (error) {
      console.error("Failed to load expiring eggs:", error)
    }
  }

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
      // Price
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.price, row.original.currency)}
          </span>
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
      // Freshness
      {
        accessorKey: "freshness_status",
        header: "Freshness",
        cell: ({ row }) => {
          const status = row.original.freshness_status as FreshnessStatus
          const colors = FRESHNESS_COLORS[status]
          return (
            <Badge className={cn(colors.bg, colors.text, "border", colors.border)}>
              {FRESHNESS_LABELS[status]}
            </Badge>
          )
        },
      },
      // Days Until Expiry
      {
        accessorKey: "days_until_expiry",
        header: "Expires",
        cell: ({ row }) => {
          const days = row.original.days_until_expiry
          if (days === null || days === undefined) {
            return <span className="text-sm text-muted-foreground">No date</span>
          }
          return (
            <span className={cn(
              "text-sm",
              days < 0 && "text-red-500 font-medium",
              days >= 0 && days <= 3 && "text-orange-500 font-medium",
              days > 3 && days <= 7 && "text-yellow-600"
            )}>
              {days < 0 ? "Expired" : days === 0 ? "Today" : `${days} days`}
            </span>
          )
        },
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
            {/* Expiring Soon Alert */}
            {stats?.freshness && (stats.freshness.expiring_soon > 0 || stats.freshness.expired > 0) && (
              <Button
                variant="outline"
                size="sm"
                className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                onClick={loadExpiringEggs}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {stats.freshness.expiring_soon + stats.freshness.expired} Expiring
              </Button>
            )}
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
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-500">{stats.freshness?.expiring_soon ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.total_value)}</p>
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

      {/* Expiring Eggs Dialog */}
      <Dialog open={expiringDialog} onOpenChange={setExpiringDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Eggs Expiring Soon
            </DialogTitle>
            <DialogDescription>
              These eggs are expiring within the next 7 days and need attention.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {expiringEggs.map((egg) => (
              <div
                key={egg.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Egg className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{egg.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {egg.quantity_available} units - {EGG_PACKAGING_LABELS[egg.packaging as EggPackaging]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={cn(
                    FRESHNESS_COLORS[egg.freshness_status as FreshnessStatus].bg,
                    FRESHNESS_COLORS[egg.freshness_status as FreshnessStatus].text,
                    "border",
                    FRESHNESS_COLORS[egg.freshness_status as FreshnessStatus].border
                  )}>
                    {egg.days_until_expiry !== null && egg.days_until_expiry < 0 ? "Expired" : `${egg.days_until_expiry ?? 'N/A'} days left`}
                  </Badge>
                </div>
              </div>
            ))}
            {expiringEggs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No eggs expiring within the next 7 days.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpiringDialog(false)}>
              Close
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
