import { computed } from 'vue'
import { useFireUXConfig } from './FireUXConfig'
import { useFireuxBrandAssets } from './useFireuxBrandAssets'

function isCorePlaceholderPath(value: string | undefined) {
  return typeof value === 'string' && value.startsWith('/img/core/')
}

export function useTenantPlaceholderBranding() {
  const config = useFireUXConfig()
  const brandAssets = useFireuxBrandAssets()

  const isPlaceholderBranding = computed(() => {
    if (!config.isTenant) return false

    return (
      isCorePlaceholderPath(brandAssets.value.logo) ||
      isCorePlaceholderPath(brandAssets.value.wordmarkLight) ||
      isCorePlaceholderPath(brandAssets.value.wordmarkDark)
    )
  })

  return {
    isPlaceholderBranding,
  }
}
