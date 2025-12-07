import { useRuntimeConfig } from '#imports'

/**
 * Returns true if the ecosystem controller module is present (i.e., this runtime includes the module).
 * Header code can import this composable from the module alias to toggle nav.
 */
export function useAppsFeatureEnabled() {
  const modules = useRuntimeConfig().public?.modules || []
  return Array.isArray(modules) && modules.includes('fireux-ecosystem-controller')
}
