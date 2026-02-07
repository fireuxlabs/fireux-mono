import type { Resolver } from '@nuxt/kit'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import type { Nuxt } from '@nuxt/schema'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)
  nuxt.hook('pages:extend', (pages) => {
    pages.push(
      {
        name: 'admin-products',
        path: '/admin/products',
        file: resolver.resolve('./runtime/pages/admin/products/index.vue'),
      },
      {
        name: 'admin-products-create',
        path: '/admin/products/create',
        file: resolver.resolve('./runtime/pages/admin/products/create.vue'),
      },
      {
        name: 'admin-licenses',
        path: '/admin/licenses',
        file: resolver.resolve('./runtime/pages/admin/licenses/index.vue'),
      }
    )
  })
}
