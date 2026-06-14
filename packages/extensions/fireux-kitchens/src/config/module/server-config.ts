import { addServerHandler, type Resolver } from '@nuxt/kit'

export function configureServer(resolver: Resolver) {
  addServerHandler({
    route: '/api/console/kitchen/menus/upload-source',
    handler: resolver.resolve(
      './runtime/server/api/console/kitchen/menus/upload-source.post'
    ),
  })
  addServerHandler({
    route: '/api/console/kitchen/menus/upload-source/availability',
    handler: resolver.resolve(
      './runtime/server/api/console/kitchen/menus/upload-source/availability.get'
    ),
  })
}
