// Concurrent edit — 2026-07-21 22:29 CEST — Portfolio atomic attachment: register trusted onboarding completion.
// Concurrent edit — 2026-07-21 22:32 CEST — Workspace alignment — Property: register trusted onboarding completion.
import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/workspace/property/identity',
    method: 'patch',
    handler: './runtime/server/api/workspace/property/identity.patch',
  },
  {
    route: '/api/workspace/portfolio/identity',
    method: 'patch',
    handler: './runtime/server/api/workspace/portfolio/identity.patch',
  },
  {
    route: '/api/workspace/portfolio/team/members',
    method: 'get',
    handler: './runtime/server/api/workspace/portfolio/team/members.get',
  },
  {
    route: '/api/workspace/portfolio/team/members',
    method: 'post',
    handler: './runtime/server/api/workspace/portfolio/team/members.post',
  },
  {
    route: '/api/workspace/portfolio/team/members/:memberId',
    method: 'patch',
    handler:
      './runtime/server/api/workspace/portfolio/team/members/[memberId].patch',
  },
  {
    route: '/api/workspace/portfolio/team/members/:memberId',
    method: 'delete',
    handler:
      './runtime/server/api/workspace/portfolio/team/members/[memberId].delete',
  },
  {
    route: '/api/workspace/portfolio/team/roles',
    method: 'post',
    handler: './runtime/server/api/workspace/portfolio/team/roles.post',
  },

  {
    route: '/api/workspace/property/team/members',
    method: 'get',
    handler: './runtime/server/api/workspace/property/team/members.get',
  },
  {
    route: '/api/workspace/property/team/members',
    method: 'post',
    handler: './runtime/server/api/workspace/property/team/members.post',
  },
  {
    route: '/api/workspace/property/team/members/:memberId',
    method: 'patch',
    handler:
      './runtime/server/api/workspace/property/team/members/[memberId].patch',
  },
  {
    route: '/api/workspace/property/team/members/:memberId',
    method: 'delete',
    handler:
      './runtime/server/api/workspace/property/team/members/[memberId].delete',
  },
  {
    route: '/api/workspace/property/team/roles',
    method: 'post',
    handler: './runtime/server/api/workspace/property/team/roles.post',
  },

  {
    route: '/api/properties',
    method: 'get',
    handler: './runtime/server/api/properties/index.get',
  },
  {
    route: '/api/properties/onboarding/complete',
    method: 'post',
    handler: './runtime/server/api/properties/onboarding/complete.post',
  },
  {
    route: '/api/portfolios',
    method: 'get',
    handler: './runtime/server/api/portfolios/index.get',
  },
  {
    route: '/api/portfolios/:id',
    method: 'get',
    handler: './runtime/server/api/portfolios/[id].get',
  },
  {
    route: '/api/portfolios/onboarding/complete',
    method: 'post',
    handler: './runtime/server/api/portfolios/onboarding/complete.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
