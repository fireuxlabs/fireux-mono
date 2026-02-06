import type { Resolver } from '@nuxt/kit'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'
import type { Nuxt } from '@nuxt/schema'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)
  nuxt.hook('pages:extend', (pages) => {
    pages.push(
      {
        name: 'admin-blogs',
        path: '/admin/blogs',
        file: resolver.resolve('./runtime/pages/admin/blogs/index.vue'),
      },
      {
        name: 'admin-blogs-create',
        path: '/admin/blogs/create',
        file: resolver.resolve('./runtime/pages/admin/blogs/create.vue'),
      }
    )
  })
}
