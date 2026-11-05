import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

// Concurrent edit — 2026-07-21 14:30 CEST — Business public projection: register bounded reads alongside trusted materialization.
const serverHandlers = [
  { route: '/api/workspace/business', method: 'get', handler: './runtime/server/api/workspace/business/index.get' },
  { route: '/api/workspace/business', method: 'post', handler: './runtime/server/api/workspace/business/index.post' },
  { route: '/api/workspace/business', method: 'patch', handler: './runtime/server/api/workspace/business/index.patch' },
  { route: '/api/workspace/business/team', method: 'get', handler: './runtime/server/api/workspace/business/team/index.get' },
  { route: '/api/workspace/business/team', method: 'post', handler: './runtime/server/api/workspace/business/team/index.post' },
  { route: '/api/workspace/business/team', method: 'patch', handler: './runtime/server/api/workspace/business/team/index.patch' },
  { route: '/api/workspace/business/team', method: 'delete', handler: './runtime/server/api/workspace/business/team/index.delete' },
  {
    route: '/api/businesses',
    method: 'get',
    handler: './runtime/server/api/businesses/index.get',
  },
  {
    route: '/api/businesses/:businessId',
    method: 'get',
    handler: './runtime/server/api/businesses/[businessId].get',
  },
  {
    route: '/api/businesses/materialize',
    method: 'post',
    handler: './runtime/server/api/businesses/materialize.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
