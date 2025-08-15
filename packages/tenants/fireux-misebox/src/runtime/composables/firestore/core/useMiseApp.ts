// Simple extension of core app functionality with kitchen support
import { computed } from 'vue'

export async function useMiseApp() {
  const coreApp = await useApp()
  const { app, apps } = coreApp

  // Kitchen extension
  const kitchens = computed(() => app.value?.kitchens || [])

  return {
    // Core app functionality
    app,
    apps,

    // All other core functionality
    ...coreApp,

    // Kitchen extension
    kitchens,
  }
}
