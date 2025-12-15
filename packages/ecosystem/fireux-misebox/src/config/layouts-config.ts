import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: Resolver, nuxt: Nuxt) {
  void nuxt
  const dir = resolver.resolve('./runtime/layouts')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })
}
