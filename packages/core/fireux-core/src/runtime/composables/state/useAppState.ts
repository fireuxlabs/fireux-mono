// FILE: packages/core/fireux-core/src/runtime/composables/state/useAppState.ts
import { useState } from 'nuxt/app'

export type AppState<T = any> = {
  data: T | null
  loading: boolean
}

export function useAppState<T = any>() {
  const app = useState<AppState<T>>('app', () => ({
    data: null,
    loading: true,
  }))

  return { app }
}