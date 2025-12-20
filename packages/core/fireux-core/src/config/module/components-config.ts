import { addComponentsDir, type Resolver } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureComponents(resolver: Resolver) {
  const dir = resolver.resolve('./runtime/components')
  if (!existsSync(dir)) return

  addComponentsDir({
    path: dir,
    pattern: '**/*.vue',
    global: false,
    pathPrefix: true,
  })
}
