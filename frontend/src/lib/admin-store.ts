import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Admin User type
export interface AdminUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_superuser: boolean
  role: 'superadmin' | 'admin' | 'staff' | 'viewer'
  avatar: string | null
}

// Auth Store - handles admin authentication
interface AuthState {
  user: AdminUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setAuth: (user: AdminUser, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<AdminUser>) => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Admin UI Store - handles admin sidebar and UI state
interface AdminUIState {
  // Sidebar
  isSidebarExpanded: boolean
  isMobileDrawerOpen: boolean

  // Command Palette
  isCommandPaletteOpen: boolean

  // Quick Create Modals
  isCreateLivestockModalOpen: boolean
  isCreateCategoryModalOpen: boolean
  isCreateTagModalOpen: boolean

  // Actions
  toggleSidebar: () => void
  expandSidebar: () => void
  collapseSidebar: () => void
  openMobileDrawer: () => void
  closeMobileDrawer: () => void
  toggleMobileDrawer: () => void
  toggleCommandPalette: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  // Quick Create Modal Actions
  openCreateLivestockModal: () => void
  closeCreateLivestockModal: () => void
  openCreateCategoryModal: () => void
  closeCreateCategoryModal: () => void
  openCreateTagModal: () => void
  closeCreateTagModal: () => void
}

export const useAdminUIStore = create<AdminUIState>()(
  persist(
    (set) => ({
      isSidebarExpanded: false,
      isMobileDrawerOpen: false,
      isCommandPaletteOpen: false,
      isCreateLivestockModalOpen: false,
      isCreateCategoryModalOpen: false,
      isCreateTagModalOpen: false,

      toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      expandSidebar: () => set({ isSidebarExpanded: true }),
      collapseSidebar: () => set({ isSidebarExpanded: false }),
      openMobileDrawer: () => set({ isMobileDrawerOpen: true }),
      closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),
      toggleMobileDrawer: () => set((state) => ({
        isMobileDrawerOpen: !state.isMobileDrawerOpen
      })),
      toggleCommandPalette: () => set((state) => ({
        isCommandPaletteOpen: !state.isCommandPaletteOpen
      })),
      openCommandPalette: () => set({ isCommandPaletteOpen: true }),
      closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
      // Quick Create Modals
      openCreateLivestockModal: () => set({ isCreateLivestockModalOpen: true }),
      closeCreateLivestockModal: () => set({ isCreateLivestockModalOpen: false }),
      openCreateCategoryModal: () => set({ isCreateCategoryModalOpen: true }),
      closeCreateCategoryModal: () => set({ isCreateCategoryModalOpen: false }),
      openCreateTagModal: () => set({ isCreateTagModalOpen: true }),
      closeCreateTagModal: () => set({ isCreateTagModalOpen: false }),
    }),
    {
      name: 'admin-ui',
      partialize: (state) => ({
        isSidebarExpanded: state.isSidebarExpanded,
      }),
    }
  )
)

// Admin Selection Store - handles bulk selection
interface SelectionState {
  selectedIds: string[]
  selectItem: (id: string) => void
  deselectItem: (id: string) => void
  toggleItem: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: [],
  selectItem: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds
      : [...state.selectedIds, id]
  })),
  deselectItem: (id) => set((state) => ({
    selectedIds: state.selectedIds.filter((i) => i !== id)
  })),
  toggleItem: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((i) => i !== id)
      : [...state.selectedIds, id]
  })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  isSelected: (id) => get().selectedIds.includes(id),
}))
