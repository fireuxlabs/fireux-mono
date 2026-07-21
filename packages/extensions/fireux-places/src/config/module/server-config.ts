import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: register Place reads and the trusted configuration mutation boundary.
// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: register authenticated idempotent Place materialization.
// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: register bounded public Place reads.
const serverHandlers = [
  {
    route: '/api/places',
    method: 'get',
    handler: './runtime/server/api/places/index.get',
  },
  {
    route: '/api/places/autocomplete',
    method: 'get',
    handler: './runtime/server/api/places/autocomplete.get',
  },
  {
    route: '/api/places/details',
    method: 'get',
    handler: './runtime/server/api/places/details.get',
  },
  {
    route: '/api/places/logo',
    method: 'get',
    handler: './runtime/server/api/places/logo.get',
  },
  {
    route: '/api/places/ensure',
    method: 'post',
    handler: './runtime/server/api/places/ensure.post',
  },
  {
    route: '/api/places/:placeId',
    method: 'get',
    handler: './runtime/server/api/places/[placeId].get',
  },
  {
    route: '/api/places/:placeId',
    method: 'patch',
    handler: './runtime/server/api/places/[placeId].patch',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
