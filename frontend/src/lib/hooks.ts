import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { livestockApi, categoriesApi, chatApi } from "./api"
import type { SearchFilters, Livestock, LivestockListItem, Category, PaginatedResponse } from "./types"

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
