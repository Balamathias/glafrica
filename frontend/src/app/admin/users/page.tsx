"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  MoreHorizontal,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  RefreshCcw,
  Lock,
  Key,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/admin-store"
import {
  usersApi,
  type AdminUserFull,
  type PaginatedResponse,
  type CreateAdminUserPayload,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { DataTable } from "@/components/admin/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Role badge colors and icons
const ROLE_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  superadmin: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: <ShieldAlert className="h-3 w-3" />,
    label: "Super Admin",
  },
  admin: {
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: <ShieldCheck className="h-3 w-3" />,
    label: "Administrator",
  },
  staff: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: <Shield className="h-3 w-3" />,
    label: "Staff",
  },
  viewer: {
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    icon: <Eye className="h-3 w-3" />,
    label: "Viewer",
  },
}

// Format date
function formatDate(date: string | null) {
  if (!date) return "Never"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Format relative time
function formatRelativeTime(date: string | null) {
  if (!date) return "Never"
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

// Generate avatar from name
function getAvatarInitials(user: AdminUserFull): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  return user.username.slice(0, 2).toUpperCase()
}

// Avatar component
function UserAvatar({ user, size = "md" }: { user: AdminUserFull; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  }

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.full_name}
        className={cn("rounded-full object-cover", sizeClasses[size])}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
        sizeClasses[size]
      )}
    >
      {getAvatarInitials(user)}
    </div>
  )
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore()
  const [data, setData] = useState<PaginatedResponse<AdminUserFull> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Dialogs
  const [createModal, setCreateModal] = useState(false)
  const [viewModal, setViewModal] = useState<{ open: boolean; user: AdminUserFull | null }>({
    open: false,
    user: null,
  })
  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean
    user: AdminUserFull | null
    action: "activate" | "deactivate"
  }>({ open: false, user: null, action: "deactivate" })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    user: AdminUserFull | null
  }>({ open: false, user: null })

  // Check if current user is superadmin
  const isSuperAdmin = currentUser?.is_superuser || currentUser?.role === "superadmin"

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const filters: { role?: string; is_active?: boolean; search?: string } = {}

      if (roleFilter !== "all") filters.role = roleFilter
      if (statusFilter !== "all") filters.is_active = statusFilter === "active"
      if (searchQuery) filters.search = searchQuery

      const response = await usersApi.getList(currentPage, filters)
      setData(response)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, roleFilter, statusFilter, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle toggle status
  const handleToggleStatus = async () => {
    if (!toggleDialog.user) return

    try {
      await usersApi.toggleStatus(toggleDialog.user.id)
      setToggleDialog({ open: false, user: null, action: "deactivate" })
      loadData()
    } catch (error) {
      console.error("Failed to toggle status:", error)
    }
  }

  // Handle delete (soft delete/deactivate)
  const handleDelete = async () => {
    if (!deleteDialog.user) return

    try {
      await usersApi.delete(deleteDialog.user.id)
      setDeleteDialog({ open: false, user: null })
      loadData()
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  // Define columns
  const columns: ColumnDef<AdminUserFull>[] = useMemo(
    () => [
      // User Info
      {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          )
        },
      },
      // Email
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.original.email}</span>
          </div>
        ),
      },
      // Role
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role || "staff"
          const config = ROLE_CONFIG[role] || ROLE_CONFIG.staff

          return (
            <Badge className={cn("gap-1 border", config.color)}>
              {config.icon}
              {config.label}
            </Badge>
          )
        },
      },
      // Status
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.is_active

          return (
            <Badge
              variant="outline"
              className={cn(
                "gap-1",
                isActive
                  ? "text-emerald-500 border-emerald-500/30"
                  : "text-red-500 border-red-500/30"
              )}
            >
              {isActive ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Inactive
                </>
              )}
            </Badge>
          )
        },
      },
      // Last Login
      {
        accessorKey: "last_login",
        header: "Last Login",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatRelativeTime(row.original.last_login)}
          </div>
        ),
      },
      // Date Joined
      {
        accessorKey: "date_joined",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.date_joined)}
          </span>
        ),
      },
      // Actions
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original
          const isCurrentUser = currentUser?.id === user.id
          const canManage = isSuperAdmin && !isCurrentUser

          return (
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
                    setViewModal({ open: true, user })
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>

                {canManage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setToggleDialog({
                          open: true,
                          user,
                          action: user.is_active ? "deactivate" : "activate",
                        })
                      }}
                    >
                      {user.is_active ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteDialog({ open: true, user })
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}

                {isCurrentUser && (
                  <DropdownMenuItem disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    <span className="text-muted-foreground">This is you</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      },
    ],
    [currentUser, isSuperAdmin]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage admin users and their permissions"
        actions={
          isSuperAdmin && (
            <Button size="sm" onClick={() => setCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )
        }
      />

      {/* Filters */}
      <motion.div
        className="flex flex-wrap items-center gap-4 rounded-2xl glass border border-border/50 p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          className="rounded-xl glass border border-border/50 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.count || 0}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl glass border border-border/50 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data?.results.filter((u) => u.is_active).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl glass border border-border/50 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <ShieldCheck className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data?.results.filter((u) => u.role === "admin" || u.role === "superadmin").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl glass border border-border/50 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data?.results.filter((u) => !u.is_active).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.results || []}
        searchKey="username"
        searchPlaceholder="Search users..."
        isLoading={isLoading}
        serverSide
        totalCount={data?.count || 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onRowClick={(row) => setViewModal({ open: true, user: row })}
      />

      {/* Create User Modal */}
      <CreateUserModal
        open={createModal}
        onOpenChange={setCreateModal}
        onSuccess={() => {
          setCreateModal(false)
          loadData()
        }}
      />

      {/* View User Modal */}
      <ViewUserModal
        open={viewModal.open}
        user={viewModal.user}
        onOpenChange={(open) => setViewModal({ open, user: open ? viewModal.user : null })}
      />

      {/* Toggle Status Dialog */}
      <Dialog
        open={toggleDialog.open}
        onOpenChange={(open) =>
          !open && setToggleDialog({ open: false, user: null, action: "deactivate" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {toggleDialog.action === "activate" ? "Activate User" : "Deactivate User"}
            </DialogTitle>
            <DialogDescription>
              {toggleDialog.action === "activate" ? (
                <>
                  Are you sure you want to activate{" "}
                  <span className="font-medium">{toggleDialog.user?.full_name}</span>?
                  They will regain access to the admin panel.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate{" "}
                  <span className="font-medium">{toggleDialog.user?.full_name}</span>?
                  They will lose access to the admin panel.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setToggleDialog({ open: false, user: null, action: "deactivate" })}
            >
              Cancel
            </Button>
            <Button
              variant={toggleDialog.action === "activate" ? "default" : "destructive"}
              onClick={handleToggleStatus}
            >
              {toggleDialog.action === "activate" ? (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Warning</p>
                  <p className="text-sm text-muted-foreground">
                    This will deactivate the user{" "}
                    <span className="font-medium">{deleteDialog.user?.full_name}</span>.
                    They will no longer be able to access the admin panel.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Create User Modal
function CreateUserModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState<CreateAdminUserPayload>({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    role: "staff",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        role: "staff",
        phone: "",
      })
      setError("")
    }
  }, [open])

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.username.trim()) {
      setError("Username is required")
      return
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }
    if (!formData.password) {
      setError("Password is required")
      return
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await usersApi.create(formData)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Admin User</DialogTitle>
          <DialogDescription>
            Add a new user to the admin panel with specified permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4 md:px-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                First Name
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Last Name
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Username <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 xxx xxx xxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Role <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as CreateAdminUserPayload["role"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Viewer - Read-only access
                  </div>
                </SelectItem>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Staff - Basic admin access
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Administrator - Full access
                  </div>
                </SelectItem>
                <SelectItem value="superadmin">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Super Admin - All permissions
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Confirm password"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// View User Modal
function ViewUserModal({
  open,
  user,
  onOpenChange,
}: {
  open: boolean
  user: AdminUserFull | null
  onOpenChange: (open: boolean) => void
}) {
  if (!user) return null

  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.staff

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-4 md:px-6">
          {/* User Header */}
          <div className="flex items-center gap-4 mb-6">
            <UserAvatar user={user} size="lg" />
            <div>
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("gap-1 border", roleConfig.color)}>
                  {roleConfig.icon}
                  {roleConfig.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    user.is_active
                      ? "text-emerald-500 border-emerald-500/30"
                      : "text-red-500 border-red-500/30"
                  )}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Email</span>
                </div>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Phone</span>
                </div>
                <p className="text-sm font-medium">
                  {user.profile?.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Date Joined</span>
                </div>
                <p className="text-sm font-medium">{formatDate(user.date_joined)}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Last Login</span>
                </div>
                <p className="text-sm font-medium">{formatRelativeTime(user.last_login)}</p>
              </div>
            </div>

            {user.profile?.last_login_ip && (
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Last Login IP</span>
                </div>
                <p className="text-sm font-medium font-mono">{user.profile.last_login_ip}</p>
              </div>
            )}

            {/* Permissions Summary */}
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Permissions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.is_superuser && (
                  <Badge variant="outline" className="text-xs">
                    Super User
                  </Badge>
                )}
                {user.is_staff && (
                  <Badge variant="outline" className="text-xs">
                    Staff Access
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {user.role === "superadmin" || user.role === "admin"
                    ? "Full CRUD"
                    : user.role === "staff"
                    ? "Limited Write"
                    : "Read Only"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
