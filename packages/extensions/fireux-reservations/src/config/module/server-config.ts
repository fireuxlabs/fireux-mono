import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/workspace/properties/:propertyId/reservations',
    method: 'get',
    handler: './runtime/server/api/workspace/properties/[propertyId]/reservations/index.get',
  },
  {
    route: '/api/workspace/properties/:propertyId/reservations',
    method: 'post',
    handler: './runtime/server/api/workspace/properties/[propertyId]/reservations/index.post',
  },
  {
    route: '/api/workspace/properties/:propertyId/reservations/:reservationId',
    method: 'get',
    handler: './runtime/server/api/workspace/properties/[propertyId]/reservations/[reservationId].get',
  },
  {
    route: '/api/workspace/properties/:propertyId/reservations/:reservationId',
    method: 'patch',
    handler: './runtime/server/api/workspace/properties/[propertyId]/reservations/[reservationId].patch',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
