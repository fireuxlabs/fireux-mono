import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: register bounded reads alongside trusted materialization.
const serverHandlers = [
  {
    route: '/api/companies',
    method: 'get',
    handler: './runtime/server/api/companies/index.get',
  },
  {
    route: '/api/companies/:companyId',
    method: 'get',
    handler: './runtime/server/api/companies/[companyId].get',
  },
  {
    route: '/api/companies/materialize',
    method: 'post',
    handler: './runtime/server/api/companies/materialize.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
