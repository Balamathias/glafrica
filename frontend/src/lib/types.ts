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

export interface CategoryWithPreview extends Category {
  livestock_count: number
  preview_image: Media | null
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
  gender: 'M' | 'F' | 'mixed' | ''
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
  livestock_count?: number
  eggs_count?: number
}

// Smart search response (unified search for both livestock and eggs)
export interface SmartSearchResponse {
  livestock: LivestockListItem[]
  eggs: EggListItem[]
  intent: {
    livestock: boolean
    eggs: boolean
  }
  total_count: number
}

export interface SearchFilters {
  category?: string
  gender?: 'M' | 'F' | 'mixed'
  is_sold?: boolean
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

// ============================================
// EGG TYPES
// ============================================

// Egg size options
export type EggSize = 'small' | 'medium' | 'large' | 'extra_large' | 'jumbo'

export const EGG_SIZE_LABELS: Record<EggSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  extra_large: 'Extra Large',
  jumbo: 'Jumbo',
}

// Egg packaging options
export type EggPackaging = 'crate_30' | 'tray_30' | 'tray_12' | 'half_crate_15' | 'custom'

export const EGG_PACKAGING_LABELS: Record<EggPackaging, string> = {
  crate_30: 'Crate (30 eggs)',
  tray_30: 'Tray (30 eggs)',
  tray_12: 'Tray (12 eggs)',
  half_crate_15: 'Half Crate (15 eggs)',
  custom: 'Custom',
}

// Egg type options
export type EggType = 'table' | 'fertilized' | 'organic' | 'free_range'

export const EGG_TYPE_LABELS: Record<EggType, string> = {
  table: 'Table Eggs',
  fertilized: 'Fertilized/Hatching',
  organic: 'Organic',
  free_range: 'Free Range',
}

// Egg category (bird species)
export interface EggCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  is_active: boolean
  order: number
  egg_count?: number
}

// Egg media asset
export interface EggMedia {
  id: string
  url: string
  media_type: 'image' | 'video'
  alt_text: string
  is_primary: boolean
  order: number
  aspect_ratio: number
}

// Egg list item (lightweight for lists/grids)
export interface EggListItem {
  id: string
  name: string
  slug: string
  category_name: string
  breed: string
  egg_type: EggType
  size: EggSize
  packaging: EggPackaging
  eggs_per_unit: number
  quantity_available: number
  is_featured: boolean
  primary_image: EggMedia | null
  location: string
}

// Full egg detail
export interface Egg extends EggListItem {
  category: EggCategory
  media: EggMedia[]
  tags: Tag[]
  description: string
  is_available: boolean
  created_at: string
  updated_at: string
}

// Egg search filters
export interface EggSearchFilters {
  category?: string
  egg_type?: EggType
  size?: EggSize
  packaging?: EggPackaging
  is_featured?: boolean
  search?: string
  ordering?: string
}

