import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const handlers = [
  {
    route: '/api/workspace/kitchen/agent',
    method: 'post',
    handler: './runtime/server/api/workspace/kitchen/agent.post',
  },
  {
    route: '/api/workspace/kitchen/menus/ai',
    method: 'post',
    handler: './runtime/server/api/workspace/kitchen/menus/ai.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, handlers)
}
