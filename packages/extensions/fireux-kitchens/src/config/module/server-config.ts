import type { Resolver } from '@nuxt/kit'
import {
  registerServerHandlers,
  type FireuxServerHandler,
} from 'fireux-core/config/module/module-helpers'

const serverHandlers = [
  {
    route: '/api/console/kitchen/menus/upload',
    method: 'post',
    handler: './runtime/server/api/console/kitchen/menus/upload.post',
  },
  {
    route: '/api/console/kitchen/menus/upload',
    method: 'options',
    handler: './runtime/server/api/console/kitchen/menus/upload.options',
  },
  {
    route: '/api/console/kitchen/menus/upload/availability',
    method: 'get',
    handler: './runtime/server/api/console/kitchen/menus/upload/availability.get',
  },
  {
    route: '/api/console/kitchen/menus/upload/availability',
    method: 'options',
    handler:
      './runtime/server/api/console/kitchen/menus/upload/availability.options',
  },
] satisfies FireuxServerHandler[]

export function configureServer(resolver: Resolver) {
  registerServerHandlers(resolver, serverHandlers)
}
