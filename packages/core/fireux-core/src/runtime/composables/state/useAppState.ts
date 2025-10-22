// FILE: packages/core/fireux-core/src/runtime/composables/state/useAppState.ts
import { useState } from 'nuxt/app'

/**
 * Global reactive slot for the active app doc (or null while loading/not set).
 * Keep this shape minimal; store the raw Firestore payload the app uses.
 */
export type AppState<T = any> = T | null

export function useAppState<T = any>() {
  return {
    app: useState<AppState<T>>('app', () => null),
  }
}
