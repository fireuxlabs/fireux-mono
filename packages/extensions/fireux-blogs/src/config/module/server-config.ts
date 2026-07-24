import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/public/blogs',
    method: 'get',
    handler: './runtime/server/api/public/blogs.get',
  },
  {
    route: '/api/public/blogs/:slug',
    method: 'get',
    handler: './runtime/server/api/public/blogs/[slug].get',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
