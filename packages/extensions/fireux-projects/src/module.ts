import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxModule } from 'fireux-core/config/module/module-wiring'
import {
  registerComposablesDirs,
  registerServerHandlers,
} from 'fireux-core/config/module/module-helpers'
import { configureComponents } from './config/module/components-config'
import { configureModulePages } from './config/module/pages-config'

const module = defineNuxtModule({
  meta: {
    name: 'fireux-projects',
    version: '0.1.0',
    configKey: 'fireuxProjects',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const selected =
      nuxt.options.runtimeConfig.public?.fireux?.workspaces?.includes(
        'project'
      ) === true
    configureFireuxModule(resolver, nuxt, {
      pages: configureModulePages,
      ...(selected
        ? {
            components: configureComponents,
            composables: (resolver) =>
              registerComposablesDirs(resolver, [
                './runtime/project/composables',
              ]),
            server: (resolver) =>
              registerServerHandlers(resolver, [
                {
                  route: '/api/workspace/project/tests/intent',
                  method: 'post',
                  handler: './runtime/project/server/http/test-intent.post',
                },
                {
                  route: '/api/workspace/project/intent',
                  method: 'post',
                  handler: './runtime/project/server/http/intent.post',
                },
              ]),
          }
        : {}),
    })
  },
})

export default module
