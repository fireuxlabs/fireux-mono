// Simple extension of core app functionality with kitchen support
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp.ts'

export function useMiseApp() {
  const coreApp = useApp()
  const { app } = coreApp

  // Kitchen extension - assuming kitchens might be added to app data later
  const kitchens = computed(() => (app.value as any)?.kitchens || [])

  return {
    // All core functionality
    ...coreApp,

    // Kitchen extension
    kitchens,
  }
}
