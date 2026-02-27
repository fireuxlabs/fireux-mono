import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'

export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = {
    enabled: true,
    maxUploadBytes: 26214400,
  }
) {
  configureRuntimeDefaults(nuxt, key, defaults, { merge: true })
}
