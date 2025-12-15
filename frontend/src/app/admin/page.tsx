"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  PawPrint,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/admin-store"
import { dashboardApi, type FullDashboard } from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { StatCard } from "@/components/admin/ui/stat-card"
import { Button } from "@/components/ui/button"
import { CreateLivestockModal } from "@/components/admin/livestock"

// Format currency
function formatCurrency(amount: number, currency: string = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format relative time
function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [dashboard, setDashboard] = useState<FullDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const data = await dashboardApi.getFullDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  const summary = dashboard?.summary

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.first_name || user?.username || "Admin"}! Here's what's happening.`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Livestock"
          value={summary?.total_livestock || 0}
          icon={<PawPrint className="h-5 w-5" />}
          description="All items"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.total_revenue || 0)}
          change={summary?.revenue_change}
          icon={<DollarSign className="h-5 w-5" />}
          description="vs last week"
        />
        <StatCard
          title="Sold This Week"
          value={summary?.sold_this_week || 0}
          change={summary?.sold_change}
          icon={<ShoppingCart className="h-5 w-5" />}
          description="vs last week"
        />
        <StatCard
          title="Conversion Rate"
          value={summary?.conversion_rate || 0}
          suffix="%"
          icon={<TrendingUp className="h-5 w-5" />}
          description="Sold / Total"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
            <Link href="/admin/analytics">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {dashboard?.categories?.slice(0, 5).map((category, index) => {
              const percentage =
                summary?.total_livestock && summary.total_livestock > 0
                  ? Math.round((category.total / summary.total_livestock) * 100)
                  : 0

              return (
                <motion.div
                  key={category.id}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {(!dashboard?.categories || dashboard.categories.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No categories found
              </p>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="gap-1">
              <Clock className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {dashboard?.recent_activity?.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xs font-medium text-primary">
                    {activity.user?.[0]?.toUpperCase() || "S"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">
                      {activity.description}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}

            {(!dashboard?.recent_activity ||
              dashboard.recent_activity.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No recent activity
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="rounded-2xl glass border border-border/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Livestock
          </Button>
          <Link href="/admin/analytics">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View Reports
            </Button>
          </Link>
          <Link href="/admin/livestock?export=true">
            <Button variant="outline" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Export Data
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Create Livestock Modal */}
      <CreateLivestockModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadDashboard}
      />
    </div>
  )
}
