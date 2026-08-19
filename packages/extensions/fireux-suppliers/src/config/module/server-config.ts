// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: register the trusted completion endpoint.
import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/suppliers',
    method: 'get',
    handler: './runtime/server/api/suppliers/index.get',
  },
  {
    route: '/api/suppliers/:id',
    method: 'get',
    handler: './runtime/server/api/suppliers/[id].get',
  },
  {
    route: '/api/suppliers/onboarding/complete',
    method: 'post',
    handler: './runtime/server/api/suppliers/onboarding/complete.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
