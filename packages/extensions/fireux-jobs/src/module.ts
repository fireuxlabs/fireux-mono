import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { defaultFireuxJobsConfig } from './config/jobs.config'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'
import { exposeRuntimeAlias } from 'fireux-core/config/module/runtime-layer'

export interface ModuleOptions {
  prefix?: string
  workplaces?: string[]
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxJobs?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxJobs?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '0.1.0',
    configKey: 'fireuxJobs',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: { prefix: 'Fire' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')
    const workplaces = Array.isArray(options?.workplaces)
      ? options.workplaces
      : defaultFireuxJobsConfig.workplaces
    configureRuntime(nuxt, 'jobs', {
      enabled: true,
      workplaces,
    })
    configurePlugins(resolver)
    configureComposables(resolver)
    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    configureServer(resolver)

    exposeRuntimeAlias(nuxt, '#fireux-jobs', runtimeDir)
  },
})
