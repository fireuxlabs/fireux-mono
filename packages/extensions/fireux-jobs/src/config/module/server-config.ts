// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: register bounded Agent and Professional routes.
// Concurrent edit — 2026-07-20 17:44 CEST — Repo Efficiency Pass 2 of 6: register trusted Jobs profile provisioners.
// Concurrent edit — 2026-07-21 12:53 CEST — Job reads: register bounded Directory and exact detail routes.
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
    route: '/api/internal/jobs/:id/applications',
    method: 'post',
    handler: './runtime/server/api/internal/jobs/[id]/applications.post',
  },
  {
    route: '/api/internal/job-applications',
    method: 'get',
    handler: './runtime/server/api/internal/job-applications.get',
  },
  {
    route: '/api/internal/job-applications/:id',
    method: 'patch',
    handler: './runtime/server/api/internal/job-applications/[id].patch',
  },
  {
    route: '/api/internal/job-engagements/:id',
    method: 'patch',
    handler: './runtime/server/api/internal/job-engagements/[id].patch',
  },
  {
    route: '/api/jobs',
    method: 'get',
    handler: './runtime/server/api/jobs.get',
  },
  {
    route: '/api/jobs/:id',
    method: 'get',
    handler: './runtime/server/api/jobs/[id].get',
  },
  {
    route: '/sitemaps/jobs.xml',
    method: 'get',
    handler: './runtime/server/sitemaps/jobs.xml.get',
  },
  {
    route: '/api/agents',
    method: 'get',
    handler: './runtime/server/api/agents/index.get',
  },
  {
    route: '/api/agents/:id',
    method: 'get',
    handler: './runtime/server/api/agents/[id].get',
  },
  {
    route: '/api/professionals',
    method: 'get',
    handler: './runtime/server/api/professionals/index.get',
  },
  {
    route: '/api/professionals/:id',
    method: 'get',
    handler: './runtime/server/api/professionals/[id].get',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
