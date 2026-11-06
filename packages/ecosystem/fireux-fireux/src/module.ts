import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'

const module = defineNuxtModule({
  meta: { name: 'fireux-fireux', version: '0.1.0', configKey: 'fireuxFireux' },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const fireux = nuxt.options.runtimeConfig.public?.fireux
    if (fireux?.workspaces?.includes('project')) {
      await installModule('fireux-projects')
      if (!fireux.modules?.includes('fireux-projects'))
        fireux.modules = [...(fireux.modules || []), 'fireux-projects']
    }
    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
    })
  },
})

export default module
