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
}
