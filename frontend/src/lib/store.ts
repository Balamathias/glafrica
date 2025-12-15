import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchFilters, ViewMode } from './types'

// UI Store - handles sidebar, theme preferences, and general UI state
interface UIState {
  isSidebarCollapsed: boolean
  isMobileMenuOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      closeSidebar: () => set({ isSidebarCollapsed: true }),
      openSidebar: () => set({ isSidebarCollapsed: false }),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed }),
    }
  )
)

// Modal Store - handles livestock detail modal
interface ModalState {
  isDetailModalOpen: boolean
  selectedLivestockId: string | null
  openDetailModal: (id: string) => void
  closeDetailModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isDetailModalOpen: false,
  selectedLivestockId: null,
  openDetailModal: (id) => set({ isDetailModalOpen: true, selectedLivestockId: id }),
  closeDetailModal: () => set({ isDetailModalOpen: false, selectedLivestockId: null }),
}))

// Search/Filter Store - handles gallery filtering
interface FilterState {
  filters: SearchFilters
  viewMode: ViewMode
  setFilters: (filters: Partial<SearchFilters>) => void
  clearFilters: () => void
  setViewMode: (mode: ViewMode) => void
}

const defaultFilters: SearchFilters = {
  category: undefined,
  gender: undefined,
  is_sold: undefined,
  min_price: undefined,
  max_price: undefined,
  search: undefined,
  ordering: '-created_at',
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: defaultFilters,
  viewMode: 'grid',
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  clearFilters: () => set({ filters: defaultFilters }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))

// Chat Store - handles chat assistant state
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean // Indicates if this message is currently being streamed
}

interface ChatState {
  isOpen: boolean
  isExpanded: boolean
  messages: ChatMessage[]
  isTyping: boolean
  streamingMessageId: string | null // ID of the message currently being streamed
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  toggleExpanded: () => void
  addMessage: (role: 'user' | 'assistant', content: string, isStreaming?: boolean) => string // Returns message ID
  updateMessage: (id: string, content: string) => void
  appendToMessage: (id: string, chunk: string) => void
  finishStreaming: (id: string) => void
  setTyping: (typing: boolean) => void
  setStreamingMessageId: (id: string | null) => void
  clearMessages: () => void
  // Get conversation history for API calls (excludes welcome message)
  getHistory: () => { role: 'user' | 'assistant'; content: string }[]
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Welcome to Green Livestock Africa. I'm your AI assistant, here to help you discover premium livestock and guide your investment journey. How can I assist you today?",
  timestamp: new Date(),
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  isExpanded: false,
  messages: [welcomeMessage],
  isTyping: false,
  streamingMessageId: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

  addMessage: (role, content, isStreaming = false) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          role,
          content,
          timestamp: new Date(),
          isStreaming,
        },
      ],
      streamingMessageId: isStreaming ? id : state.streamingMessageId,
    }))
    return id
  },

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),

  appendToMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + chunk } : msg
      ),
    })),

  finishStreaming: (id) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: false } : msg
      ),
      streamingMessageId: null,
      isTyping: false,
    })),

  setTyping: (typing) => set({ isTyping: typing }),
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),
  clearMessages: () => set({ messages: [welcomeMessage], streamingMessageId: null }),

  getHistory: () => {
    const { messages } = get()
    // Exclude welcome message and return only role/content for API
    return messages
      .filter((msg) => msg.id !== 'welcome' && !msg.isStreaming)
      .map(({ role, content }) => ({ role, content }))
  },
}))
