import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'

export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = {
    enabled: true,
    defaultKitchenId: '',
    ensureTestKitchen: true,
  }
) {
  configureRuntimeDefaults(nuxt, key, defaults, { merge: true })

  const runtimeConfig = (nuxt.options.runtimeConfig ||= {}) as Record<
    string,
    unknown
  >
  const publicRuntimeConfig = (runtimeConfig.public ||= {}) as Record<
    string,
    unknown
  >
  runtimeConfig.supplierDirectoryBaseUrl ||=
    nuxt.options.dev === true ? 'http://localhost:3006' : 'https://bringli.app'
  publicRuntimeConfig.googleMapsApiKey ||=
    process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  publicRuntimeConfig.googleMapsMapId ||=
    process.env.NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID || ''
}
