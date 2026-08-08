import { useApp } from 'fireux-core/runtime/composables/fireux/app/useApp'

export function useMiseApp() {
  const coreApp = useApp()

  return {
    // All core functionality
    ...coreApp,
  }
}
