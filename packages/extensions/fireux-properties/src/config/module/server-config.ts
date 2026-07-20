// Concurrent edit — 2026-07-20 22:39 CEST — Property public projection: register the bounded public Property index route.
import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/properties',
    method: 'get',
    handler: './runtime/server/api/properties/index.get',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
