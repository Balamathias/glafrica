// API Types for Green Livestock Africa

export interface Media {
  id: string
  file: string
  media_type: 'image' | 'video'
  aspect_ratio: number
  is_featured: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon?: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Livestock {
  id: string
  name: string
  breed: string
  category: Category
  category_id?: string
  age: string
  weight: string
  gender: 'M' | 'F' | 'mixed'
  price: string
  currency: string
  location: string
  is_sold: boolean
  description: string
  health_status: string
  vaccination_history: VaccinationRecord[]
  media: Media[]
  tags: Tag[]
  tag_ids?: string[]
  created_at: string
  updated_at: string
}

export interface LivestockListItem {
  id: string
  name: string
  breed: string
  price: string
  currency: string
  location: string
  featured_image: Media | null
  category_name: string
  media_count: number
  is_sold: boolean
}

export interface VaccinationRecord {
  name: string
  date: string
  next_due?: string
  notes?: string
}

// API Response types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
  context_count: number
}

export interface SearchFilters {
  category?: string
  gender?: 'M' | 'F' | 'mixed'
  is_sold?: boolean
  min_price?: number
  max_price?: number
  search?: string
  ordering?: string
}

// UI State types
export interface ModalState {
  isOpen: boolean
  livestockId: string | null
}

export type ViewMode = 'grid' | 'list'

// Utility type for gender display
export const GENDER_LABELS: Record<string, string> = {
  M: 'Male',
  F: 'Female',
  mixed: 'Mixed (Group)',
}

// Currency formatter
export function formatPrice(price: string | number, currency: string = 'NGN'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(numPrice)
}

// Date formatter
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Relative time formatter
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return formatDate(dateString)
}
