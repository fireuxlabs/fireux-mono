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
  {
    route: '/api/workspace/supplier/update',
    method: 'patch',
    handler: './runtime/server/api/workspace/supplier/update.patch',
  },
  {
    route: '/api/workspace/supplier/team/members',
    method: 'get',
    handler: './runtime/server/api/workspace/supplier/team/members.get',
  },
  {
    route: '/api/workspace/supplier/team/members',
    method: 'post',
    handler: './runtime/server/api/workspace/supplier/team/members.post',
  },
  {
    route: '/api/workspace/supplier/team/members/:memberId',
    method: 'patch',
    handler:
      './runtime/server/api/workspace/supplier/team/members/[memberId].patch',
  },
  {
    route: '/api/workspace/supplier/team/members/:memberId',
    method: 'delete',
    handler:
      './runtime/server/api/workspace/supplier/team/members/[memberId].delete',
  },
  {
    route: '/api/workspace/supplier/team/roles',
    method: 'post',
    handler: './runtime/server/api/workspace/supplier/team/roles.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
