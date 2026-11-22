import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import {
  registerComponentsDir,
  registerComposablesDirs,
} from 'fireux-core/config/module/module-helpers'
import { configurePageTransitions } from 'fireux-core/config/module/pages-config'
import { requireNativeRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export default defineNuxtModule({
  meta: { name: 'fireux-workspace' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    requireNativeRuntimeLayer(resolver, nuxt)
    const coreStyles = nuxt.options.css.indexOf(
      'fireux-core/runtime/assets/styles/main.css'
    )
    if (coreStyles >= 0) {
      nuxt.options.css[coreStyles] = resolver.resolve(
        './runtime/assets/styles/workspace.css'
      )
    }
    registerComponentsDir(resolver, './runtime/workspace/components', {
      prefix: 'Workspace',
    })
    registerComposablesDirs(resolver, ['./runtime/workspace/composables'])
    addServerHandler({
      route: '/workspace.webmanifest',
      method: 'get',
      handler: resolver.resolve('./runtime/server/manifest.get'),
    })
    // Availability must run before session auth, regardless of layer order.
    nuxt.hook('app:resolve', (app) => {
      const workspace = app.middleware.findIndex(
        ({ name }) => name === 'fireux-workspace-global'
      )
      const auth = app.middleware.findIndex(
        ({ name }) => name === 'fireux-auth-global'
      )
      if (auth >= 0 && workspace > auth) {
        const [guard] = app.middleware.splice(workspace, 1)
        app.middleware.splice(auth, 0, guard)
      }
    })
    configurePageTransitions(nuxt, 'workspace')
  },
})
