// Simple extension of core app functionality with kitchen support
import { computed } from 'vue'

export async function useMiseApp() {
  const coreApp = await useApp()
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
