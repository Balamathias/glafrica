"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { motion } from "framer-motion"
import {
  Plus,
  Trash2,
  Download,
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSelectionStore } from "@/lib/admin-store"
import {
  adminLivestockApi,
  type AdminLivestock,
  type PaginatedResponse,
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
import { CreateLivestockModal, EditLivestockModal, ViewLivestockModal } from "@/components/admin/livestock"

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

export default function AdminLivestockPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedIds, toggleItem, selectAll, clearSelection, isSelected } = useSelectionStore()

  const [data, setData] = useState<PaginatedResponse<AdminLivestock> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<{
    search?: string
    is_sold?: boolean
    category?: string
  }>({})

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    ids: string[]
    names: string[]
  }>({ open: false, ids: [], names: [] })
  const [markSoldDialog, setMarkSoldDialog] = useState<{
    open: boolean
    ids: string[]
  }>({ open: false, ids: [] })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editModalState, setEditModalState] = useState<{
    open: boolean
    livestockId: string | null
  }>({ open: false, livestockId: null })
  const [viewModalState, setViewModalState] = useState<{
    open: boolean
    livestockId: string | null
  }>({ open: false, livestockId: null })

  // Handle URL query params for deep linking (e.g., ?view=123 or ?edit=123)
  useEffect(() => {
    const viewId = searchParams.get("view")
    const editId = searchParams.get("edit")

    if (viewId) {
      setViewModalState({ open: true, livestockId: viewId })
      // Clear the URL param after opening the modal
      router.replace("/admin/livestock", { scroll: false })
    } else if (editId) {
      setEditModalState({ open: true, livestockId: editId })
      // Clear the URL param after opening the modal
      router.replace("/admin/livestock", { scroll: false })
    }
  }, [searchParams, router])

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await adminLivestockApi.getList(currentPage, filters)
      setData(response)
    } catch (error) {
      console.error("Failed to load livestock:", error)
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
  const columns: ColumnDef<AdminLivestock>[] = useMemo(
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
            {row.original.featured_image?.file_url ? (
              <img
                src={row.original.featured_image.file_url}
                alt={row.original.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No img
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
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.category_name}
          </Badge>
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
      // Status
      {
        accessorKey: "is_sold",
        header: "Status",
        cell: ({ row }) =>
          row.original.is_sold ? (
            <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
              Sold
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
              Available
            </Badge>
          ),
      },
      // Location
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.location}</span>
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
                  setViewModalState({ open: true, livestockId: row.original.id })
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setEditModalState({ open: true, livestockId: row.original.id })
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {!row.original.is_sold && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setMarkSoldDialog({ open: true, ids: [row.original.id] })
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Sold
                </DropdownMenuItem>
              )}
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
      await adminLivestockApi.bulkDelete(deleteDialog.ids)
      setDeleteDialog({ open: false, ids: [], names: [] })
      clearSelection()
      // Reload data
      const response = await adminLivestockApi.getList(currentPage, filters)
      setData(response)
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  // Handle mark as sold
  const handleMarkSold = async () => {
    try {
      await adminLivestockApi.bulkMarkSold(markSoldDialog.ids)
      setMarkSoldDialog({ open: false, ids: [] })
      clearSelection()
      // Reload data
      const response = await adminLivestockApi.getList(currentPage, filters)
      setData(response)
    } catch (error) {
      console.error("Failed to mark as sold:", error)
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await adminLivestockApi.export("csv", selectedIds.length > 0 ? selectedIds : undefined)
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `livestock_export_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to export:", error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Livestock Management"
        description="View and manage all livestock listings"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const availableItems = data?.results
                  .filter((item) => selectedIds.includes(item.id) && !item.is_sold)
                  .map((item) => item.id) || []
                if (availableItems.length > 0) {
                  setMarkSoldDialog({ open: true, ids: availableItems })
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Sold
            </Button>
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
        searchPlaceholder="Search livestock..."
        isLoading={isLoading}
        serverSide
        totalCount={data?.count || 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={(row) => setViewModalState({ open: true, livestockId: row.id })}
      />

      {/* View Livestock Modal */}
      <ViewLivestockModal
        open={viewModalState.open}
        onOpenChange={(open) => setViewModalState({ open, livestockId: open ? viewModalState.livestockId : null })}
        livestockId={viewModalState.livestockId}
        onEdit={() => {
          if (viewModalState.livestockId) {
            setEditModalState({ open: true, livestockId: viewModalState.livestockId })
          }
        }}
        onMarkSold={() => {
          if (viewModalState.livestockId) {
            setMarkSoldDialog({ open: true, ids: [viewModalState.livestockId] })
          }
        }}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, ids: [], names: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Livestock</DialogTitle>
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

      {/* Mark Sold Dialog */}
      <Dialog open={markSoldDialog.open} onOpenChange={(open) => !open && setMarkSoldDialog({ open: false, ids: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Sold</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark{" "}
              <span className="font-medium">{markSoldDialog.ids.length} item(s)</span> as sold?
              This will record the sale at the current price.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkSoldDialog({ open: false, ids: [] })}>
              Cancel
            </Button>
            <Button onClick={handleMarkSold}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Sold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Livestock Modal */}
      <CreateLivestockModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadData}
      />

      {/* Edit Livestock Modal */}
      <EditLivestockModal
        open={editModalState.open}
        onOpenChange={(open) => setEditModalState({ open, livestockId: open ? editModalState.livestockId : null })}
        livestockId={editModalState.livestockId}
        onSuccess={loadData}
      />
    </div>
  )
}
