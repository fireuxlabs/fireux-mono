import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'
import { exposeRuntimeAlias } from 'fireux-core/config/module/runtime-layer'
import { createResolver, defineNuxtModule } from '@nuxt/kit'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    /** @deprecated Use `fireuxDrop` */
    drop?: Partial<typeof defaults>
    fireuxDrop?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    /** @deprecated Use `fireuxDrop` */
    drop?: Partial<typeof defaults>
    fireuxDrop?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-drop',
    version: '0.1.0',
    configKey: 'fireuxDrop',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    configureRuntimeDefaults(nuxt, 'drop', { enabled: true }, { merge: true })

    exposeRuntimeAlias(nuxt as any, '#fireux-drop', runtimeDir)
  },
})
