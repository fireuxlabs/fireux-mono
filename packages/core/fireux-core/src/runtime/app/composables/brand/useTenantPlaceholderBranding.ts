import { computed } from 'vue'
import { useFireUXConfig } from '../config/FireUXConfig'
import { useAssets } from './useAssets'

function isCorePlaceholderPath(value: string | undefined) {
  return typeof value === 'string' && value.startsWith('/img/core/')
}

export function useTenantPlaceholderBranding() {
  const config = useFireUXConfig()
  const brandAssets = useAssets()

  const isPlaceholderBranding = computed(() => {
    if (!config.isTenant) return false

    return (
      isCorePlaceholderPath(brandAssets.logo) ||
      isCorePlaceholderPath(brandAssets.wordmarkLight) ||
      isCorePlaceholderPath(brandAssets.wordmarkDark)
    )
  })

  return {
    isPlaceholderBranding,
  }
}
