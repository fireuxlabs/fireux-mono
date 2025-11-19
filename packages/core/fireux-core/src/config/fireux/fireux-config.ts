import type { NuxtConfig } from 'nuxt/schema'
import { resolveFireuxNuxtSetup } from './tenant-context'
import type { TenantConfig } from './tenant-config'

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const setup = resolveFireuxNuxtSetup(opts)

  return {
    srcDir: 'app',
    imports: { dirs: ['composables/**', 'utils/**'] },
    modules: setup.modules,
    app: { head: { title: setup.appName } },
    runtimeConfig: setup.runtimeConfig,
    compatibilityDate: setup.compatibilityDate,
    vite: setup.vite,
    nitro: setup.nitro,
  }
}
