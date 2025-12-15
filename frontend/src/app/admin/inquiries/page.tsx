"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Trash2,
  Clock,
  Phone,
  User,
  Building2,
  Calendar,
  Briefcase,
  HelpCircle,
  Send,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSelectionStore } from "@/lib/admin-store"
import {
  inquiriesApi,
  type ContactInquiry,
  type InquiryStats,
  type PaginatedResponse,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { DataTable } from "@/components/admin/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Subject icons
const subjectIcons: Record<string, React.ReactNode> = {
  purchase: <Building2 size={14} />,
  investment: <Briefcase size={14} />,
  partnership: <User size={14} />,
  visit: <Calendar size={14} />,
  support: <HelpCircle size={14} />,
  other: <MessageSquare size={14} />,
}

// Status colors
const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  read: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  replied: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Format relative time
function formatRelativeTime(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export default function AdminInquiriesPage() {
  const { selectedIds, toggleItem, selectAll, clearSelection, isSelected } = useSelectionStore()

  const [data, setData] = useState<PaginatedResponse<ContactInquiry> | null>(null)
  const [stats, setStats] = useState<InquiryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<{
    status?: string
    subject?: string
    search?: string
  }>({})

  // Dialogs
  const [viewDialog, setViewDialog] = useState<{
    open: boolean
    inquiry: ContactInquiry | null
  }>({ open: false, inquiry: null })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    id: string
    name: string
  }>({ open: false, id: "", name: "" })
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean
    inquiry: ContactInquiry | null
    newStatus: ContactInquiry["status"] | ""
    notes: string
  }>({ open: false, inquiry: null, newStatus: "", notes: "" })

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [inquiriesResponse, statsResponse] = await Promise.all([
        inquiriesApi.getList(currentPage, filters),
        inquiriesApi.getStats(),
      ])
      setData(inquiriesResponse)
      setStats(statsResponse)
    } catch (error) {
      console.error("Failed to load inquiries:", error)
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
  const columns: ColumnDef<ContactInquiry>[] = useMemo(
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
      // Status indicator
      {
        id: "status_indicator",
        header: "",
        cell: ({ row }) => (
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              row.original.status === "new" && "bg-blue-500",
              row.original.status === "read" && "bg-amber-500",
              row.original.status === "replied" && "bg-emerald-500",
              row.original.status === "closed" && "bg-gray-500"
            )}
          />
        ),
        enableSorting: false,
      },
      // Name & Email
      {
        accessorKey: "name",
        header: "Contact",
        cell: ({ row }) => (
          <div>
            <p className={cn("font-medium", row.original.status === "new" && "font-semibold")}>
              {row.original.name}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      // Subject
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <Badge variant="outline" className="gap-1.5 font-normal">
            {subjectIcons[row.original.subject]}
            {row.original.subject_display}
          </Badge>
        ),
      },
      // Status
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn("font-normal", statusColors[row.original.status])}
          >
            {row.original.status_display}
          </Badge>
        ),
      },
      // Phone
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.phone || "-"}
          </span>
        ),
      },
      // Received
      {
        accessorKey: "created_at",
        header: "Received",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock size={14} />
            {formatRelativeTime(row.original.created_at)}
          </div>
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
                  handleViewInquiry(row.original)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {row.original.status === "new" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkRead(row.original.id)
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setStatusDialog({
                    open: true,
                    inquiry: row.original,
                    newStatus: "",
                    notes: row.original.notes || "",
                  })
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Update Status
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

  // Handle view inquiry
  const handleViewInquiry = async (inquiry: ContactInquiry) => {
    // If it's new, mark as read
    if (inquiry.status === "new") {
      await inquiriesApi.markRead(inquiry.id)
      loadData()
    }

    // Fetch full details
    try {
      const fullInquiry = await inquiriesApi.getById(inquiry.id)
      setViewDialog({ open: true, inquiry: fullInquiry })
    } catch {
      setViewDialog({ open: true, inquiry })
    }
  }

  // Handle mark as read
  const handleMarkRead = async (id: string) => {
    try {
      await inquiriesApi.markRead(id)
      loadData()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      await inquiriesApi.delete(deleteDialog.id)
      setDeleteDialog({ open: false, id: "", name: "" })
      clearSelection()
      loadData()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!statusDialog.inquiry || !statusDialog.newStatus) return

    try {
      await inquiriesApi.updateStatus(
        statusDialog.inquiry.id,
        statusDialog.newStatus as ContactInquiry["status"],
        statusDialog.notes
      )
      setStatusDialog({ open: false, inquiry: null, newStatus: "", notes: "" })
      loadData()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Inquiries"
        description="Manage messages from the contact form"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard
            label="Total"
            value={stats.total}
            icon={<Mail size={18} />}
            onClick={() => setFilters({})}
            active={!filters.status}
          />
          <StatsCard
            label="New"
            value={stats.new}
            icon={<div className="w-2 h-2 rounded-full bg-blue-500" />}
            color="blue"
            onClick={() => setFilters({ status: "new" })}
            active={filters.status === "new"}
          />
          <StatsCard
            label="Read"
            value={stats.read}
            icon={<div className="w-2 h-2 rounded-full bg-amber-500" />}
            color="amber"
            onClick={() => setFilters({ status: "read" })}
            active={filters.status === "read"}
          />
          <StatsCard
            label="Replied"
            value={stats.replied}
            icon={<div className="w-2 h-2 rounded-full bg-emerald-500" />}
            color="emerald"
            onClick={() => setFilters({ status: "replied" })}
            active={filters.status === "replied"}
          />
          <StatsCard
            label="Closed"
            value={stats.closed}
            icon={<div className="w-2 h-2 rounded-full bg-gray-500" />}
            color="gray"
            onClick={() => setFilters({ status: "closed" })}
            active={filters.status === "closed"}
          />
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
        searchPlaceholder="Search inquiries..."
        isLoading={isLoading}
        serverSide
        totalCount={data?.count || 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={(row) => handleViewInquiry(row)}
      />

      {/* View Inquiry Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => !open && setViewDialog({ open: false, inquiry: null })}
      >
        <DialogContent className="max-w-2xl">
          {viewDialog.inquiry && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {viewDialog.inquiry.name}
                      <Badge
                        variant="outline"
                        className={cn("font-normal", statusColors[viewDialog.inquiry.status])}
                      >
                        {viewDialog.inquiry.status_display}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      {viewDialog.inquiry.subject_display} • Received{" "}
                      {formatDate(viewDialog.inquiry.created_at)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={14} />
                    <a
                      href={`mailto:${viewDialog.inquiry.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {viewDialog.inquiry.email}
                    </a>
                  </div>
                  {viewDialog.inquiry.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <a
                        href={`tel:${viewDialog.inquiry.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {viewDialog.inquiry.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm whitespace-pre-wrap">{viewDialog.inquiry.message}</p>
                </div>

                {/* Admin Notes */}
                {viewDialog.inquiry.notes && (
                  <div className="rounded-xl border border-border/50 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Admin Notes</p>
                    <p className="text-sm">{viewDialog.inquiry.notes}</p>
                  </div>
                )}

                {/* Reply Info */}
                {viewDialog.inquiry.replied_at && (
                  <div className="text-xs text-muted-foreground">
                    Replied by {viewDialog.inquiry.replied_by_name} on{" "}
                    {formatDate(viewDialog.inquiry.replied_at)}
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <a href={`mailto:${viewDialog.inquiry.email}`}>
                    <Send className="mr-2 h-4 w-4" />
                    Reply via Email
                  </a>
                </Button>
                <Button
                  onClick={() => {
                    setViewDialog({ open: false, inquiry: null })
                    setStatusDialog({
                      open: true,
                      inquiry: viewDialog.inquiry,
                      newStatus: "",
                      notes: viewDialog.inquiry?.notes || "",
                    })
                  }}
                  className="w-full sm:w-auto"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) =>
          !open && setStatusDialog({ open: false, inquiry: null, newStatus: "", notes: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inquiry Status</DialogTitle>
            <DialogDescription>
              Change the status of the inquiry from {statusDialog.inquiry?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <Select
                value={statusDialog.newStatus}
                onValueChange={(value) =>
                  setStatusDialog({ ...statusDialog, newStatus: value as ContactInquiry["status"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Admin Notes</label>
              <Textarea
                value={statusDialog.notes}
                onChange={(e) => setStatusDialog({ ...statusDialog, notes: e.target.value })}
                placeholder="Add internal notes about this inquiry..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusDialog({ open: false, inquiry: null, newStatus: "", notes: "" })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={!statusDialog.newStatus}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: "", name: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the inquiry from{" "}
              <span className="font-medium">{deleteDialog.name}</span>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: "", name: "" })}
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

// Stats Card Component
function StatsCard({
  label,
  value,
  icon,
  color,
  onClick,
  active,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color?: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border transition-all",
        "hover:bg-muted/50",
        active
          ? "border-primary bg-primary/5"
          : "border-border/50 bg-card"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          color === "blue" && "bg-blue-500/10 text-blue-500",
          color === "amber" && "bg-amber-500/10 text-amber-500",
          color === "emerald" && "bg-emerald-500/10 text-emerald-500",
          color === "gray" && "bg-gray-500/10 text-gray-500",
          !color && "bg-muted"
        )}
      >
        {icon}
      </div>
      <div className="text-left">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </button>
  )
}
