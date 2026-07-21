// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: register bounded Agent and Professional routes.
// Concurrent edit — 2026-07-20 17:44 CEST — Repo Efficiency Pass 2 of 6: register trusted Jobs profile provisioners.
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: register bounded Job index and exact detail routes.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: register fixed-scope author lifecycle and structured Professional mutation routes.
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
    route: '/api/internal/profiles/professional/structured',
    method: 'patch',
    handler:
      './runtime/server/api/internal/profiles/professional/structured.patch',
  },
  {
    route: '/api/internal/jobs',
    method: 'get',
    handler: './runtime/server/api/internal/jobs.get',
  },
  {
    route: '/api/internal/jobs',
    method: 'post',
    handler: './runtime/server/api/internal/jobs.post',
  },
  {
    route: '/api/internal/jobs/:id',
    method: 'get',
    handler: './runtime/server/api/internal/jobs/[id].get',
  },
  {
    route: '/api/internal/jobs/:id',
    method: 'patch',
    handler: './runtime/server/api/internal/jobs/[id].patch',
  },
  {
    route: '/api/internal/jobs/:id/publish',
    method: 'post',
    handler: './runtime/server/api/internal/jobs/[id]/publish.post',
  },
  {
    route: '/api/public/jobs',
    method: 'get',
    handler: './runtime/server/api/public/jobs.get',
  },
  {
    route: '/api/public/jobs/:id',
    method: 'get',
    handler: './runtime/server/api/public/jobs/[id].get',
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
