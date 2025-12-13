import axios, { AxiosError } from 'axios'
import type {
  Livestock,
  LivestockListItem,
  Category,
  PaginatedResponse,
  ChatResponse,
  SearchFilters,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Create axios instance with defaults
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error handler
function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    throw new Error(message)
  }
  throw error
}

// Livestock API
export const livestockApi = {
  // Get paginated list of livestock
  async getList(page: number = 1, filters?: SearchFilters): Promise<PaginatedResponse<LivestockListItem>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.category) params.append('category__name', filters.category)
        if (filters.gender) params.append('gender', filters.gender)
        if (filters.is_sold !== undefined) params.append('is_sold', filters.is_sold.toString())
        if (filters.search) params.append('search', filters.search)
        if (filters.ordering) params.append('ordering', filters.ordering)
        if (filters.min_price) params.append('price__gte', filters.min_price.toString())
        if (filters.max_price) params.append('price__lte', filters.max_price.toString())
      }

      const { data } = await api.get<PaginatedResponse<LivestockListItem>>(`/livestock/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Get single livestock by ID
  async getById(id: string): Promise<Livestock> {
    try {
      const { data } = await api.get<Livestock>(`/livestock/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // AI-powered semantic search
  async searchAI(query: string): Promise<LivestockListItem[]> {
    try {
      const { data } = await api.post<LivestockListItem[]>('/livestock/search-ai/', { query })
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
      const { data } = await api.get<PaginatedResponse<Category>>('/categories/')
      return data.results
    } catch (error) {
      handleApiError(error)
    }
  },

  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await this.getAll()
      return categories.find((c) => c.slug === slug) || null
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Chat API
export const chatApi = {
  async send(message: string): Promise<ChatResponse> {
    try {
      const { data } = await api.post<ChatResponse>('/chat/send/', { message })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Export default API object
export default {
  livestock: livestockApi,
  categories: categoriesApi,
  chat: chatApi,
}
