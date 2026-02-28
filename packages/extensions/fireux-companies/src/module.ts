import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import type { FireuxSeoExtendContext } from 'fireux-core/config/app/seo'
import { configureRuntime } from './config/module/runtime-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureComposables } from './config/module/composables-config'
import { configureComponents } from './config/module/components-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxCompanies?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxCompanies?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-companies',
    version: '2.0.0',
    configKey: 'fireuxCompanies',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('fireux:seo:extend', (ctx: FireuxSeoExtendContext) => {
      ctx.addHub('/companies')
      ctx.addStaticPath('/companies/learn-more')
    })

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => configureRuntime(nuxt, 'companies'),
      plugins: configurePlugins,
      composables: configureComposables,
      components: configureComponents,
      layouts: configureLayouts,
      models: configureModels,
      pages: configurePages,
      server: configureServer,
    })
  },
})
