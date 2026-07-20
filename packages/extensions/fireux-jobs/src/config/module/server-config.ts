// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: register bounded Agent and Professional routes.
// Concurrent edit — 2026-07-20 17:44 CEST — Repo Efficiency Pass 2 of 6: register trusted Jobs profile provisioners.
import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/internal/profiles/agent',
    method: 'post',
    handler: './runtime/server/api/internal/profiles/agent.post',
  },
  {
    route: '/api/internal/profiles/professional',
    method: 'post',
    handler: './runtime/server/api/internal/profiles/professional.post',
  },
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
