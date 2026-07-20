// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: register bounded Agent and Professional routes.
import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/public/agents',
    method: 'get',
    handler: './runtime/server/api/public/agents.get',
  },
  {
    route: '/api/public/agents/:id',
    method: 'get',
    handler: './runtime/server/api/public/agents/[id].get',
  },
  {
    route: '/api/public/professionals',
    method: 'get',
    handler: './runtime/server/api/public/professionals.get',
  },
  {
    route: '/api/public/professionals/:id',
    method: 'get',
    handler: './runtime/server/api/public/professionals/[id].get',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
