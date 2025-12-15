"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Trash2,
  MoreHorizontal,
  Eye,
  Star,
  Play,
  Image as ImageIcon,
  Video,
  LayoutGrid,
  List,
  Filter,
  Upload,
  ExternalLink,
  StarOff,
  XCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSelectionStore } from "@/lib/admin-store"
import {
  mediaApi,
  adminLivestockApi,
  type MediaAsset,
  type PaginatedResponse,
  type AdminLivestock,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// View modes
type ViewMode = "grid" | "list"

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminMediaPage() {
  const { selectedIds, toggleItem, selectAll, clearSelection, isSelected } = useSelectionStore()

  const [data, setData] = useState<PaginatedResponse<MediaAsset> | null>(null)
  const [livestock, setLivestock] = useState<AdminLivestock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filters, setFilters] = useState<{
    livestock?: string
    type?: "image" | "video"
  }>({})

  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    ids: string[]
  }>({ open: false, ids: [] })
  const [viewModalState, setViewModalState] = useState<{
    open: boolean
    media: MediaAsset | null
  }>({ open: false, media: null })
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await mediaApi.getList(currentPage, filters)
      setData(response)
    } catch (error) {
      console.error("Failed to load media:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filters])

  // Load livestock list for filtering
  const loadLivestock = useCallback(async () => {
    try {
      const response = await adminLivestockApi.getList(1, { ordering: "name" })
      setLivestock(response.results || [])
    } catch (error) {
      console.error("Failed to load livestock:", error)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    loadLivestock()
  }, [loadLivestock])

  // Calculate selection state for header checkbox
  const allSelected = data?.results.length
    ? data.results.every((item) => selectedIds.includes(item.id))
    : false
  const someSelected = data?.results.length
    ? data.results.some((item) => selectedIds.includes(item.id)) && !allSelected
    : false

  // Define columns for table view
  const columns: ColumnDef<MediaAsset>[] = useMemo(
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
      // Preview
      {
        id: "preview",
        header: "Preview",
        cell: ({ row }) => (
          <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-muted">
            {row.original.media_type === "video" ? (
              <div className="flex h-full w-full items-center justify-center bg-black/20">
                <Play size={24} className="text-white" />
              </div>
            ) : row.original.file_url ? (
              <Image
                src={row.original.file_url}
                alt="Media preview"
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon size={24} />
              </div>
            )}
            {row.original.is_featured && (
              <div className="absolute top-1 left-1 p-1 rounded-full bg-yellow-500">
                <Star size={10} className="text-white fill-white" />
              </div>
            )}
          </div>
        ),
        enableSorting: false,
      },
      // Type
      {
        accessorKey: "media_type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              row.original.media_type === "video"
                ? "border-purple-500/30 text-purple-500"
                : "border-blue-500/30 text-blue-500"
            )}
          >
            {row.original.media_type === "video" ? (
              <Video size={12} />
            ) : (
              <ImageIcon size={12} />
            )}
            {row.original.media_type === "video" ? "Video" : "Image"}
          </Badge>
        ),
      },
      // Livestock
      {
        id: "livestock",
        header: "Livestock",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.livestock_name || "Unknown"}</p>
          </div>
        ),
      },
      // Featured
      {
        accessorKey: "is_featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.is_featured ? (
            <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
              <Star size={12} className="mr-1 fill-current" />
              Featured
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          ),
      },
      // Created
      {
        accessorKey: "created_at",
        header: "Uploaded",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatDate(row.original.created_at)}
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
                  setViewModalState({ open: true, media: row.original })
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(row.original.file_url, "_blank")
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </DropdownMenuItem>
              {!row.original.is_featured && (
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      await mediaApi.setFeatured(row.original.id)
                      loadData()
                    } catch (error) {
                      console.error("Failed to set featured:", error)
                    }
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Set as Featured
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialog({ open: true, ids: [row.original.id] })
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
    [data, selectedIds, isSelected, toggleItem, selectAll, clearSelection, allSelected, someSelected, loadData]
  )

  // Handle delete
  const handleDelete = async () => {
    try {
      await mediaApi.bulkDelete(deleteDialog.ids)
      setDeleteDialog({ open: false, ids: [] })
      clearSelection()
      loadData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Manage all media files across livestock listings"
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border/50 p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setViewMode("list")}
              >
                <List size={16} />
              </Button>
            </div>
            <Button size="sm" onClick={() => setUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl glass border border-border/50">
        <Filter size={16} className="text-muted-foreground" />
        <Select
          value={filters.type || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              type: value === "all" ? undefined : (value as "image" | "video"),
            }))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Media Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.livestock || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              livestock: value === "all" ? undefined : value,
            }))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Livestock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Livestock</SelectItem>
            {livestock.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.type || filters.livestock) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            className="text-muted-foreground"
          >
            Clear Filters
          </Button>
        )}
      </div>

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
              onClick={() => setDeleteDialog({ open: true, ids: selectedIds })}
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

      {/* Content */}
      {viewMode === "grid" ? (
        <MediaGrid
          data={data?.results || []}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelect={toggleItem}
          onView={(media) => setViewModalState({ open: true, media })}
          onDelete={(id) => setDeleteDialog({ open: true, ids: [id] })}
          onSetFeatured={async (id) => {
            try {
              await mediaApi.setFeatured(id)
              loadData()
            } catch (error) {
              console.error("Failed to set featured:", error)
            }
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.results || []}
          isLoading={isLoading}
          serverSide
          totalCount={data?.count || 0}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={(row) => setViewModalState({ open: true, media: row })}
        />
      )}

      {/* Pagination for Grid View */}
      {viewMode === "grid" && data && data.count > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, data.count)} of{" "}
            {data.count} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!data.previous}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!data.next}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Media Modal */}
      <ViewMediaModal
        open={viewModalState.open}
        onOpenChange={(open) => setViewModalState({ open, media: open ? viewModalState.media : null })}
        media={viewModalState.media}
        onDelete={() => {
          if (viewModalState.media) {
            setDeleteDialog({ open: true, ids: [viewModalState.media.id] })
          }
        }}
        onSetFeatured={async () => {
          if (viewModalState.media) {
            try {
              await mediaApi.setFeatured(viewModalState.media.id)
              loadData()
              setViewModalState({ open: false, media: null })
            } catch (error) {
              console.error("Failed to set featured:", error)
            }
          }
        }}
      />

      {/* Upload Media Modal */}
      <UploadMediaModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        livestock={livestock}
        onSuccess={() => {
          loadData()
          setUploadModalOpen(false)
        }}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, ids: [] })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteDialog.ids.length} item(s)</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, ids: [] })}>
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

// Media Grid Component
function MediaGrid({
  data,
  isLoading,
  selectedIds,
  onSelect,
  onView,
  onDelete,
  onSetFeatured,
}: {
  data: MediaAsset[]
  isLoading: boolean
  selectedIds: string[]
  onSelect: (id: string) => void
  onView: (media: MediaAsset) => void
  onDelete: (id: string) => void
  onSetFeatured: (id: string) => void
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <ImageIcon size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No media found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Upload media files to your livestock listings to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <AnimatePresence>
        {data.map((media, index) => (
          <motion.div
            key={media.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.02 }}
            className={cn(
              "group relative aspect-square rounded-xl overflow-hidden bg-muted border-2 cursor-pointer transition-all",
              selectedIds.includes(media.id)
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-border/50"
            )}
          >
            {/* Media Preview */}
            {media.media_type === "video" ? (
              <div className="w-full h-full bg-black/20 flex items-center justify-center">
                <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                  <Play size={28} className="text-white fill-white" />
                </div>
              </div>
            ) : media.file_url ? (
              <Image
                src={media.file_url}
                alt="Media"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={32} className="text-muted-foreground" />
              </div>
            )}

            {/* Featured Badge */}
            {media.is_featured && (
              <div className="absolute top-2 left-2 p-1.5 rounded-full bg-yellow-500 shadow-lg">
                <Star size={12} className="text-white fill-white" />
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className={cn(
                  "shadow-lg text-xs",
                  media.media_type === "video"
                    ? "bg-purple-500/90 text-white"
                    : "bg-blue-500/90 text-white"
                )}
              >
                {media.media_type === "video" ? <Video size={10} className="mr-1" /> : <ImageIcon size={10} className="mr-1" />}
                {media.media_type === "video" ? "Video" : "Image"}
              </Badge>
            </div>

            {/* Checkbox */}
            <div
              className={cn(
                "absolute bottom-2 left-2 transition-opacity",
                selectedIds.includes(media.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(media.id)
              }}
            >
              <div className="p-1 rounded-md bg-black/50 backdrop-blur-sm">
                <Checkbox
                  checked={selectedIds.includes(media.id)}
                  onChange={() => onSelect(media.id)}
                  size="sm"
                />
              </div>
            </div>

            {/* Hover Overlay */}
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
              onClick={() => onView(media)}
            >
              <Button
                variant="secondary"
                size="sm"
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onView(media)
                }}
              >
                <Eye size={14} className="mr-1" />
                View
              </Button>
              {!media.is_featured && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetFeatured(media.id)
                  }}
                >
                  <Star size={14} />
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(media.id)
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>

            {/* Livestock Name */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-xs truncate font-medium">
                {media.livestock_name || "Unknown"}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// View Media Modal
function ViewMediaModal({
  open,
  onOpenChange,
  media,
  onDelete,
  onSetFeatured,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  media: MediaAsset | null
  onDelete: () => void
  onSetFeatured: () => void
}) {
  if (!media) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Media Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media Preview */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
            {media.media_type === "video" ? (
              <video
                src={media.file_url}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <Image
                src={media.file_url}
                alt="Media"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Livestock</h4>
              <p className="font-medium">{media.livestock_name || "Unknown"}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  media.media_type === "video"
                    ? "border-purple-500/30 text-purple-500"
                    : "border-blue-500/30 text-blue-500"
                )}
              >
                {media.media_type === "video" ? (
                  <Video size={12} />
                ) : (
                  <ImageIcon size={12} />
                )}
                {media.media_type === "video" ? "Video" : "Image"}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
              {media.is_featured ? (
                <Badge className="bg-yellow-500/10 text-yellow-500">
                  <Star size={12} className="mr-1 fill-current" />
                  Featured
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Not featured</span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Aspect Ratio</h4>
              <p className="text-sm">{media.aspect_ratio.toFixed(2)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Uploaded</h4>
              <p className="text-sm">{formatDate(media.created_at)}</p>
            </div>

            <div className="pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(media.file_url, "_blank")}
              >
                <ExternalLink size={16} className="mr-2" />
                Open in New Tab
              </Button>

              {!media.is_featured && (
                <Button variant="outline" className="w-full" onClick={onSetFeatured}>
                  <Star size={16} className="mr-2" />
                  Set as Featured
                </Button>
              )}

              <Button variant="destructive" className="w-full" onClick={onDelete}>
                <Trash2 size={16} className="mr-2" />
                Delete Media
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Upload Media Modal
function UploadMediaModal({
  open,
  onOpenChange,
  livestock,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  livestock: AdminLivestock[]
  onSuccess: () => void
}) {
  const [selectedLivestock, setSelectedLivestock] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleUpload = async () => {
    if (!selectedLivestock || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        const mediaType = file.type.startsWith("video/") ? "video" : "image"
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        await mediaApi.upload(selectedLivestock, file, {
          media_type: mediaType,
          is_featured: files.length === 1,
        })

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
      }
      onSuccess()
      setFiles([])
      setSelectedLivestock("")
      setUploadProgress({})
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload images or videos to a livestock listing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Livestock Select */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Select Livestock <span className="text-destructive">*</span>
            </label>
            <Select value={selectedLivestock} onValueChange={setSelectedLivestock}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a livestock..." />
              </SelectTrigger>
              <SelectContent>
                {livestock.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              "hover:border-primary/50 hover:bg-primary/5",
              files.length > 0 ? "border-primary bg-primary/5" : "border-border"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <Upload size={32} className="text-muted-foreground mb-3" />
                <p className="font-medium mb-1">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Images (JPG, PNG, WebP) or Videos (MP4, WebM)
                </p>
              </div>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {file.type.startsWith("video/") ? (
                      <Video size={16} className="text-purple-500 shrink-0" />
                    ) : (
                      <ImageIcon size={16} className="text-blue-500 shrink-0" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  {uploadProgress[file.name] !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {uploadProgress[file.name]}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedLivestock || files.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
