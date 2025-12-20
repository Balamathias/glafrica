"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  PieChart,
  BarChart3,
  LineChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Loader2,
  PawPrint,
  Target,
  Scale,
  Users,
  ImageIcon,
  Tag,
  Activity,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  analyticsApi,
  dashboardApi,
  type DashboardSummary,
  type CategoryBreakdown,
  type SalesTrendItem,
  type RevenueTrendItem,
  type InventoryMetrics,
  type SalesAnalytics,
  type TopItem,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Format currency
function formatCurrency(amount: number, currency: string = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format compact number
function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Time range options
const TIME_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
]

// Mini chart component for sparklines
function MiniChart({
  data,
  type = "line",
  color = "primary",
}: {
  data: number[]
  type?: "line" | "bar"
  color?: "primary" | "emerald" | "orange" | "red"
}) {
  if (!data.length) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const colorClass = {
    primary: "text-primary",
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    red: "text-red-500",
  }[color]

  if (type === "bar") {
    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.slice(-14).map((value, i) => (
          <div
            key={i}
            className={cn("w-1 rounded-t bg-current opacity-60", colorClass)}
            style={{ height: `${((value - min) / range) * 100}%`, minHeight: 2 }}
          />
        ))}
      </div>
    )
  }

  // Line chart using SVG
  const width = 80
  const height = 32
  const points = data.slice(-14).map((value, i) => ({
    x: (i / (data.slice(-14).length - 1 || 1)) * width,
    y: height - ((value - min) / range) * height,
  }))

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`
    return `${acc} L ${point.x} ${point.y}`
  }, "")

  return (
    <svg width={width} height={height} className={colorClass}>
      <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Stat card with enhanced features
function AnalyticsStatCard({
  title,
  value,
  change,
  trend,
  icon,
  subtitle,
  sparklineData,
  chartType,
  chartColor,
}: {
  title: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  icon: React.ReactNode
  subtitle?: string
  sparklineData?: number[]
  chartType?: "line" | "bar"
  chartColor?: "primary" | "emerald" | "orange" | "red"
}) {
  const isPositive = trend === "up" || (change !== undefined && change > 0)
  const isNegative = trend === "down" || (change !== undefined && change < 0)

  return (
    <motion.div
      className="rounded-2xl glass border border-border/50 p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <MiniChart data={sparklineData} type={chartType} color={chartColor} />
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {change !== undefined && (
            <span
              className={cn(
                "flex items-center text-xs font-medium mb-0.5",
                isPositive && "text-emerald-500",
                isNegative && "text-red-500",
                !isPositive && !isNegative && "text-muted-foreground"
              )}
            >
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

// Revenue chart component
function RevenueChart({ data }: { data: RevenueTrendItem[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 h-48">
        {data.map((item, i) => (
          <motion.div
            key={item.date}
            className="flex-1 group relative"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.02 }}
            style={{ transformOrigin: "bottom" }}
          >
            <div
              className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: item.revenue > 0 ? 4 : 0 }}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                <p className="font-medium">{formatCurrency(item.revenue)}</p>
                <p className="text-muted-foreground">{formatDate(item.date)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data.length > 0 ? formatDate(data[0]?.date) : ""}</span>
        <span>{data.length > 0 ? formatDate(data[data.length - 1]?.date) : ""}</span>
      </div>
    </div>
  )
}

// Sales trend chart
function SalesTrendChart({ data }: { data: SalesTrendItem[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 h-48">
        {data.map((item, i) => (
          <motion.div
            key={item.date}
            className="flex-1 group relative"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.02 }}
            style={{ transformOrigin: "bottom" }}
          >
            <div
              className="w-full rounded-t bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer"
              style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: item.count > 0 ? 4 : 0 }}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                <p className="font-medium">{item.count} sold</p>
                <p className="text-muted-foreground">{formatDate(item.date)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data.length > 0 ? formatDate(data[0]?.date) : ""}</span>
        <span>{data.length > 0 ? formatDate(data[data.length - 1]?.date) : ""}</span>
      </div>
    </div>
  )
}

// Donut chart for distribution
function DonutChart({
  data,
  colors,
}: {
  data: { label: string; value: number }[]
  colors: string[]
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return <p className="text-center text-muted-foreground py-8">No data</p>

  let currentAngle = 0
  const segments = data.map((item, i) => {
    const percentage = item.value / total
    const startAngle = currentAngle
    const endAngle = currentAngle + percentage * 360
    currentAngle = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)

    const largeArc = percentage > 0.5 ? 1 : 0
    const x1 = 50 + 35 * Math.cos(startRad)
    const y1 = 50 + 35 * Math.sin(startRad)
    const x2 = 50 + 35 * Math.cos(endRad)
    const y2 = 50 + 35 * Math.sin(endRad)

    return {
      ...item,
      percentage,
      color: colors[i % colors.length],
      path: percentage === 1
        ? `M 50 15 A 35 35 0 1 1 49.99 15`
        : `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`,
    }
  })

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {segments.map((segment, i) => (
            <motion.path
              key={i}
              d={segment.path}
              fill={segment.color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
          <circle cx="50" cy="50" r="20" fill="hsl(var(--background))" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{total}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm flex-1 truncate">{segment.label}</span>
            <span className="text-sm text-muted-foreground">
              {(segment.percentage * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Category performance table
function CategoryPerformanceTable({ categories }: { categories: CategoryBreakdown[] }) {
  const sortedCategories = [...categories].sort(
    (a, b) => (b.revenue || 0) - (a.revenue || 0)
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left text-xs font-medium text-muted-foreground pb-3">Category</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Total</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Available</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Sold</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Revenue</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Conv.</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map((category, i) => {
            const conversionRate = category.total > 0
              ? ((category.sold / category.total) * 100).toFixed(1)
              : "0"

            return (
              <motion.tr
                key={category.id}
                className="border-b border-border/30 last:border-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="py-3">
                  <span className="font-medium">{category.name}</span>
                </td>
                <td className="py-3 text-right">{category.total}</td>
                <td className="py-3 text-right text-emerald-500">{category.available}</td>
                <td className="py-3 text-right text-orange-500">{category.sold}</td>
                <td className="py-3 text-right font-medium">
                  {category.revenue ? formatCurrency(category.revenue) : "-"}
                </td>
                <td className="py-3 text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      parseFloat(conversionRate) >= 50
                        ? "text-emerald-500 border-emerald-500/30"
                        : parseFloat(conversionRate) >= 25
                        ? "text-orange-500 border-orange-500/30"
                        : "text-muted-foreground"
                    )}
                  >
                    {conversionRate}%
                  </Badge>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Top items list
function TopItemsList({ items }: { items: TopItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </div>
          <span className="font-semibold">
            {formatCurrency(item.price, item.currency)}
          </span>
        </motion.div>
      ))}
      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No items found</p>
      )}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Data states
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [categories, setCategories] = useState<CategoryBreakdown[]>([])
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([])
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([])
  const [inventory, setInventory] = useState<InventoryMetrics | null>(null)
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null)
  const [topItems, setTopItems] = useState<TopItem[]>([])

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const days = parseInt(timeRange)

      const [
        summaryData,
        categoriesData,
        revenueData,
        salesData,
        inventoryData,
        analyticsData,
        topItemsData,
      ] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getCategories(),
        analyticsApi.getRevenueTrend(days),
        analyticsApi.getSalesTrend(days),
        analyticsApi.getInventoryMetrics(),
        analyticsApi.getSalesAnalytics(),
        dashboardApi.getTopItems(10, "price"),
      ])

      setSummary(summaryData)
      setCategories(categoriesData)
      setRevenueTrend(revenueData)
      setSalesTrend(salesData)
      setInventory(inventoryData)
      setSalesAnalytics(analyticsData)
      setTopItems(topItemsData)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  // Generate gender distribution data for donut chart
  const genderData = useMemo(() => {
    if (!inventory?.gender_distribution) return []
    return inventory.gender_distribution.map((g) => ({
      label: g.gender === "M" ? "Male" : g.gender === "F" ? "Female" : g.gender || "Unknown",
      value: g.count,
    }))
  }, [inventory])

  // Generate age distribution data for donut chart
  const ageData = useMemo(() => {
    if (!inventory?.age_distribution) return []
    return [
      { label: "Young", value: inventory.age_distribution.young },
      { label: "Adult", value: inventory.age_distribution.adult },
    ].filter((d) => d.value > 0)
  }, [inventory])

  // Revenue sparkline data
  const revenueSparkline = useMemo(
    () => revenueTrend.map((d) => d.revenue),
    [revenueTrend]
  )

  // Sales sparkline data
  const salesSparkline = useMemo(
    () => salesTrend.map((d) => d.count),
    [salesTrend]
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Comprehensive business insights and metrics"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Comprehensive business insights and metrics"
        actions={
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        }
      />

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsStatCard
          title="Total Revenue"
          value={formatCurrency(summary?.total_revenue || 0)}
          change={summary?.revenue_change}
          icon={<DollarSign className="h-5 w-5" />}
          subtitle="All time"
          sparklineData={revenueSparkline}
          chartType="bar"
          chartColor="primary"
        />
        <AnalyticsStatCard
          title="Total Sales"
          value={summary?.sold_livestock || 0}
          change={summary?.sold_change}
          icon={<ShoppingCart className="h-5 w-5" />}
          subtitle={`${summary?.sold_this_week || 0} this week`}
          sparklineData={salesSparkline}
          chartType="bar"
          chartColor="emerald"
        />
        <AnalyticsStatCard
          title="Available Stock"
          value={summary?.available_livestock || 0}
          icon={<Package className="h-5 w-5" />}
          subtitle={`${formatCurrency(summary?.pending_value || 0)} value`}
        />
        <AnalyticsStatCard
          title="Conversion Rate"
          value={`${summary?.conversion_rate || 0}%`}
          icon={<Target className="h-5 w-5" />}
          subtitle="Sold / Total"
          chartColor={
            (summary?.conversion_rate || 0) >= 50
              ? "emerald"
              : (summary?.conversion_rate || 0) >= 25
              ? "orange"
              : "red"
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">
                Daily revenue for the last {timeRange} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <RevenueChart data={revenueTrend} />
        </motion.div>

        {/* Sales Trend */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Sales Trend</h3>
              <p className="text-sm text-muted-foreground">
                Daily sales for the last {timeRange} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <SalesTrendChart data={salesTrend} />
        </motion.div>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gender Distribution */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Gender Distribution</h3>
          </div>
          <DonutChart
            data={genderData}
            colors={["hsl(var(--primary))", "#f97316", "#10b981", "#8b5cf6"]}
          />
        </motion.div>

        {/* Age Distribution */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Age Distribution</h3>
          </div>
          <DonutChart
            data={ageData}
            colors={["#10b981", "#f97316"]}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Inventory Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg. Price</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(inventory?.price_range.avg || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Max Price</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(inventory?.price_range.max || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Min Price</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(inventory?.price_range.min || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Media Files</span>
              </div>
              <span className="font-semibold">{inventory?.media_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Categories</span>
              </div>
              <span className="font-semibold">{inventory?.categories_count || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Performance */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Category Performance</h3>
              <p className="text-sm text-muted-foreground">
                Revenue and conversion by category
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <CategoryPerformanceTable categories={categories} />
        </motion.div>

        {/* Top Items */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Top Livestock</h3>
              <p className="text-sm text-muted-foreground">
                Highest priced available items
              </p>
            </div>
            <PawPrint className="h-5 w-5 text-muted-foreground" />
          </div>
          <TopItemsList items={topItems} />
        </motion.div>
      </div>

      {/* Sales Analytics Summary */}
      {salesAnalytics && (
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Sales Summary</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(salesAnalytics.period.start)} - {formatDate(salesAnalytics.period.end)}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
              <p className="text-2xl font-bold">{salesAnalytics.total_sales}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(salesAnalytics.total_revenue)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Avg. Sale Price</p>
              <p className="text-2xl font-bold">{formatCurrency(salesAnalytics.average_sale_price)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">Top Category</p>
              <p className="text-2xl font-bold truncate">
                {salesAnalytics.sales_by_category[0]?.category__name || "-"}
              </p>
            </div>
          </div>

          {/* Sales by Category Breakdown */}
          {salesAnalytics.sales_by_category.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Sales by Category</h4>
              <div className="space-y-2">
                {salesAnalytics.sales_by_category.slice(0, 5).map((cat, i) => {
                  const maxRevenue = Math.max(
                    ...salesAnalytics.sales_by_category.map((c) => c.revenue)
                  )
                  const percentage = maxRevenue > 0 ? (cat.revenue / maxRevenue) * 100 : 0

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-24 truncate">{cat.category__name || "Unknown"}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        {formatCurrency(cat.revenue)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
