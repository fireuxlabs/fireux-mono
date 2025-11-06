import { computed } from 'vue'
import type { Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppComputed(app: Ref<App | null | undefined>) {
  // Initialized = has at least one admin
  const isInitialized = computed(() => Boolean(app.value?.admin_ids?.length))
  return { isInitialized }
}