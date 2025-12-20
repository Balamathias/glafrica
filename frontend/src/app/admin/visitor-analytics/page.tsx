"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Eye,
  Users,
  Clock,
  Activity,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  MapPin,
  BarChart3,
  Calendar,
  RefreshCcw,
  Loader2,
  PawPrint,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  analyticsApi,
  type VisitorSummary,
  type VisitTrendItem,
  type TopPageItem,
  type TopLivestockViewItem,
  type DeviceBreakdownItem,
  type TrafficSourceItem,
  type GeographicItem,
} from "@/lib/admin-api"
import { PageHeader } from "@/components/admin/ui/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Format compact number
function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString()
}

// Time range options
const TIME_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
]

// Mini chart component for sparklines
function MiniChart({
  data,
  color = "primary",
}: {
  data: number[]
  color?: "primary" | "blue" | "emerald" | "orange" | "purple"
}) {
  if (!data.length) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const colorClass = {
    primary: "text-primary",
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
  }[color]

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

// Stat card
function VisitorStatCard({
  title,
  value,
  change,
  icon,
  subtitle,
  sparklineData,
  chartColor,
}: {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  subtitle?: string
  sparklineData?: number[]
  chartColor?: "primary" | "blue" | "emerald" | "orange" | "purple"
}) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

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
          <MiniChart data={sparklineData} color={chartColor} />
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
              {Math.abs(change).toFixed(1)}%
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

// Visit trend chart
function VisitTrendChart({ data }: { data: VisitTrendItem[] }) {
  const maxVisits = Math.max(...data.map((d) => d.visits), 1)

  if (!data.length) {
    return <p className="text-center text-muted-foreground py-8">No data available</p>
  }

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
              className="w-full rounded-t bg-blue-500/80 hover:bg-blue-500 transition-colors cursor-pointer"
              style={{ height: `${(item.visits / maxVisits) * 100}%`, minHeight: item.visits > 0 ? 4 : 0 }}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                <p className="font-medium">{item.visits} visits</p>
                <p className="text-muted-foreground">{item.unique_visitors} unique</p>
                <p className="text-muted-foreground">{formatDate(item.date)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(data[0]?.date)}</span>
        <span>{formatDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  )
}

// Donut chart for device distribution
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

// Top pages table
function TopPagesTable({ pages }: { pages: TopPageItem[] }) {
  if (!pages.length) {
    return <p className="text-center text-muted-foreground py-8">No page views yet</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left text-xs font-medium text-muted-foreground pb-3">Page</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Views</th>
            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Unique</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page, i) => (
            <motion.tr
              key={page.path}
              className="border-b border-border/30 last:border-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <td className="py-3">
                <span className="font-medium text-sm truncate max-w-[200px] block">{page.path}</span>
              </td>
              <td className="py-3 text-right">{page.views}</td>
              <td className="py-3 text-right text-muted-foreground">{page.unique_visitors}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Top livestock views list
function TopLivestockViewsList({ items }: { items: TopLivestockViewItem[] }) {
  if (!items.length) {
    return <p className="text-center text-muted-foreground py-8">No livestock views yet</p>
  }

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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 text-sm font-bold">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </div>
          <div className="text-right">
            <span className="font-semibold">{item.views}</span>
            <span className="text-xs text-muted-foreground ml-1">views</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Traffic sources chart
function TrafficSourcesChart({ sources }: { sources: TrafficSourceItem[] }) {
  if (!sources.length) {
    return <p className="text-center text-muted-foreground py-8">No referrer data yet</p>
  }

  const maxVisits = Math.max(...sources.map((s) => s.visits), 1)

  return (
    <div className="space-y-3">
      {sources.slice(0, 10).map((source, i) => {
        const percentage = (source.visits / maxVisits) * 100

        return (
          <motion.div
            key={source.source}
            className="space-y-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm truncate max-w-[180px]">{source.source}</span>
              </div>
              <span className="text-sm font-medium">{source.visits}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Geographic breakdown chart
function GeographicChart({ data }: { data: GeographicItem[] }) {
  if (!data.length) {
    return <p className="text-center text-muted-foreground py-8">No geographic data yet</p>
  }

  const maxVisitors = Math.max(...data.map((d) => d.visitors), 1)

  return (
    <div className="space-y-3">
      {data.slice(0, 10).map((item, i) => {
        const percentage = (item.visitors / maxVisitors) * 100

        return (
          <motion.div
            key={item.country}
            className="space-y-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{item.country || "Unknown"}</span>
              </div>
              <span className="text-sm font-medium">{item.visitors}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: i * 0.05 + 0.1, duration: 0.4 }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function VisitorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Data states
  const [visitorSummary, setVisitorSummary] = useState<VisitorSummary | null>(null)
  const [visitTrend, setVisitTrend] = useState<VisitTrendItem[]>([])
  const [topPages, setTopPages] = useState<TopPageItem[]>([])
  const [topLivestockViews, setTopLivestockViews] = useState<TopLivestockViewItem[]>([])
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdownItem[]>([])
  const [trafficSources, setTrafficSources] = useState<TrafficSourceItem[]>([])
  const [geographicData, setGeographicData] = useState<GeographicItem[]>([])

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const days = parseInt(timeRange)

      const [
        visitorSummaryData,
        visitTrendData,
        topPagesData,
        topLivestockViewsData,
        deviceBreakdownData,
        trafficSourcesData,
        geographicDataResult,
      ] = await Promise.all([
        analyticsApi.getVisitorSummary(days).catch(() => null),
        analyticsApi.getVisitTrend(days).catch(() => []),
        analyticsApi.getTopPages(15, days).catch(() => []),
        analyticsApi.getTopLivestockViews(10, days).catch(() => []),
        analyticsApi.getDeviceBreakdown(days).catch(() => []),
        analyticsApi.getTrafficSources(15, days).catch(() => []),
        analyticsApi.getGeographicBreakdown(15, days).catch(() => []),
      ])

      setVisitorSummary(visitorSummaryData)
      setVisitTrend(visitTrendData)
      setTopPages(topPagesData)
      setTopLivestockViews(topLivestockViewsData)
      setDeviceBreakdown(deviceBreakdownData)
      setTrafficSources(trafficSourcesData)
      setGeographicData(geographicDataResult)
    } catch (error) {
      console.error("Failed to load visitor analytics:", error)
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

  // Visit sparkline data
  const visitSparkline = useMemo(
    () => visitTrend.map((d) => d.visits),
    [visitTrend]
  )

  // Device breakdown data for donut chart
  const deviceData = useMemo(() => {
    if (!deviceBreakdown.length) return []
    return deviceBreakdown.map((d) => ({
      label: d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1),
      value: d.count,
    }))
  }, [deviceBreakdown])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Visitor Analytics"
          description="Site traffic and engagement metrics"
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
        title="Visitor Analytics"
        description="Site traffic and engagement metrics"
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
        <VisitorStatCard
          title="Total Visits"
          value={formatCompact(visitorSummary?.total_visits || 0)}
          change={visitorSummary?.visits_change}
          icon={<Eye className="h-5 w-5" />}
          subtitle={`Last ${timeRange} days`}
          sparklineData={visitSparkline}
          chartColor="blue"
        />
        <VisitorStatCard
          title="Unique Visitors"
          value={formatCompact(visitorSummary?.unique_visitors || 0)}
          change={visitorSummary?.visitors_change}
          icon={<Users className="h-5 w-5" />}
          subtitle="Distinct sessions"
          chartColor="emerald"
        />
        <VisitorStatCard
          title="Avg. Session"
          value={formatDuration(visitorSummary?.avg_session_duration || 0)}
          icon={<Clock className="h-5 w-5" />}
          subtitle="Time on site"
          chartColor="orange"
        />
        <VisitorStatCard
          title="Bounce Rate"
          value={`${(visitorSummary?.bounce_rate || 0).toFixed(1)}%`}
          icon={<Activity className="h-5 w-5" />}
          subtitle="Single page visits"
          chartColor={
            (visitorSummary?.bounce_rate || 0) <= 40
              ? "emerald"
              : (visitorSummary?.bounce_rate || 0) <= 60
              ? "orange"
              : "primary"
          }
        />
      </div>

      {/* Visit Trend Chart */}
      <motion.div
        className="rounded-2xl glass border border-border/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Visit Trend</h3>
            <p className="text-sm text-muted-foreground">
              Daily page views for the last {timeRange} days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <VisitTrendChart data={visitTrend} />
      </motion.div>

      {/* Two Column Grid: Top Pages & Popular Livestock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Top Pages</h3>
              <p className="text-sm text-muted-foreground">Most visited pages</p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <TopPagesTable pages={topPages} />
        </motion.div>

        {/* Top Livestock Views */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Popular Livestock</h3>
              <p className="text-sm text-muted-foreground">Most viewed items</p>
            </div>
            <PawPrint className="h-5 w-5 text-blue-500" />
          </div>
          <TopLivestockViewsList items={topLivestockViews} />
        </motion.div>
      </div>

      {/* Three Column Grid: Devices, Traffic Sources, Geographic */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device Distribution */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Device Types</h3>
          </div>
          <DonutChart
            data={deviceData}
            colors={["#3b82f6", "#f97316", "#8b5cf6"]}
          />
          {deviceData.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No device data yet</p>
          )}
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Traffic Sources</h3>
              <p className="text-sm text-muted-foreground">Where visitors come from</p>
            </div>
            <ExternalLink className="h-5 w-5 text-orange-500" />
          </div>
          <TrafficSourcesChart sources={trafficSources} />
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          className="rounded-2xl glass border border-border/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Visitor Locations</h3>
              <p className="text-sm text-muted-foreground">Geographic breakdown</p>
            </div>
            <MapPin className="h-5 w-5 text-emerald-500" />
          </div>
          <GeographicChart data={geographicData} />
        </motion.div>
      </div>
    </div>
  )
}
