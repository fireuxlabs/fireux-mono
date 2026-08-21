import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/blogs',
    method: 'get',
    handler: './runtime/server/api/blogs/index.get',
  },
  {
    route: '/api/blogs/:slug',
    method: 'get',
    handler: './runtime/server/api/blogs/[slug].get',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
