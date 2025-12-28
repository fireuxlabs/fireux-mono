import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configureComposables } from './config/composables-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-companies',
    version: '0.1.0',
    configKey: 'fireuxCompanies',
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureRuntime(nuxt, 'companies')
    configureComposables(resolver)

    nuxt.hook('ready', () => {
      console.log('fireux-companies: module configured')
    })
  },
})

export default module
