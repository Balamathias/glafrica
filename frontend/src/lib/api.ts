import axios, { AxiosError } from 'axios'
import type {
  Livestock,
  LivestockListItem,
  Category,
  CategoryWithPreview,
  PaginatedResponse,
  ChatResponse,
  SearchFilters,
  Egg,
  EggListItem,
  EggCategory,
  EggSearchFilters,
  SmartSearchResponse,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

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

  async getWithPreviews(): Promise<CategoryWithPreview[]> {
    try {
      const { data } = await api.get<CategoryWithPreview[]>('/categories/with-previews/')
      return data
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

// Chat message type for conversation history
export interface ChatHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

// SSE event types from the streaming endpoint
export interface StreamEvent {
  type: 'context' | 'chunk' | 'done' | 'error'
  content?: string
  count?: number
  message?: string
}

// Chat API
export const chatApi = {
  // Non-streaming endpoint (backwards compatible)
  async send(message: string, history: ChatHistoryMessage[] = []): Promise<ChatResponse> {
    try {
      const { data } = await api.post<ChatResponse>('/chat/send/', { message, history })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Streaming endpoint using Server-Sent Events
  async *stream(
    message: string,
    history: ChatHistoryMessage[] = []
  ): AsyncGenerator<StreamEvent, void, unknown> {
    const response = await fetch(`${API_URL}/chat/stream/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE events from the buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as StreamEvent
              yield data
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },
}

// Eggs API
export const eggsApi = {
  // Get paginated list of eggs
  async getList(page: number = 1, filters?: EggSearchFilters): Promise<PaginatedResponse<EggListItem>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())

      if (filters) {
        if (filters.category) params.append('category__slug', filters.category)
        if (filters.egg_type) params.append('egg_type', filters.egg_type)
        if (filters.size) params.append('size', filters.size)
        if (filters.packaging) params.append('packaging', filters.packaging)
        if (filters.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString())
        if (filters.search) params.append('search', filters.search)
        if (filters.ordering) params.append('ordering', filters.ordering)
      }

      const { data } = await api.get<PaginatedResponse<EggListItem>>(`/eggs/?${params}`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Get single egg by ID
  async getById(id: string): Promise<Egg> {
    try {
      const { data } = await api.get<Egg>(`/eggs/${id}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Get egg by slug
  async getBySlug(slug: string): Promise<Egg> {
    try {
      const { data } = await api.get<Egg>(`/eggs/${slug}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // AI-powered semantic search
  async searchAI(query: string): Promise<EggListItem[]> {
    try {
      const { data } = await api.post<EggListItem[]>('/eggs/search_ai/', { query })
      return data
    } catch (error) {
      handleApiError(error)
    }
  },

  // Get featured eggs
  async getFeatured(): Promise<EggListItem[]> {
    try {
      const { data } = await api.get<EggListItem[]>('/eggs/featured/')
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Egg Categories API
export const eggCategoriesApi = {
  async getAll(): Promise<EggCategory[]> {
    try {
      const { data } = await api.get<PaginatedResponse<EggCategory>>('/egg-categories/')
      return data.results
    } catch (error) {
      handleApiError(error)
    }
  },

  async getBySlug(slug: string): Promise<EggCategory> {
    try {
      const { data } = await api.get<EggCategory>(`/egg-categories/${slug}/`)
      return data
    } catch (error) {
      handleApiError(error)
    }
  },
}

// Smart Search API (unified search for both livestock and eggs)
export const searchApi = {
  /**
   * Unified AI-powered search that automatically detects query intent
   * and returns relevant livestock and/or eggs results.
   */
  async smartSearch(query: string): Promise<SmartSearchResponse> {
    try {
      const { data } = await api.post<SmartSearchResponse>('/search/', { query })
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
  eggs: eggsApi,
  eggCategories: eggCategoriesApi,
  search: searchApi,
}
