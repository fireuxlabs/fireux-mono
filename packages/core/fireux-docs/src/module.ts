import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit'
import {
  ensureRuntimeLayerFromPath,
  exposeRuntimeAlias,
} from 'fireux-core/config/module/runtime-layer'

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-docs',
    configKey: 'fireuxDocs',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  async setup(options, nuxt) {
    if (options.enabled === false) return

    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    await installModule('@nuxt/content')

    ensureRuntimeLayerFromPath(nuxt, runtimeDir)
    exposeRuntimeAlias(nuxt, '#fireux-docs', runtimeDir)

    // Canonical docs content only.
    // Viewer routes stay in module space elsewhere.
  },
})
