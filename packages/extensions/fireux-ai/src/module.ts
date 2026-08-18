import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import { configurePages } from './config/module/pages-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'
import { configureComponents } from './config/module/components-config'
import type { FireuxAiMode, FireuxAiProvider } from './runtime/types/ai'

export interface ModuleOptions {
  enabled?: boolean
  provider?: FireuxAiProvider
  model?: string
  mode?: FireuxAiMode
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxAi?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxAi?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-ai',
    version: '0.1.0',
    configKey: 'fireuxAi',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    enabled: false,
    provider: 'openai',
    model: 'gpt-4o-mini',
    mode: 'disabled',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureFireuxModule(resolver, nuxt, {
      runtime: (nuxt) => configureRuntime(nuxt, options),
      components: configureComponents,
      pages: configurePages,
      server: configureServer,
    })
  },
})
