import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import { configureRuntime } from './config/module/runtime-config.ts'
import { configureComponents } from './config/module/components-config.ts'
import type { FireuxAiMode, FireuxAiProvider } from './runtime/types/ai.ts'

export interface ModuleOptions {
  /** Controls AI execution; static App research remains available. */
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

    configureRuntime(nuxt, options)
    registerComposablesDir(resolver)
    configureComponents(resolver)
    requireNativeRuntimeLayer(resolver, nuxt)
  },
})
