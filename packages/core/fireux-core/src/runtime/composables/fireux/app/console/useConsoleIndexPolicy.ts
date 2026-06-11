import { computed } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'

type UseConsoleIndexPolicyOptions = {
  family: string
}

/**
 * Console index policy.
 *
 * Tenant apps enter a console for this app only: live targets are app-bound and
 * demo/test targets stay hidden. Global/control apps may expose demo and dev
 * test targets because they are broader inspection surfaces.
 */
export function useConsoleIndexPolicy(options: UseConsoleIndexPolicyOptions) {
  const config = useFireUXConfig()
  const isTenant = computed(() => config.isTenant)

  return computed(() => ({
    family: options.family,
    showLive: true,
    showDemo: !isTenant.value,
    showTest: !isTenant.value && config.devMode,
    appBound: isTenant.value,
    autoSelectSingleLive: isTenant.value,
  }))
}
