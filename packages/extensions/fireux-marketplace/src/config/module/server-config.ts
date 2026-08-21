import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/marketplace-stores',
    method: 'get',
    handler: './runtime/server/api/marketplace-stores/index.get',
  },
  {
    route: '/api/marketplace-stores/:slug',
    method: 'get',
    handler: './runtime/server/api/marketplace-stores/[slug].get',
  },
  {
    route: '/api/marketplace/stores',
    method: 'get',
    handler: './runtime/server/api/marketplace/stores.get',
  },
  {
    route: '/api/marketplace/stores',
    method: 'post',
    handler: './runtime/server/api/marketplace/stores.post',
  },
  {
    route: '/api/marketplace/stores/:storeId',
    method: 'get',
    handler: './runtime/server/api/marketplace/stores/[storeId].get',
  },
  {
    route: '/api/marketplace/stores/:storeId',
    method: 'patch',
    handler: './runtime/server/api/marketplace/stores/[storeId].patch',
  },
  {
    route: '/api/marketplace/stores/:storeId/submit',
    method: 'post',
    handler: './runtime/server/api/marketplace/stores/[storeId]/submit.post',
  },
  {
    route: '/api/marketplace/stores/:storeId/offers',
    method: 'post',
    handler: './runtime/server/api/marketplace/stores/[storeId]/offers.post',
  },
  {
    route: '/api/marketplace/stores/:storeId/offers/:offerId',
    method: 'patch',
    handler: './runtime/server/api/marketplace/stores/[storeId]/offers/[offerId].patch',
  },
  {
    route: '/api/marketplace/stores/:storeId/offers/:offerId/transition',
    method: 'post',
    handler: './runtime/server/api/marketplace/stores/[storeId]/offers/[offerId]/transition.post',
  },
  {
    route: '/api/marketplace/orders',
    method: 'get',
    handler: './runtime/server/api/marketplace/orders.get',
  },
  {
    route: '/api/marketplace/orders',
    method: 'post',
    handler: './runtime/server/api/marketplace/orders.post',
  },
  {
    route: '/api/marketplace/orders/:orderId/transition',
    method: 'post',
    handler: './runtime/server/api/marketplace/orders/[orderId]/transition.post',
  },
  {
    route: '/api/admin/marketplace/stores',
    method: 'get',
    handler: './runtime/server/api/admin/marketplace/stores.get',
  },
  {
    route: '/api/admin/marketplace/stores/:storeId/moderate',
    method: 'post',
    handler: './runtime/server/api/admin/marketplace/stores/[storeId]/moderate.post',
  },
  {
    route: '/api/admin/marketplace/stores/:storeId/members',
    method: 'post',
    handler: './runtime/server/api/admin/marketplace/stores/[storeId]/members.post',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
