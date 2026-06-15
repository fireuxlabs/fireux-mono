import { addServerHandler, type Resolver } from '@nuxt/kit'

export function configureServer(resolver: Resolver) {
  addServerHandler({
    route: '/api/console/kitchen/menus/upload-source',
    method: 'post',
    handler: resolver.resolve(
      './runtime/server/api/console/kitchen/menus/upload-source.post'
    ),
  })
  addServerHandler({
    route: '/api/console/kitchen/menus/upload-source',
    method: 'options',
    handler: resolver.resolve(
      './runtime/server/api/console/kitchen/menus/upload-source.options'
    ),
  })
  addServerHandler({
    route: '/api/console/kitchen/menus/upload-source/availability',
    method: 'get',
    handler: resolver.resolve(
      './runtime/server/api/console/kitchen/menus/upload-source/availability.get'
    ),
  })
  addServerHandler({
    route: '/api/console/kitchen/menus/upload-source/availability',
    method: 'options',
    handler: resolver.resolve(
      './runtime/server/api/console/kitchen/menus/upload-source/availability.options'
    ),
  })
}
