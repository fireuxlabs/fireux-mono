import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  registerComponentsDir,
  registerComposablesDirs,
} from 'fireux-core/config/module/module-helpers'

export default defineNuxtModule({
  meta: { name: 'fireux-workspace' },
  setup() {
    // Until the runtime cutover, register the existing implementation in place.
    const require = createRequire(import.meta.url)
    const runtime = createResolver(
      dirname(require.resolve('fireux-core/package.json'))
    )
    registerComponentsDir(runtime, './src/runtime/workspace/components', {
      prefix: 'Workspace',
    })
    registerComposablesDirs(runtime, ['./src/runtime/workspace/composables'])
  },
})
