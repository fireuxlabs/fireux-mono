import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  { route: '/api/internal/blogs', method: 'post', handler: './runtime/server/api/internal/blogs/index.post' },
  { route: '/api/internal/blogs/:slug', method: 'patch', handler: './runtime/server/api/internal/blogs/[slug].patch' },
  { route: '/api/internal/blogs/:slug/publish', method: 'post', handler: './runtime/server/api/internal/blogs/[slug]/publish.post' },
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
