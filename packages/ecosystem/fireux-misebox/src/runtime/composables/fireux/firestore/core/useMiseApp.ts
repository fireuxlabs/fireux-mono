import { useApp } from 'fireux-core/runtime/app/composables/useApp'

export function useMiseApp() {
  const coreApp = useApp()

  return {
    // All core functionality
    ...coreApp,
  }
}
