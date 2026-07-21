import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: register trusted Company materialization.
const serverHandlers = [
  {
    route: '/api/companies/materialize',
    method: 'post',
    handler: './runtime/server/api/companies/materialize.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
