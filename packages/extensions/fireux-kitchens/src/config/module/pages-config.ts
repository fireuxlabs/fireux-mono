import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { ensureRuntimeLayer } from 'fireux-core/config/module/runtime-layer'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  ensureRuntimeLayer(resolver, nuxt)

  nuxt.hook('pages:extend', (pages) => {
    const path = '/kitchens/:id/menu'
    const file = resolver.resolve('./runtime/pages/kitchens/[id]/menu.vue')

    const exists = pages.some((page) => page.path === path || page.file === file)
    if (exists) return

    pages.push({
      name: 'KitchenPublicMenuPage',
      path,
      file,
    })
  })
}
