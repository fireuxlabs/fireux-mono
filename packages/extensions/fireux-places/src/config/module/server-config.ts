import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: register Place reads and the trusted configuration mutation boundary.
// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: register authenticated idempotent Place materialization.
// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: register bounded public Place reads.
// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: register preview and trusted completion seams.
// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: register the trusted root removal boundary.
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
    route: '/api/places/onboarding/preview',
    method: 'post',
    handler: './runtime/server/api/places/onboarding/preview.post',
  },
  {
    route: '/api/places/onboarding/complete',
    method: 'post',
    handler: './runtime/server/api/places/onboarding/complete.post',
  },
  {
    route: '/api/places/onboarding/manual',
    method: 'post',
    handler: './runtime/server/api/places/onboarding/manual.post',
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
  {
    route: '/api/places/:placeId',
    method: 'delete',
    handler: './runtime/server/api/places/[placeId].delete',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
