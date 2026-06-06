import { addServerHandler, type Resolver } from '@nuxt/kit'

export function configureServer(resolver: Resolver) {
  addServerHandler({
    route: '/api/kitchens/public-menu/prepare-language',
    handler: resolver.resolve(
      './runtime/server/api/kitchens/public-menu/prepare-language.post'
    ),
  })
}
