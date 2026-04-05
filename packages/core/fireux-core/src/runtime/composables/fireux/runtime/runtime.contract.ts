import type { ComputedRef, Ref } from 'vue'
import type { RuntimeActivity, RuntimeMode } from './runtime.types'

/**
 * FireUX Runtime Contract (Console v1)
 * - No wrapper logic here, just a shared return-shape that all useRuntimeX() must satisfy.
 */

export type RuntimeDoc<T> = ComputedRef<T | null>

export type RuntimeDocs<TPublic, TPrivate = never> = {
  // Always present
  doc: RuntimeDoc<
    TPublic | (TPrivate extends never ? never : TPublic & Partial<TPrivate>) | TPrivate
  >

  // Optional overlays (only for entities that implement them)
  publicDoc?: RuntimeDoc<TPublic>
  privateDoc?: RuntimeDoc<TPrivate>
}

export type RuntimeData = {
  isLoading: ComputedRef<boolean>
  isReady: ComputedRef<boolean>
  // optional: entity-specific labels live here (name, shortName, etc.)
  [key: string]: unknown
}

export type RuntimeEntity<TPublic, TPrivate = never> = {
  id: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  activity: ComputedRef<RuntimeActivity>
  isDemo: ComputedRef<boolean>
  collectionPath: ComputedRef<string>

  pending: Ref<boolean> | ComputedRef<boolean>

  data: RuntimeData
} & RuntimeDocs<TPublic, TPrivate>
