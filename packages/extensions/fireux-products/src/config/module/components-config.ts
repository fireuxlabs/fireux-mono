import type { Resolver } from '@nuxt/kit'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver) {
  registerComponentsDir(resolver, './runtime/product/components', {
    global: true,
    pathPrefix: true,
    prefix: 'Product',
    ignore: ['dev/**'],
  })

  registerComponentsDir(resolver, './runtime/product/components/dev', {
    global: true,
    pathPrefix: true,
    prefix: 'DevProduct',
  })
}
