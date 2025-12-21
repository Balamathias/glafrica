import axios, { AxiosError, AxiosInstance } from 'axios'
import { useAuthStore, AdminUser } from './admin-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Create admin API instance
export const adminApi: AxiosInstance = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
adminApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle token refresh
adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/admin/auth/token/refresh/`, {
            refresh: refreshToken,
          })

          useAuthStore.getState().setTokens(data.access, data.refresh || refreshToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access}`
          }
          return adminApi(originalRequest)
        } catch {
          useAuthStore.getState().clearAuth()
          window.location.href = '/admin/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Error handler
function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const data = error.response?.data

    // Handle DRF validation errors (field-level errors)
    if (data && typeof data === 'object' && !data.detail) {
      // Convert field errors to a readable message
      const fieldErrors = Object.entries(data)
        .map(([field, errors]) => {
          const errorMsg = Array.isArray(errors) ? errors.join(', ') : String(errors)
          return `${field}: ${errorMsg}`
        })
        .join('; ')
      throw new Error(fieldErrors || 'Validation error')
    }

    const message = data?.detail || error.message || 'An error occurred'
    throw new Error(message)
  }
  throw error
}

// Types
export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: AdminUser
}

export interface DashboardSummary {
  total_livestock: number
  available_livestock: number
  sold_livestock: number
  total_revenue: number
  pending_value: number
  new_this_week: number
  sold_this_week: number
  revenue_this_week: number
  sold_change: number
  revenue_change: number
  conversion_rate: number
  currency: string
}

export interface CategoryBreakdown {
  id: string
  name: string
  slug: string
  total: number
  available: number
  sold: number
  revenue: number | null
}

export interface ActivityItem {
  id: string
  user: string
  action: string
  resource_type: string
  description: string
  timestamp: string
}

export interface FullDashboard {
  summary: DashboardSummary
  categories: CategoryBreakdown[]
  sales_trend: Array<{ date: string; count: number; revenue: number }>
  recent_activity: ActivityItem[]
}

// Analytics types
export interface SalesTrendItem {
  date: string
  count: number
  revenue: number
}

export interface RevenueTrendItem {
  date: string
  revenue: number
}

export interface InventoryMetrics {
  price_range: {
    min: number
    max: number
    avg: number
    total_value: number
  }
  age_distribution: {
    young: number
    adult: number
  }
  gender_distribution: Array<{
    gender: string
    count: number
  }>
  top_categories: Array<{
    name: string
    sold_count: number
    revenue: number | null
  }>
  media_count: number
  categories_count: number
}

export interface SalesAnalytics {
  period: {
    start: string
    end: string
  }
  total_sales: number
  total_revenue: number
  average_sale_price: number
  sales_by_category: Array<{
    category__name: string
    count: number
    revenue: number
  }>
  daily_trend: Array<{
    date: string
    count: number
    revenue: number
  }>
  weekly_trend: Array<{
    week: string
    count: number
    revenue: number
  }>
}

export interface TopItem {
  id: string
  name: string
  category: string
  price: number
  currency: string
}

// Visitor Analytics Types
export interface VisitorSummary {
  total_visits: number
  unique_visitors: number
  bounce_rate: number
  avg_session_duration: number
  visits_change: number
  visitors_change: number
  period_days: number
}

export interface VisitTrendItem {
  date: string
  visits: number
  unique_visitors: number
}

export interface TopPageItem {
  path: string
  views: number
  unique_visitors: number
}

export interface TopLivestockViewItem {
  id: string
  name: string
  breed: string
  price: number
  category: string
  views: number
  unique_viewers: number
}

export interface DeviceBreakdownItem {
  device_type: string
  count: number
  percentage: number
}

export interface TrafficSourceItem {
  source: string
  visits: number
  percentage: number
}

export interface GeographicItem {
  country: string
  visitors: number
  percentage: number
}

// Admin User types
export interface UserProfile {
  role: 'superadmin' | 'admin' | 'staff' | 'viewer'
  avatar: string | null
  phone: string
  is_active_admin: boolean
  last_login_ip: string | null
}

export interface AdminUserFull {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  profile: UserProfile | null
  role: string
  avatar: string | null
  last_login: string | null
  date_joined: string
}

export interface CreateAdminUserPayload {
  username: string
  email: string
  password: string
  confirm_password: string
  first_name?: string
  last_name?: string
  role: 'superadmin' | 'admin' | 'staff' | 'viewer'
  phone?: string
}

export interface UpdateAdminUserPayload {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export interface AdminLivestock {
  id: string
  name: string
  breed: string
  category_name: string
  category_slug: string
  category_id?: string
  age: string
  weight: string
  gender: string
  price: string
  currency: string
  location: string
  is_sold: boolean
  sold_at: string | null
  sold_price: string | null
  featured_image: {
    id: string
    file_url: string
    media_type: string
  } | null
  media_count: number
  tag_names: string[]
  tag_ids?: string[]
  created_at: string
  updated_at: string
}

export interface LivestockDetail extends AdminLivestock {
  category_id: string
  tag_ids: string[]
  description: string
  health_status: string
  vaccination_history: Array<{
    id: string
    name: string
    date: string
    notes?: string
  }>
  media: Array<{
    id: string
    file_url: string
    media_type: string
    is_featured: boolean
    aspect_ratio: number
  }>
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  created_at?: string,
  updated_at?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await adminApi.post<LoginResponse>('/auth/login/', credentials)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await adminApi.post('/auth/logout/', { refresh: refreshToken })
    } catch (error) {
      // Ignore logout errors
    }
  },

  async getCurrentUser(): Promise<AdminUser> {
    try {
      const { data } = await adminApi.get<AdminUser>('/auth/me/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async updateProfile(updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const { data } = await adminApi.patch<AdminUser>('/auth/me/', updates)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      await adminApi.post('/auth/password/change/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Dashboard API
export const dashboardApi = {
  async getFullDashboard(): Promise<FullDashboard> {
    try {
      const { data } = await adminApi.get<FullDashboard>('/dashboard/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getSummary(): Promise<DashboardSummary> {
    try {
      const { data } = await adminApi.get<DashboardSummary>('/dashboard/summary/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getCategories(): Promise<CategoryBreakdown[]> {
    try {
      const { data } = await adminApi.get<CategoryBreakdown[]>('/dashboard/categories/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const { data } = await adminApi.get<ActivityItem[]>('/dashboard/activity/', {
        params: { limit },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getTopItems(limit: number = 10, by: 'price' | 'recent' = 'price'): Promise<TopItem[]> {
    try {
      const { data } = await adminApi.get<TopItem[]>('/dashboard/top-items/', {
        params: { limit, by },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Analytics API
export const analyticsApi = {
  async getSalesTrend(days: number = 30): Promise<SalesTrendItem[]> {
    try {
      const { data } = await adminApi.get<SalesTrendItem[]>('/analytics/sales-trend/', {
        params: { days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getRevenueTrend(days: number = 30): Promise<RevenueTrendItem[]> {
    try {
      const { data } = await adminApi.get<RevenueTrendItem[]>('/analytics/revenue-trend/', {
        params: { days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getInventoryMetrics(): Promise<InventoryMetrics> {
    try {
      const { data } = await adminApi.get<InventoryMetrics>('/analytics/inventory/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getSalesAnalytics(startDate?: string, endDate?: string): Promise<SalesAnalytics> {
    try {
      const params: Record<string, string> = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const { data } = await adminApi.get<SalesAnalytics>('/analytics/sales/', { params })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Visitor Analytics Methods
  async getVisitorSummary(days: number = 30): Promise<VisitorSummary> {
    try {
      const { data } = await adminApi.get<VisitorSummary>('/analytics/visitors/', {
        params: { days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getVisitTrend(days: number = 30): Promise<VisitTrendItem[]> {
    try {
      const { data } = await adminApi.get<VisitTrendItem[]>('/analytics/visits-trend/', {
        params: { days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getTopPages(limit: number = 10, days: number = 30): Promise<TopPageItem[]> {
    try {
      const { data } = await adminApi.get<TopPageItem[]>('/analytics/top-pages/', {
        params: { limit, days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getTopLivestockViews(limit: number = 10, days: number = 30): Promise<TopLivestockViewItem[]> {
    try {
      const { data } = await adminApi.get<TopLivestockViewItem[]>('/analytics/top-livestock/', {
        params: { limit, days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getDeviceBreakdown(days: number = 30): Promise<DeviceBreakdownItem[]> {
    try {
      const { data } = await adminApi.get<DeviceBreakdownItem[]>('/analytics/devices/', {
        params: { days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getTrafficSources(limit: number = 10, days: number = 30): Promise<TrafficSourceItem[]> {
    try {
      const { data } = await adminApi.get<TrafficSourceItem[]>('/analytics/referrers/', {
        params: { limit, days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getGeographicBreakdown(limit: number = 10, days: number = 30): Promise<GeographicItem[]> {
    try {
      const { data } = await adminApi.get<GeographicItem[]>('/analytics/geographic/', {
        params: { limit, days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Livestock API
export const adminLivestockApi = {
  async getList(
    page: number = 1,
    filters?: {
      category?: string
      is_sold?: boolean
      search?: string
      ordering?: string
      min_price?: number
      max_price?: number
    }
  ): Promise<PaginatedResponse<AdminLivestock>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.category) params.append('category', filters.category)
        if (filters.is_sold !== undefined) params.append('is_sold', filters.is_sold.toString())
        if (filters.search) params.append('search', filters.search)
        if (filters.ordering) params.append('ordering', filters.ordering)
        if (filters.min_price) params.append('min_price', filters.min_price.toString())
        if (filters.max_price) params.append('max_price', filters.max_price.toString())
      }

      const { data } = await adminApi.get<PaginatedResponse<AdminLivestock>>(`/livestock/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<AdminLivestock> {
    try {
      const { data } = await adminApi.get<AdminLivestock>(`/livestock/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getDetail(id: string): Promise<LivestockDetail> {
    try {
      const { data } = await adminApi.get<{
        id: string
        name: string
        breed: string
        category: { id: string; name: string; slug: string }
        tags: Array<{ id: string; name: string; slug: string }>
        age: string
        weight: string
        gender: string
        price: string
        currency: string
        location: string
        is_sold: boolean
        sold_at: string | null
        sold_price: string | null
        description: string
        health_status: string
        vaccination_history: Array<{ id: string; name: string; date: string; notes?: string }>
        media: Array<{ id: string; file_url: string; media_type: string; is_featured: boolean; aspect_ratio: number }>
        created_at: string
        updated_at: string
      }>(`/livestock/${id}/`)

      // Transform the response to match LivestockDetail interface
      return {
        ...data,
        category_name: data.category.name,
        category_slug: data.category.slug,
        category_id: data.category.id,
        tag_names: data.tags.map(t => t.name),
        tag_ids: data.tags.map(t => t.id),
        featured_image: data.media.find(m => m.is_featured) || data.media[0] || null,
        media_count: data.media.length,
      }
    } catch (error) {
      handleApiError(error)
    }
  },

  async deleteMedia(_livestockId: string, mediaId: string): Promise<void> {
    try {
      await adminApi.delete(`/media/${mediaId}/`)
    } catch (error) {
      handleApiError(error)
    }
  },

  async markSold(id: string, soldPrice?: number): Promise<AdminLivestock> {
    try {
      const { data } = await adminApi.post<AdminLivestock>(`/livestock/${id}/mark_sold/`, {
        sold_price: soldPrice,
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async create(livestock: Partial<AdminLivestock>): Promise<AdminLivestock> {
    try {
      const { data } = await adminApi.post<AdminLivestock>('/livestock/', livestock)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async update(id: string, updates: Partial<AdminLivestock>): Promise<AdminLivestock> {
    try {
      const { data } = await adminApi.patch<AdminLivestock>(`/livestock/${id}/`, updates)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/livestock/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },

  async bulkDelete(ids: string[]): Promise<{ detail: string; count: number }> {
    try {
      const { data } = await adminApi.post<{ detail: string; count: number }>('/livestock/bulk_delete/', { ids })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async bulkMarkSold(ids: string[], pricePercentage: number = 100): Promise<{ detail: string; count: number }> {
    try {
      const { data } = await adminApi.post<{ detail: string; count: number }>('/livestock/bulk_mark_sold/', {
        ids,
        sold_price_percentage: pricePercentage,
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async uploadMedia(
    livestockId: string,
    file: File,
    options?: { media_type?: string; is_featured?: boolean; aspect_ratio?: number }
  ): Promise<unknown> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (options?.media_type) formData.append('media_type', options.media_type)
      if (options?.is_featured) formData.append('is_featured', 'true')
      if (options?.aspect_ratio) formData.append('aspect_ratio', options.aspect_ratio.toString())

      const { data } = await adminApi.post(`/livestock/${livestockId}/upload_media/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async export(format: 'csv' | 'json' = 'csv', ids?: string[]): Promise<Blob | unknown> {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      if (ids?.length) {
        ids.forEach((id) => params.append('ids', id))
      }

      if (format === 'csv') {
        const response = await adminApi.get(`/livestock/export/?${params}`, {
          responseType: 'blob',
        })
        return response.data
      }

      const { data } = await adminApi.get(`/livestock/export/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Categories API
export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    try {
      const { data } = await adminApi.get<Category[] | PaginatedResponse<Category>>('/categories/')
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        return data
      }
      return data.results || []
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<Category> {
    try {
      const { data } = await adminApi.get<Category>(`/categories/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async create(category: { name: string; description?: string }): Promise<Category> {
    try {
      const { data } = await adminApi.post<Category>('/categories/', category)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const { data } = await adminApi.patch<Category>(`/categories/${id}/`, updates)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/categories/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Media Asset type
export interface MediaAsset {
  id: string
  livestock_id: string
  livestock_name: string
  file_url: string
  media_type: 'image' | 'video'
  is_featured: boolean
  aspect_ratio: number
  created_at: string
  updated_at: string
}

// Media API
export const mediaApi = {
  async getList(
    page: number = 1,
    filters?: {
      livestock?: string
      type?: 'image' | 'video'
      ordering?: string
    }
  ): Promise<PaginatedResponse<MediaAsset>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.livestock) params.append('livestock', filters.livestock)
        if (filters.type) params.append('type', filters.type)
        if (filters.ordering) params.append('ordering', filters.ordering)
      }

      const { data } = await adminApi.get<PaginatedResponse<MediaAsset>>(`/media/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<MediaAsset> {
    try {
      const { data } = await adminApi.get<MediaAsset>(`/media/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async setFeatured(id: string): Promise<{ detail: string }> {
    try {
      const { data } = await adminApi.post<{ detail: string }>(`/media/${id}/set_featured/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/media/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },

  async bulkDelete(ids: string[]): Promise<{ detail: string; count: number }> {
    try {
      // Delete one by one since there's no bulk delete endpoint
      for (const id of ids) {
        await adminApi.delete(`/media/${id}/`)
      }
      return { detail: `Successfully deleted ${ids.length} items.`, count: ids.length }
    } catch (error) {
      handleApiError(error)
    }
  },

  async upload(
    livestockId: string,
    file: File,
    options?: { media_type?: string; is_featured?: boolean; aspect_ratio?: number }
  ): Promise<MediaAsset> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (options?.media_type) formData.append('media_type', options.media_type)
      if (options?.is_featured) formData.append('is_featured', 'true')
      if (options?.aspect_ratio) formData.append('aspect_ratio', options.aspect_ratio.toString())

      const { data } = await adminApi.post<MediaAsset>(`/livestock/${livestockId}/upload_media/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Tags API
export const tagsApi = {
  async getAll(): Promise<Tag[]> {
    try {
      const { data } = await adminApi.get<Tag[] | PaginatedResponse<Tag>>('/tags/')
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        return data
      }
      return data.results || []
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<Tag> {
    try {
      const { data } = await adminApi.get<Tag>(`/tags/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async create(name: string): Promise<Tag> {
    try {
      const { data } = await adminApi.post<Tag>('/tags/', { name })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async update(id: string, updates: Partial<Tag>): Promise<Tag> {
    try {
      const { data } = await adminApi.patch<Tag>(`/tags/${id}/`, updates)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/tags/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Users API (superadmin only)
export const usersApi = {
  async getList(
    page: number = 1,
    filters?: {
      role?: string
      is_active?: boolean
      search?: string
    }
  ): Promise<PaginatedResponse<AdminUserFull>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.role) params.append('role', filters.role)
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString())
        if (filters.search) params.append('search', filters.search)
      }

      const { data } = await adminApi.get<PaginatedResponse<AdminUserFull>>(`/auth/users/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: number): Promise<AdminUserFull> {
    try {
      const { data } = await adminApi.get<AdminUserFull>(`/auth/users/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async create(payload: CreateAdminUserPayload): Promise<AdminUserFull> {
    try {
      const { data } = await adminApi.post<AdminUserFull>('/auth/users/', payload)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async update(id: number, payload: UpdateAdminUserPayload): Promise<AdminUserFull> {
    try {
      const { data } = await adminApi.patch<AdminUserFull>(`/auth/users/${id}/`, payload)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: number): Promise<{ detail: string }> {
    try {
      const { data } = await adminApi.delete<{ detail: string }>(`/auth/users/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async toggleStatus(id: number): Promise<{ detail: string; is_active: boolean }> {
    try {
      const { data } = await adminApi.post<{ detail: string; is_active: boolean }>(
        `/auth/users/${id}/toggle-status/`
      )
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Contact Inquiry types
export interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: 'purchase' | 'investment' | 'partnership' | 'visit' | 'support' | 'other'
  subject_display: string
  message?: string
  status: 'new' | 'read' | 'replied' | 'closed'
  status_display: string
  notes?: string
  replied_at: string | null
  replied_by: number | null
  replied_by_name: string | null
  created_at: string
  updated_at?: string
}

export interface InquiryStats {
  total: number
  new: number
  read: number
  replied: number
  closed: number
  by_subject: Array<{ subject: string; count: number }>
}

// Inquiries API
export const inquiriesApi = {
  async getList(
    page: number = 1,
    filters?: {
      status?: string
      subject?: string
      search?: string
      date_from?: string
      date_to?: string
    }
  ): Promise<PaginatedResponse<ContactInquiry>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.status) params.append('status', filters.status)
        if (filters.subject) params.append('subject', filters.subject)
        if (filters.search) params.append('search', filters.search)
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)
      }

      const { data } = await adminApi.get<PaginatedResponse<ContactInquiry>>(`/inquiries/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<ContactInquiry> {
    try {
      const { data } = await adminApi.get<ContactInquiry>(`/inquiries/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getStats(): Promise<InquiryStats> {
    try {
      const { data } = await adminApi.get<InquiryStats>('/inquiries/stats/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async updateStatus(
    id: string,
    status: ContactInquiry['status'],
    notes?: string
  ): Promise<ContactInquiry> {
    try {
      const { data } = await adminApi.patch<ContactInquiry>(`/inquiries/${id}/`, {
        status,
        notes,
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async markRead(id: string): Promise<{ detail: string }> {
    try {
      const { data } = await adminApi.post<{ detail: string }>(`/inquiries/${id}/mark_read/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/inquiries/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },
}

// ============================================
// EGG TYPES AND API
// ============================================

// Egg admin types
export interface AdminEgg {
  id: string
  name: string
  slug: string
  breed: string
  category_name: string
  category_slug: string
  category_id?: string
  egg_type: 'table' | 'fertilized' | 'organic' | 'free_range'
  size: 'small' | 'medium' | 'large' | 'extra_large' | 'jumbo'
  packaging: 'crate_30' | 'tray_30' | 'tray_12' | 'half_crate_15' | 'custom'
  eggs_per_unit: number
  price: string
  currency: string
  quantity_available: number
  production_date: string | null
  expiry_date: string | null
  days_until_expiry: number | null
  freshness_status: 'fresh' | 'use_soon' | 'expiring_soon' | 'expired' | 'unknown'
  location: string
  is_available: boolean
  is_featured: boolean
  featured_image: {
    id: string
    url: string
    media_type: string
  } | null
  media_count: number
  tag_names: string[]
  tag_ids?: string[]
  created_at: string
  updated_at: string
}

export interface AdminEggDetail extends AdminEgg {
  category_id: string
  tag_ids: string[]
  description: string
  shelf_life_days: number | null
  freshness_percentage: number
  media: Array<{
    id: string
    url: string
    media_type: string
    is_primary: boolean
    aspect_ratio: number
    alt_text: string
  }>
}

export interface AdminEggCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  is_active: boolean
  order: number
  egg_count?: number
  created_at?: string
  updated_at?: string
}

export interface AdminEggMedia {
  id: string
  egg_id: string
  egg_name: string
  url: string
  media_type: 'image' | 'video'
  is_primary: boolean
  aspect_ratio: number
  alt_text: string
  order: number
  created_at: string
  updated_at: string
}

export interface EggStats {
  total_eggs: number
  available_eggs: number
  featured_eggs: number
  freshness: {
    fresh: number
    use_soon: number
    expiring_soon: number
    expired: number
  }
  total_value: number
  eggs_by_category: Array<{
    id: string
    name: string
    slug: string
    total: number
    available: number
    value: number | null
  }>
  new_this_week: number
  price_range: {
    min: number
    max: number
    avg: number
  }
  currency: string
}

// Admin Eggs API
export const adminEggsApi = {
  async getList(
    page: number = 1,
    filters?: {
      category?: string
      egg_type?: string
      size?: string
      packaging?: string
      freshness?: string
      is_available?: boolean
      is_featured?: boolean
      search?: string
      ordering?: string
    }
  ): Promise<PaginatedResponse<AdminEgg>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.category) params.append('category__slug', filters.category)
        if (filters.egg_type) params.append('egg_type', filters.egg_type)
        if (filters.size) params.append('size', filters.size)
        if (filters.packaging) params.append('packaging', filters.packaging)
        if (filters.freshness) params.append('freshness', filters.freshness)
        if (filters.is_available !== undefined) params.append('is_available', filters.is_available.toString())
        if (filters.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString())
        if (filters.search) params.append('search', filters.search)
        if (filters.ordering) params.append('ordering', filters.ordering)
      }

      const { data } = await adminApi.get<PaginatedResponse<AdminEgg>>(`/eggs/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<AdminEgg> {
    try {
      const { data } = await adminApi.get<AdminEgg>(`/eggs/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getDetail(id: string): Promise<AdminEggDetail> {
    try {
      const { data } = await adminApi.get<{
        id: string
        name: string
        slug: string
        breed: string
        category: { id: string; name: string; slug: string }
        tags: Array<{ id: string; name: string; slug: string }>
        egg_type: AdminEgg['egg_type']
        size: AdminEgg['size']
        packaging: AdminEgg['packaging']
        eggs_per_unit: number
        price: string
        currency: string
        quantity_available: number
        production_date: string | null
        expiry_date: string | null
        days_until_expiry: number
        shelf_life_days: number | null
        freshness_status: AdminEgg['freshness_status']
        freshness_percentage: number
        location: string
        description: string
        is_available: boolean
        is_featured: boolean
        media: Array<{ id: string; url: string; media_type: string; is_primary: boolean; aspect_ratio: number; alt_text: string }>
        created_at: string
        updated_at: string
      }>(`/eggs/${id}/`)

      // Transform the response to match AdminEggDetail interface
      return {
        ...data,
        category_name: data.category.name,
        category_slug: data.category.slug,
        category_id: data.category.id,
        tag_names: data.tags.map(t => t.name),
        tag_ids: data.tags.map(t => t.id),
        featured_image: data.media.find(m => m.is_primary) || data.media[0] || null,
        media_count: data.media.length,
      }
    } catch (error) {
      handleApiError(error)
    }
  },

  async create(egg: Partial<AdminEgg>): Promise<AdminEgg> {
    try {
      const { data } = await adminApi.post<AdminEgg>('/eggs/', egg)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async update(id: string, updates: Partial<AdminEgg>): Promise<AdminEgg> {
    try {
      const { data } = await adminApi.patch<AdminEgg>(`/eggs/${id}/`, updates)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/eggs/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },

  async bulkDelete(ids: string[]): Promise<{ detail: string; count: number }> {
    try {
      const { data } = await adminApi.post<{ detail: string; count: number }>('/eggs/bulk_delete/', { ids })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async bulkUpdate(
    ids: string[],
    updates: Partial<AdminEgg>
  ): Promise<{ detail: string; count: number }> {
    try {
      const { data } = await adminApi.post<{ detail: string; count: number }>('/eggs/bulk_update/', {
        ids,
        ...updates,
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getExpiringSoon(days: number = 7): Promise<AdminEgg[]> {
    try {
      const { data } = await adminApi.get<AdminEgg[]>('/eggs/expiring_soon/', {
        params: { days },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getStats(): Promise<EggStats> {
    try {
      const { data } = await adminApi.get<EggStats>('/eggs/stats/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async uploadMedia(
    eggId: string,
    file: File,
    options?: { media_type?: string; is_primary?: boolean; aspect_ratio?: number; alt_text?: string }
  ): Promise<AdminEggMedia> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (options?.media_type) formData.append('media_type', options.media_type)
      if (options?.is_primary) formData.append('is_primary', 'true')
      if (options?.aspect_ratio) formData.append('aspect_ratio', options.aspect_ratio.toString())
      if (options?.alt_text) formData.append('alt_text', options.alt_text)

      const { data } = await adminApi.post<AdminEggMedia>(`/eggs/${eggId}/upload_media/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async deleteMedia(_eggId: string, mediaId: string): Promise<void> {
    try {
      await adminApi.delete(`/egg-media/${mediaId}/`)
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Admin Egg Categories API
export const adminEggCategoriesApi = {
  async getAll(): Promise<AdminEggCategory[]> {
    try {
      const { data } = await adminApi.get<AdminEggCategory[] | PaginatedResponse<AdminEggCategory>>('/egg-categories/')
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) {
        return data
      }
      return data.results || []
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<AdminEggCategory> {
    try {
      const { data } = await adminApi.get<AdminEggCategory>(`/egg-categories/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async create(category: { name: string; description?: string; image?: File }): Promise<AdminEggCategory> {
    try {
      const formData = new FormData()
      formData.append('name', category.name)
      if (category.description) formData.append('description', category.description)
      if (category.image) formData.append('image', category.image)

      const { data } = await adminApi.post<AdminEggCategory>('/egg-categories/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async update(id: string, updates: Partial<AdminEggCategory> & { image?: File }): Promise<AdminEggCategory> {
    try {
      const formData = new FormData()
      if (updates.name) formData.append('name', updates.name)
      if (updates.description !== undefined) formData.append('description', updates.description)
      if (updates.is_active !== undefined) formData.append('is_active', updates.is_active.toString())
      if (updates.order !== undefined) formData.append('order', updates.order.toString())
      if (updates.image) formData.append('image', updates.image)

      const { data } = await adminApi.patch<AdminEggCategory>(`/egg-categories/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/egg-categories/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Admin Egg Media API
export const adminEggMediaApi = {
  async getList(
    page: number = 1,
    filters?: {
      egg?: string
      type?: 'image' | 'video'
      ordering?: string
    }
  ): Promise<PaginatedResponse<AdminEggMedia>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.egg) params.append('egg', filters.egg)
        if (filters.type) params.append('type', filters.type)
        if (filters.ordering) params.append('ordering', filters.ordering)
      }

      const { data } = await adminApi.get<PaginatedResponse<AdminEggMedia>>(`/egg-media/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async getById(id: string): Promise<AdminEggMedia> {
    try {
      const { data } = await adminApi.get<AdminEggMedia>(`/egg-media/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async setPrimary(id: string): Promise<{ detail: string }> {
    try {
      const { data } = await adminApi.post<{ detail: string }>(`/egg-media/${id}/set_primary/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await adminApi.delete(`/egg-media/${id}/`)
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Export default admin API object
export default {
  auth: authApi,
  dashboard: dashboardApi,
  analytics: analyticsApi,
  livestock: adminLivestockApi,
  categories: categoriesApi,
  tags: tagsApi,
  media: mediaApi,
  users: usersApi,
  inquiries: inquiriesApi,
  eggs: adminEggsApi,
  eggCategories: adminEggCategoriesApi,
  eggMedia: adminEggMediaApi,
}
