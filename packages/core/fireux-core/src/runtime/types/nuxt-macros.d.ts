import type { Ref } from 'vue'

interface FireUXUseFetchResponse<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<unknown>
  refresh: () => Promise<void>
}

declare module 'nuxt/app' {
  export function definePageMeta(meta: Record<string, any>): void
  export function useHead(input: Record<string, any>): void
  export function useFetch<T = unknown>(
    request: string,
    options?: Record<string, any>
  ): Promise<FireUXUseFetchResponse<T>>
}
