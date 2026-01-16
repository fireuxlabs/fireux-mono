import {
    addComponentsDir,
    addImportsDir,
    createResolver,
    defineNuxtModule,
} from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import {
    ensureRuntimeConfigBuckets,
    ensureRuntimeLayer,
    exposeRuntimeAlias,
} from 'fireux-core/config/nuxt/nuxt-runtime-layer'
import { configureComposables } from './config/composables-config'
import { configureRuntime } from './config/runtime-config'

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
    configureComposables(resolver)

    addImportsDir(resolver.resolve('./runtime/composables'))

    addComponentsDir({
      path: resolver.resolve('./runtime/components/organisms/entities/Company'),
      global: true,
      pathPrefix: true,
      prefix: 'Company',
    })

    exposeRuntimeAlias(nuxt, '#fireux-companies', runtimeDir)
    registerCompanyPages(nuxt, resolver, runtimeDir)

    nuxt.hook('ready', () => {
      console.log('fireux-companies: module configured')
    })
  },
})

export default module

function registerCompanyPages(nuxt: Nuxt, resolver: any, runtimeDir: string) {
  ensureRuntimeLayer(nuxt, runtimeDir)

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
  ]

  nuxt.hook('pages:extend', (pages: any[]) => {
    for (const entry of pagesToInject) {
      const exists = pages.some((page) => page.path === entry.path)
      if (!exists) pages.push(entry)
    }
  })
}
