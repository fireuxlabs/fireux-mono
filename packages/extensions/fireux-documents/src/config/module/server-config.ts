import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  { route: '/api/workspace/portfolio/documents/upload', method: 'post', handler: './runtime/server/api/workspace/portfolio/documents/upload.post' },
  { route: '/api/workspace/portfolio/documents/links', method: 'post', handler: './runtime/server/api/workspace/portfolio/documents/links.post' },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
