import { computed } from 'vue'
import { useFireUXConfig } from './FireUXConfig'
import { resolveFireuxBrandAssets } from '../../../../utils/brandAssets'

export function useFireuxBrandAssets() {
  const config = useFireUXConfig()

  return computed(() =>
    resolveFireuxBrandAssets({
      role: config.role,
      appLogo: config.appLogo,
      appLogoLight: config.appLogoLight,
      appLogoDark: config.appLogoDark,
      appThumbnail: config.appThumbnail,
    })
  )
}
