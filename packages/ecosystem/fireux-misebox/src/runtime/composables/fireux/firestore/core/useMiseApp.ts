import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp.ts'

export function useMiseApp() {
  const coreApp = useApp()

  return {
    // All core functionality
    ...coreApp,
  }
}
