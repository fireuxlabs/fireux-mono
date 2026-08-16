import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const handlers = [
  {
    route: '/api/console/kitchen/menus/ai',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/menus/ai.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, handlers)
}
