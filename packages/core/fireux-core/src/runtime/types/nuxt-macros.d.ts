import type { Ref } from 'vue'
import type { PageMeta } from 'nuxt/dist/pages/runtime/composables'

interface FireUXToastMessage {
  id?: string
  title?: string
  description?: string
  icon?: string
  color?: string
  timeout?: number
  [key: string]: unknown
}

interface FireUXToastApi {
  add: (toast: FireUXToastMessage) => void
  remove?: (id: string) => void
  success?: (message: string, options?: Record<string, unknown>) => void
  error?: (message: string, options?: Record<string, unknown>) => void
  [key: string]: unknown
}

interface FireUXUseFetchResponse<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<unknown>
  refresh: () => Promise<void>
}

declare module 'nuxt/app' {
  export function definePageMeta(meta: PageMeta): void
  export function useHead(input: Record<string, any>): void
  export function useFetch<T = unknown>(
    request: string,
    options?: Record<string, any>
  ): Promise<FireUXUseFetchResponse<T>>
  export function useToast(): FireUXToastApi
}

declare global {
  // Provided by the Nuxt injections used across FireUX runtime
  // Allows optional access without requiring direct imports in every file.
  const definePageMeta: (meta: PageMeta) => void
  var useToast: undefined | (() => FireUXToastApi)
}

export {}
