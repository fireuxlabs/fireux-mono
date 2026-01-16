import type { Resolver } from '@nuxt/kit'
import type { Nuxt, NuxtPage } from 'nuxt/schema'

interface PageEntry {
  name: string
  path: string
  file: string
}

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  const pagesToInject: PageEntry[] = [
    {
      name: 'places',
      path: '/places',
      file: resolver.resolve('./runtime/pages/places/index.vue'),
    },
  ]

  nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
    for (const entry of pagesToInject) {
      const exists = pages.some((page) => page.path === entry.path)
      if (!exists) {
        pages.push({
          name: entry.name,
          path: entry.path,
          file: entry.file,
        })
      }
    }
  })
}
