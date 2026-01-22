import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '1.0.0',
    configKey: 'fireuxJobs',
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    configureRuntime(nuxt, 'jobs', {
      enabled: true,
      placeCollections: ['places'],
      allowGoogle: true,
    })
    configurePlugins(resolver)
    configureComponents(resolver)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-jobs: module configured')
    })
  },
})

export default module
