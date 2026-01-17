import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import {
    ensureRuntimeConfigBuckets,
    ensureRuntimeLayerFromPath,
    exposeRuntimeAlias,
} from 'fireux-core/config/module/runtime-layer'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-companies',
    version: '2.0.0',
    configKey: 'fireuxCompanies',
  },
  defaults: { prefix: 'Fire' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    ensureRuntimeConfigBuckets(nuxt, 'companies')
    configureRuntime(nuxt, 'companies')
    configurePlugins(resolver)
    configureComposables(resolver)

    addImportsDir(resolver.resolve('./runtime/composables'))

    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureServer(resolver)

    exposeRuntimeAlias(nuxt, '#fireux-companies', runtimeDir)
    registerCompanyPages(nuxt, resolver, runtimeDir)

    nuxt.hook('ready', () => {
      console.log('fireux-companies: module configured')
    })
  },
})

export default module

function registerCompanyPages(nuxt: Nuxt, resolver: any, runtimeDir: string) {
  ensureRuntimeLayerFromPath(nuxt, runtimeDir)

  const pagesToInject = [
    {
      name: 'fireux-companies-index',
      path: '/companies',
      file: resolver.resolve('./runtime/pages/companies/index.vue'),
    },
    {
      name: 'fireux-companies-create',
      path: '/companies/create',
      file: resolver.resolve('./runtime/pages/companies/create.vue'),
    },
    {
      name: 'fireux-companies-edit',
      path: '/companies/edit/:id',
      file: resolver.resolve('./runtime/pages/companies/edit/[id].vue'),
    },
    {
      name: 'fireux-companies-learn-more',
      path: '/companies/learn-more',
      file: resolver.resolve('./runtime/pages/companies/learn-more.vue'),
    },
    {
      name: 'fireux-companies-id',
      path: '/companies/:id',
      file: resolver.resolve('./runtime/pages/companies/[id].vue'),
    },
    {
      name: 'dev-fireux-companies',
      path: '/dev/fireux-companies',
      file: resolver.resolve('./runtime/pages/dev/fireux-companies.vue'),
    },
  ]

  nuxt.hook('pages:extend', (pages: any[]) => {
    for (const entry of pagesToInject) {
      const exists = pages.some((page) => page.path === entry.path)
      if (!exists) pages.push(entry)
    }
  })
}
