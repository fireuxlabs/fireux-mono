import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  { route: '/api/workspace/portfolio/tasks', method: 'post', handler: './runtime/server/api/workspace/portfolio/tasks/index.post' },
  { route: '/api/workspace/portfolio/tasks', method: 'patch', handler: './runtime/server/api/workspace/portfolio/tasks/index.patch' },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
