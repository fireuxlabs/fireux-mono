import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { defaultFireuxJobsConfig } from './config/jobs.config'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'

export interface ModuleOptions {
  prefix?: string
  workplaces?: string[]
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '1.0.0',
    configKey: 'fireuxJobs',
  },
  defaults: { prefix: 'Fire' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const workplaces = Array.isArray(options?.workplaces)
      ? options.workplaces
      : defaultFireuxJobsConfig.workplaces
    configureRuntime(nuxt, 'jobs', {
      enabled: true,
      workplaces,
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
