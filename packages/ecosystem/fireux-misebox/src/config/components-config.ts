import type { Resolver } from '@nuxt/kit'
import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string } = {}
) {
  const dir = resolver.resolve('./runtime/components')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    prefix: options.prefix ?? 'Mise',
    global: false,
    pathPrefix: true,
  })
}
