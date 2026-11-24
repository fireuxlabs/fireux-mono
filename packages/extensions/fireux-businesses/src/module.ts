import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { registerComposablesDirs } from 'fireux-core/config/module/module-helpers'
import type { FireuxSeoExtendContext } from 'fireux-core/config/app/seo-config'
import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { configureComponents } from './config/module/components-config.ts'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import { configureServer } from './config/module/server-config.ts'

export interface ModuleOptions {
  prefix?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxBusinesses?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxBusinesses?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-businesses',
    version: '2.0.0',
    configKey: 'fireuxBusinesses',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('fireux:seo:extend' as any, (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/businesses')
      ctx.addStaticPath('/businesses/learn-more')
    })

    configureRuntimeDefaults(
      nuxt,
      'businesses',
      { enabled: true },
      { merge: true }
    )
    registerComposablesDirs(resolver, ['./runtime/business/composables'])
    configureComponents(resolver)
    requireNativeRuntimeLayer(resolver, nuxt)
    configureServer(resolver)
  },
})
