import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'
import type { Resolver } from '@nuxt/kit'

export function configureLayouts(resolver: Resolver) {
  const dir = resolver.resolve('./runtime/layouts')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '**/*.vue',
    global: false,
    pathPrefix: true,
  })
}
