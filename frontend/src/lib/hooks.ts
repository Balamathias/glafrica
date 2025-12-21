import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { livestockApi, categoriesApi, chatApi, eggsApi, eggCategoriesApi, searchApi } from "./api"
import type { SearchFilters, Livestock, LivestockListItem, Category, PaginatedResponse, EggSearchFilters, Egg, EggListItem, EggCategory, FreshnessStatus, SmartSearchResponse } from "./types"

// Query Keys factory for consistent cache management
export const queryKeys = {
  all: ["livestock"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters?: SearchFilters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  search: (query: string) => [...queryKeys.all, "search", query] as const,
  categories: ["categories"] as const,
}

// Egg Query Keys
export const eggQueryKeys = {
  all: ["eggs"] as const,
  lists: () => [...eggQueryKeys.all, "list"] as const,
  list: (filters?: EggSearchFilters) => [...eggQueryKeys.lists(), filters] as const,
  details: () => [...eggQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...eggQueryKeys.details(), id] as const,
  search: (query: string) => [...eggQueryKeys.all, "search", query] as const,
  freshness: (status: FreshnessStatus) => [...eggQueryKeys.all, "freshness", status] as const,
  featured: () => [...eggQueryKeys.all, "featured"] as const,
  categories: ["egg-categories"] as const,
}

// Infinite query for gallery with pagination
export function useLivestockInfinite(filters?: SearchFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return livestockApi.getList(pageParam, filters)
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      // Extract page number from next URL
      const url = new URL(lastPage.next)
      const page = url.searchParams.get("page")
      return page ? parseInt(page) : undefined
    },
    initialPageParam: 1,
  })
}

// Single livestock query
export function useLivestock(id: string | null) {
  return useQuery({
    queryKey: queryKeys.detail(id || ""),
    queryFn: () => livestockApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - details change less frequently
  })
}

// AI Search query
export function useLivestockSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => livestockApi.searchAI(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Categories query
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
  })
}

// Categories with previews query (for homepage showcase)
export function useCategoriesWithPreviews() {
  return useQuery({
    queryKey: [...queryKeys.categories, "with-previews"],
    queryFn: categoriesApi.getWithPreviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Chat mutation (non-streaming, for backwards compatibility)
export function useChatSend() {
  return useMutation({
    mutationFn: ({ message, history = [] }: { message: string; history?: { role: 'user' | 'assistant'; content: string }[] }) =>
      chatApi.send(message, history),
  })
}

// Prefetch helpers for SSR/SSG
export async function prefetchLivestock(queryClient: any, id: string) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => livestockApi.getById(id),
  })
}

export async function prefetchLivestockList(queryClient: any, filters?: SearchFilters) {
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.list(filters),
    queryFn: () => livestockApi.getList(1, filters),
    initialPageParam: 1,
  })
}

// ============================================
// EGG HOOKS
// ============================================

// Infinite query for eggs gallery with pagination
export function useEggsInfinite(filters?: EggSearchFilters) {
  return useInfiniteQuery({
    queryKey: eggQueryKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      return eggsApi.getList(pageParam, filters)
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      // Extract page number from next URL
      const url = new URL(lastPage.next)
      const page = url.searchParams.get("page")
      return page ? parseInt(page) : undefined
    },
    initialPageParam: 1,
  })
}

// Single egg query
export function useEgg(id: string | null) {
  return useQuery({
    queryKey: eggQueryKeys.detail(id || ""),
    queryFn: () => eggsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Egg by slug query
export function useEggBySlug(slug: string | null) {
  return useQuery({
    queryKey: eggQueryKeys.detail(slug || ""),
    queryFn: () => eggsApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// AI Search for eggs
export function useEggSearch(query: string) {
  return useQuery({
    queryKey: eggQueryKeys.search(query),
    queryFn: () => eggsApi.searchAI(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Eggs by freshness status
export function useEggsByFreshness(status: FreshnessStatus) {
  return useQuery({
    queryKey: eggQueryKeys.freshness(status),
    queryFn: () => eggsApi.getByFreshness(status),
    staleTime: 2 * 60 * 1000, // 2 minutes - freshness can change
  })
}

// Featured eggs query
export function useFeaturedEggs() {
  return useQuery({
    queryKey: eggQueryKeys.featured(),
    queryFn: eggsApi.getFeatured,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Egg Categories query
export function useEggCategories() {
  return useQuery({
    queryKey: eggQueryKeys.categories,
    queryFn: eggCategoriesApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
  })
}

// Egg Category by slug
export function useEggCategory(slug: string | null) {
  return useQuery({
    queryKey: [...eggQueryKeys.categories, slug],
    queryFn: () => eggCategoriesApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Prefetch helpers for SSR/SSG
export async function prefetchEgg(queryClient: any, id: string) {
  await queryClient.prefetchQuery({
    queryKey: eggQueryKeys.detail(id),
    queryFn: () => eggsApi.getById(id),
  })
}

export async function prefetchEggList(queryClient: any, filters?: EggSearchFilters) {
  await queryClient.prefetchInfiniteQuery({
    queryKey: eggQueryKeys.list(filters),
    queryFn: () => eggsApi.getList(1, filters),
    initialPageParam: 1,
  })
}

export async function prefetchEggCategories(queryClient: any) {
  await queryClient.prefetchQuery({
    queryKey: eggQueryKeys.categories,
    queryFn: eggCategoriesApi.getAll,
  })
}

// ============================================
// SMART SEARCH HOOKS (Unified Livestock + Eggs)
// ============================================

export const smartSearchKeys = {
  all: ["smart-search"] as const,
  search: (query: string) => [...smartSearchKeys.all, query] as const,
}

/**
 * Unified smart search hook that automatically detects query intent
 * and returns relevant livestock and/or eggs results.
 */
export function useSmartSearch(query: string) {
  return useQuery({
    queryKey: smartSearchKeys.search(query),
    queryFn: () => searchApi.smartSearch(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
